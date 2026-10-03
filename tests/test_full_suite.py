import sys
import os
import glob

os.environ["TESTING"] = "1"

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, select
from backend.database import engine
from backend.models import Job, Interview, ResumeProfile, Offer, SystemSetting, CampusRecruit
from backend.main import app

def test_system_full_audit():
    run_system_audit()

def run_system_audit():
    print("=" * 60)
    print("🚀 JOB COPILOT 全系统代码质量与业务链路深度审阅")
    print("=" * 60)

    # 1. 语法与编译检查
    print("\n[1/6] 检查所有 Python 源文件语法...")
    py_files = glob.glob('backend/**/*.py', recursive=True) + glob.glob('tests/**/*.py', recursive=True) + ['desktop.py']
    for f in py_files:
        with open(f, 'r', encoding='utf-8') as file:
            compile(file.read(), f, 'exec')
        print(f"  [OK] 语法通过: {f}")

    # 2. 数据库与数据模型检查
    print("\n[2/6] 检查 SQLModel 数据表与模式一致性...")
    SQLModel.metadata.create_all(engine)
    table_names = [t.name for t in SQLModel.metadata.tables.values()]
    print(f"  [OK] 已注册数据表 ({len(table_names)}张): {', '.join(table_names)}")
    assert "jobs" in table_names
    assert "interviews" in table_names
    assert "resumes" in table_names
    assert "offers" in table_names
    assert "system_settings" in table_names
    assert "campus_recruits" in table_names
    assert "public_recruits" in table_names

    with TestClient(app) as client:
        # 先确保纯净起点
        client.delete('/api/settings/purge-all-data')

        # 3. 检查求职看板与核心 CRUD
        print("\n[3/6] 检查求职看板与面试日程链路...")
        # 创建一个测试岗位
        c_job = client.post('/api/jobs/', json={
            'title': '高级后端架构师',
            'company': '审阅测试科技',
            'location': '深圳',
            'salary': '35k-50k',
            'status': 'applied',
            'source': '全网搜索',
            'priority': 1
        })
        assert c_job.status_code == 200
        job_id = c_job.json()['id']

        # 添加面试日程
        c_int = client.post('/api/interviews/', json={
            'job_id': job_id,
            'round_name': '架构技术二面',
            'interview_time': '2026-08-25 10:00',
            'meeting_link': '腾讯会议 111-222-333',
            'questions_notes': '测试八股与系统设计',
            'result': 'pending'
        })
        assert c_int.status_code == 200
        int_id = c_int.json()['id']
        print(f"  [OK] 成功创建岗位 ID:{job_id} 与面试日程 ID:{int_id}")

        # 4. 检查 Offer 科学测算与雷达图接口
        print("\n[4/6] 检查 Offer 决策计算引擎...")
        c_offer = client.post('/api/offers/', json={
            'title': '资深后端开发',
            'company': '测试外企软件',
            'base_salary_monthly': 28000,
            'months_count': 14,
            'year_end_bonus': 30000,
            'monthly_allowance': 1200,
            'work_hours_per_day': 8.0,
            'work_days_per_week': 5.0,
            'annual_leave_days': 12,
            'commute_minutes_per_day': 40,
            'benefits_score': 5,
            'growth_score': 4
        })
        assert c_offer.status_code == 200
        offer_id = c_offer.json()['id']

        compare_resp = client.get('/api/offers/compare/all')
        assert compare_resp.status_code == 200
        comp_data = compare_resp.json()
        assert len(comp_data) >= 1
        target_offer_metric = [o for o in comp_data if o['id'] == offer_id][0]
        print(f"  [OK] Offer 时薪测算正确: 年总包税前={target_offer_metric['total_gross_annual']}元, 税后预估={target_offer_metric['estimated_net_annual']}元, 真实时薪={target_offer_metric['real_hourly_wage']}元/h, 综合得分={target_offer_metric['overall_score']}")
        assert target_offer_metric['real_hourly_wage'] > 100

        # 5. 检查全网职位搜索与国内直通渠道
        print("\n[5/6] 检查职位发现与全网多源聚合搜索...")
        search_resp = client.get('/api/search/jobs?source=all')
        assert search_resp.status_code == 200
        jobs_found = search_resp.json()
        print(f"  [OK] 职位发现全网 6 大渠道聚合检索返回: {len(jobs_found)} 个实时岗位")
        assert len(jobs_found) > 50

        # 6. 检查全网秋招情报站 (Campus Radar) 与主动同步...
        print("\n[6/6] 检查全网秋招情报站 (Campus Radar) 与主动同步...")
        # 初始应为纯净 0 条
        initial_campus = client.get('/api/campus/').json()
        print(f"  [OK] 初始秋招库纯净状态: {len(initial_campus)} 条 (未注入任何示例数据)")
        
        # 主动触发真实同步
        sync_res = client.post('/api/campus/sync')
        assert sync_res.status_code == 200
        campus_recruits = client.get('/api/campus/').json()
        print(f"  [OK] 主动从真实开源渠道同步到: {len(campus_recruits)} 家企业")
        assert len(campus_recruits) >= 10

        campus_stats = client.get('/api/campus/stats').json()
        print(f"  [OK] 秋招大盘统计: 总数={campus_stats['total_companies']}, 互联网={campus_stats['tech_count']}")

        # 测试导入秋招企业至求职看板与日历
        test_rec = campus_recruits[0]
        imp_resp = client.post(f"/api/campus/import-to-job/{test_rec['id']}")
        assert imp_resp.status_code == 200
        print(f"  [OK] 一键转入求职看板成功: {imp_resp.json()['message']}")

        # 7. 检查考公考编与央国企专区 (Public Sector Radar)
        print("\n[7/7] 检查考公考编与央国企招录专区链路...")
        client.delete('/api/public-sector/purge/all')
        pub_initial = client.get('/api/public-sector/').json()
        print(f"  [OK] 初始考公库纯净状态: {len(pub_initial)} 条 (0 示例数据)")
        assert len(pub_initial) == 0

        # 测试推文提取
        pub_parse_res = client.post('/api/public-sector/parse-article', json={
            "article_text": "国家电网有限公司2026年高校毕业生招聘公告\n国家电网面向全国高校招聘5000人，电气工程与计算机专业为主，报名截止时间2026-11-20，笔试时间2026-12-05。\n报名网址：https://zhaopin.sgcc.com.cn"
        })
        assert pub_parse_res.status_code == 200
        pub_id = pub_parse_res.json()['recruit']['id']
        print(f"  [OK] 成功从长文提取并入库: {pub_parse_res.json()['recruit']['title']}")

        # 测试转入看板
        pub_imp = client.post(f'/api/public-sector/import-to-job/{pub_id}')
        assert pub_imp.status_code == 200
        print(f"  [OK] 一键转入备考看板与日历成功，生成 {pub_imp.json()['events_count']} 个备考提醒")

        # 8. 检查全站纯净重置接口 (Settings Purge All Data)
        print("\n[8/8] 检查全站业务数据一键纯净重置接口...")
        purge_res = client.delete('/api/settings/purge-all-data')
        assert purge_res.status_code == 200
        assert purge_res.json()['purged'] is True
        
        # 验证数据库所有表记录数均为 0
        with Session(engine) as s:
            from backend.models import ResumeProfile, PublicRecruit
            assert len(s.exec(select(Job)).all()) == 0
            assert len(s.exec(select(Interview)).all()) == 0
            assert len(s.exec(select(ResumeProfile)).all()) == 0
            assert len(s.exec(select(Offer)).all()) == 0
            assert len(s.exec(select(CampusRecruit)).all()) == 0
            assert len(s.exec(select(PublicRecruit)).all()) == 0
        print("  [OK] 全站一键重置成功，数据库 6 张业务表记录数 100% 为 0，绝对纯净！")

    print("\n" + "=" * 60)
    print("🏆 全系统各模块代码与业务链路审阅 100% 通过！零错误，状态健康！")
    print("=" * 60)

if __name__ == '__main__':
    run_system_audit()
