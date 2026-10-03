from typing import Dict, Any
from backend.models import Offer

class OfferCalculatorService:
    @staticmethod
    def calculate_offer_metrics(offer: Offer) -> Dict[str, Any]:
        """计算 Offer 的全套量化指标与雷达图维度得分"""
        
        # 1. 基础薪资计算 (安全降级取值，杜绝 None 导致 TypeError)
        base_salary_monthly = float(offer.base_salary_monthly or 0.0)
        months_count = float(offer.months_count or 12.0)
        monthly_allowance = float(offer.monthly_allowance or 0.0)
        year_end_bonus = float(offer.year_end_bonus or 0.0)

        work_hours_per_day = max(1.0, float(offer.work_hours_per_day or 8.0))
        work_days_per_week = min(7.0, max(1.0, float(offer.work_days_per_week or 5.0)))
        annual_leave_days = max(0.0, float(offer.annual_leave_days or 5.0))
        commute_minutes = max(0.0, float(offer.commute_minutes_per_day or 0.0))
        benefits_score = min(5.0, max(1.0, float(offer.benefits_score or 3.0)))
        growth_score = min(5.0, max(1.0, float(offer.growth_score or 3.0)))

        base_annual = base_salary_monthly * months_count
        allowance_annual = monthly_allowance * 12.0
        bonus_annual = year_end_bonus
        total_gross_annual = max(0.0, base_annual + allowance_annual + bonus_annual)
        
        # 2. 预估税后到手年薪 (速算阶梯预估：五险一金个人承担~17.5% + 个税)
        monthly_avg = total_gross_annual / 12.0
        if monthly_avg <= 8000:
            tax_rate_effective = 0.05
        elif monthly_avg <= 15000:
            tax_rate_effective = 0.12
        elif monthly_avg <= 25000:
            tax_rate_effective = 0.17
        elif monthly_avg <= 40000:
            tax_rate_effective = 0.22
        else:
            tax_rate_effective = 0.28
            
        estimated_net_annual = total_gross_annual * (1.0 - tax_rate_effective)
        estimated_net_monthly = estimated_net_annual / 12.0
        
        # 3. 实际年工作总时长计算
        nominal_work_days = work_days_per_week * 52.0
        statutory_holidays = 11.0 # 法定节假日11天
        actual_work_days = max(120.0, nominal_work_days - statutory_holidays - annual_leave_days)
        annual_work_hours = actual_work_days * work_hours_per_day
        
        # 4. 真实时薪计算
        real_hourly_wage = (estimated_net_annual / annual_work_hours) if annual_work_hours > 0 else 0.0
        
        # 5. 每日通勤时间成本折算
        daily_commute_cost = (commute_minutes / 60.0) * real_hourly_wage
        annual_commute_hours = (commute_minutes / 60.0) * actual_work_days
        
        # 6. 雷达图 5 大维度标准化打分 (0 - 100)
        # 维度 1: 薪酬总包得分 (以年薪 50万 为满分锚点)
        score_salary = min(100.0, max(20.0, (total_gross_annual / 500000.0) * 100.0))
        
        # 维度 2: 时薪与 WLB 得分 (以税后时薪 200元 为满分锚点)
        score_wlb = min(100.0, max(20.0, (real_hourly_wage / 200.0) * 100.0))
        
        # 维度 3: 福利保障
        score_benefits = min(100.0, max(20.0, benefits_score * 20.0))
        
        # 维度 4: 通勤与精力 (通勤<=20分钟满分，>=120分钟得20分)
        score_commute = min(100.0, max(20.0, 100.0 - ((commute_minutes - 20.0) / 100.0) * 80.0 if commute_minutes > 20.0 else 100.0))
        
        # 维度 5: 平台与成长前景
        score_growth = min(100.0, max(20.0, growth_score * 20.0))
        
        # 综合加权总分 (薪资 30%, WLB时薪 25%, 发展 20%, 福利 15%, 通勤 10%)
        overall_composite_score = (
            score_salary * 0.30 +
            score_wlb * 0.25 +
            score_growth * 0.20 +
            score_benefits * 0.15 +
            score_commute * 0.10
        )

        return {
            "id": offer.id,
            "title": offer.title,
            "company": offer.company,
            "total_gross_annual": round(total_gross_annual, 2),
            "estimated_net_annual": round(estimated_net_annual, 2),
            "estimated_net_monthly": round(estimated_net_monthly, 2),
            "annual_work_hours": round(annual_work_hours, 1),
            "real_hourly_wage": round(real_hourly_wage, 2),
            "annual_commute_hours": round(annual_commute_hours, 1),
            "daily_commute_cost": round(daily_commute_cost, 2),
            "radar_scores": {
                "salary": round(score_salary, 1),
                "wlb": round(score_wlb, 1),
                "benefits": round(score_benefits, 1),
                "commute": round(score_commute, 1),
                "growth": round(score_growth, 1)
            },
            "overall_score": round(overall_composite_score, 1)
        }
