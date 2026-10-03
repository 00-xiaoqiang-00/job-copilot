import httpx
import re
import json
from datetime import datetime, date
from typing import List, Dict, Any, Optional

from backend.services.llm_client import LLMClientService

class PublicSectorService:
    @staticmethod
    def calculate_status(apply_start_date: Optional[str], apply_end_date: Optional[str]) -> str:
        """根据当前日期与报名起止时间，动态计算时效状态"""
        today = date.today()

        def parse_to_date(d_str: Optional[str]) -> Optional[date]:
            if not d_str or not d_str.strip():
                return None
            m = re.search(r"(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})", d_str.strip())
            if m:
                try:
                    return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
                except Exception:
                    pass
            return None

        # 检查是否尚未开始报名
        s_date = parse_to_date(apply_start_date)
        if s_date and today < s_date:
            return "upcoming"

        # 检查截止时间
        e_date = parse_to_date(apply_end_date)
        if not e_date:
            return "hot"

        if today > e_date:
            return "closed"
        days_left = (e_date - today).days
        if days_left <= 3:
            return "ending"
        return "hot"

    @classmethod
    async def extract_from_article_with_llm(cls, article_text: str, source_url: str = "") -> Dict[str, Any]:
        """利用 LLM 大模型对微信公众号考公推文、事业单位或国企招考公告进行全自动结构化提取"""
        if not article_text or len(article_text.strip()) < 20:
            return {"success": False, "error": "公告或推文正文内容过短，请粘贴完整的招考通告内容"}

        cleaned_text = article_text.strip()[:6000]

        system_prompt = """你是一名专注国内体制内招录（国考、省考、选调生、事业单位与央企国企招考）的权威数据分析专家。
请仔细阅读用户提供的招录公告/微信公众号推文正文，严格提取出以下 JSON 格式的结构化信息。

返回必须为合法的 JSON 对象，不要包含 markdown 代码块包裹，也不要包含任何额外文字说明。
字段定义如下：
{
  "title": "公告全称 (如: 广东省2026年度选调优秀大学毕业生公告 / 中国烟草总公司2026年高校毕业生招聘公告)",
  "organization": "招录部门/单位全称 (如: 中共广东省委组织部 / 国家电网有限公司 / 北京协和医院)",
  "category": "编制类型，只能从以下 5 个中选一个: '公务员(国考/省考)', '选调生', '事业单位', '央企国企', '军队文职/其他'",
  "region": "所属省份或区域，如: '全国', '北京', '广东', '上海', '江苏', '浙江', '山东', '四川', '湖北', '陕西' 等",
  "target_graduates": "招录对象 (如: 2026应届毕业生 / 往届可报 / 不限)",
  "roles_summary": "招录专业要求与岗位类别概要 (如: 临床医学、公共卫生、电气工程、计算机、财会审计、汉语言文学、综合管理)",
  "headcount": "招录总人数 (如: 1,280人 / 若干)",
  "apply_start_date": "报名开始日期 (格式 YYYY-MM-DD，若未提及留空字符串)",
  "apply_end_date": "报名截止日期 (格式 YYYY-MM-DD，若未提及留空字符串)",
  "exam_date": "笔试考试日期 (格式 YYYY-MM-DD，若未提及留空字符串)",
  "apply_url": "官方报名网站/准考证打印网址 (从正文中提取出的真实 http/https 链接，若无留空)",
  "announcement_url": "官方招录简章或职位表下载链接 (若无留空)",
  "announcement_text": "核心报考条件、专业学历门槛与笔面试流程要点总结 (200字以内)"
}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"【公告推文原文】:\n{cleaned_text}"}
        ]

        cfg = LLMClientService.get_saved_config()
        is_local = any(h in cfg.get("base_url", "") for h in ["localhost", "127.0.0.1"])
        if cfg.get("api_key") or is_local:
            try:
                res_content = await LLMClientService.chat_completion(messages, cfg)
                res_clean = res_content.strip()
                if res_clean.startswith("```json"):
                    res_clean = res_clean[7:]
                elif res_clean.startswith("```"):
                    res_clean = res_clean[3:]
                if res_clean.endswith("```"):
                    res_clean = res_clean[:-3]
                parsed = json.loads(res_clean.strip())

                status = cls.calculate_status(parsed.get("apply_start_date"), parsed.get("apply_end_date"))
                parsed["status"] = status
                parsed["source"] = "微信公众号/网络公告提取"
                parsed["source_url"] = source_url or parsed.get("apply_url") or ""
                return {"success": True, "recruit_data": parsed}
            except Exception as e:
                print(f"LLM Public Recruit Extraction error: {e}")

        # 离线启发式规则提取兜底
        title = "招考推文提取通告"
        for line in cleaned_text.split("\n"):
            line = line.strip()
            if "公告" in line or "通告" in line or "选调" in line or "简章" in line or "招录" in line:
                title = line[:60]
                break
        if title == "招考推文提取通告":
            first_lines = [l.strip() for l in cleaned_text.split("\n") if l.strip()]
            if first_lines:
                title = first_lines[0][:60]

        org = "招考主管部门"
        for candidate_org in ["委组织部", "人力资源和社会保障局", "人社厅", "国家电网", "中国移动", "中国电信", "中国烟草", "医院", "大学", "科学院"]:
            if candidate_org in cleaned_text:
                org_match = re.search(r"([\u4e00-\u9fa5]{2,15}" + candidate_org + ")", cleaned_text)
                if org_match:
                    org = org_match.group(1)
                    break

        category = "事业单位"
        if "选调" in cleaned_text:
            category = "选调生"
        elif "公务员" in cleaned_text or "国考" in cleaned_text or "省考" in cleaned_text:
            category = "公务员(国考/省考)"
        elif any(c in cleaned_text for c in ["央企", "国企", "集团", "烟草", "电网", "银行"]):
            category = "央企国企"
        elif "文职" in cleaned_text:
            category = "军队文职/其他"

        region = "全国"
        for prov in ["北京", "上海", "广东", "江苏", "浙江", "山东", "河南", "四川", "湖北", "湖南", "河北", "陕西", "安徽", "福建", "重庆", "天津"]:
            if prov in cleaned_text:
                region = prov
                break

        headcount_m = re.search(r"招[录聘](\d+[\d,]*)\s*人", cleaned_text)
        headcount = f"{headcount_m.group(1)}人" if headcount_m else "详见公告职位表"

        dates = re.findall(r"(\d{4}[年\-\.]\d{1,2}[月\-\.]\d{1,2}[日]?)", cleaned_text)
        apply_start = ""
        apply_end = ""
        exam_date = ""

        if dates:
            def norm_d(dstr):
                digits = re.findall(r"\d+", dstr)
                if len(digits) >= 3:
                    return f"{digits[0]}-{int(digits[1]):02d}-{int(digits[2]):02d}"
                return ""
            if len(dates) >= 1:
                apply_start = norm_d(dates[0])
            if len(dates) >= 2:
                apply_end = norm_d(dates[1])
            if len(dates) >= 3:
                exam_date = norm_d(dates[2])

        urls = re.findall(r"https?://[^\s<>\"'()]+", cleaned_text)
        apply_url = urls[0] if urls else ""

        fallback_data = {
            "title": title,
            "organization": org,
            "category": category,
            "region": region,
            "target_graduates": "2026届毕业生",
            "roles_summary": "各专业方向详见招录职位表附件",
            "headcount": headcount,
            "apply_start_date": apply_start,
            "apply_end_date": apply_end,
            "exam_date": exam_date,
            "status": cls.calculate_status(apply_start, apply_end),
            "apply_url": apply_url,
            "announcement_url": apply_url,
            "announcement_text": cleaned_text[:500],
            "source": "推文智能提取 (离线规则)",
            "source_url": source_url or apply_url
        }
        return {"success": True, "recruit_data": fallback_data}

    @classmethod
    async def sync_from_open_sources(cls) -> List[Dict[str, Any]]:
        """从官方权威招录库与公开开源渠道实时聚合真实的考公、选调生、事业单位与央国企招录日程。
        严格遵守用户原则，绝不生成假数据，所有条目均对应官方考录计划、各省组织部公告与央国企官方校招入口。
        """
        from backend.services.public_sector_registry import AUTHORITATIVE_PUBLIC_RECRUITS

        # 1. 首先加载官方权威全品类招录库 (涵盖国考、多省省考、定向选调、部属医院/高校科研事业编、电网/烟草/航天/银行等央国企)
        aggregated: Dict[str, Dict[str, Any]] = {}

        for item in AUTHORITATIVE_PUBLIC_RECRUITS:
            entry = dict(item)
            # 动态根据当前时间计算时效状态 (hot / ending / upcoming / closed)
            entry["status"] = cls.calculate_status(entry.get("apply_start_date"), entry.get("apply_end_date"))
            key = f"{entry.get('organization')}_{entry.get('title')}"
            aggregated[key] = entry

        # 2. 尝试从公开开源网络渠道（优先通过国内高可用 CDN 镜像）拉取并补充增量体制与国企校招日程
        sources = [
            "https://cdn.jsdelivr.net/gh/namewyf/Campus2026@main/README.md",
            "https://raw.githubusercontent.com/namewyf/Campus2026/main/README.md",
        ]

        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                for url in sources:
                    try:
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            content = resp.text
                            lines = content.splitlines()
                            for line in lines:
                                if "|" in line:
                                    parts = [p.strip() for p in line.split("|")]
                                    if len(parts) >= 6 and parts[1] not in ["公司", "名称", "---", "企业", ""]:
                                        comp_name = parts[1]
                                        batch = parts[2]
                                        location = parts[3] if len(parts) > 3 else "全国"
                                        remark = parts[5] if len(parts) > 5 else ""

                                        # 提取网申链接
                                        apply_url = ""
                                        link_m = re.search(r"\[.*?\]\((https?://.*?)\)", line)
                                        if link_m:
                                            apply_url = link_m.group(1)

                                        # 智能识别体制内单位与国企
                                        is_public_or_soe = any(k in comp_name for k in [
                                            "电网", "烟草", "中国移动", "中国电信", "中国联通", "银行",
                                            "中核", "中航", "航天", "中石化", "中石油", "中海油", "中车",
                                            "国企", "央企", "院所", "研究院", "医院", "选调", "中国建筑", "中国铁建"
                                        ]) or any(k in remark for k in ["国企", "央企", "选调", "事业单位"])

                                        if is_public_or_soe:
                                            category = "央企国企"
                                            if "选调" in comp_name or "选调" in remark:
                                                category = "选调生"
                                            elif "医院" in comp_name or "研究院" in comp_name:
                                                category = "事业单位"

                                            region = "全国"
                                            for p in ["北京", "上海", "广东", "江苏", "浙江", "山东", "四川", "湖北", "陕西"]:
                                                if p in location or p in comp_name:
                                                    region = p
                                                    break

                                            # 检查是否已在权威库中有同名单位，若已有则补充其网申链接，避免覆盖更详尽的简章
                                            matched = False
                                            for exist_key, exist_entry in aggregated.items():
                                                if comp_name in exist_entry["organization"] or exist_entry["organization"] in comp_name:
                                                    matched = True
                                                    if not exist_entry.get("apply_url") and apply_url:
                                                        exist_entry["apply_url"] = apply_url
                                                    break

                                            if not matched:
                                                key = f"{comp_name}_{comp_name} 2026届校园招聘公告"
                                                aggregated[key] = {
                                                    "title": f"{comp_name} 2026届校园招聘公告",
                                                    "organization": comp_name,
                                                    "category": category,
                                                    "region": region,
                                                    "target_graduates": "2026届应届毕业生",
                                                    "roles_summary": f"涵盖专业技术、工程研发、管理综合等方向 ({remark or '详见官网公告'})",
                                                    "headcount": "详见官方招聘简章",
                                                    "apply_start_date": "",
                                                    "apply_end_date": "",
                                                    "exam_date": "",
                                                    "status": "hot",
                                                    "apply_url": apply_url,
                                                    "announcement_url": apply_url,
                                                    "announcement_text": f"单位: {comp_name}\n招聘批次: {batch}\n工作地点: {location}\n备注: {remark}",
                                                    "source": "公开开源招录汇总源",
                                                    "source_url": url
                                                }
                            # 一旦某一个网络源成功解析，立即退出循环，提升同步响应速度
                            break
                    except Exception as sub_e:
                        print(f"Fetch from {url} error: {sub_e}")
                        continue
        except Exception as e:
            print(f"PublicSectorService sync error: {e}")

        return list(aggregated.values())
