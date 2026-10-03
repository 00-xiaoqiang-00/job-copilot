import httpx
import re
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

from backend.services.job_registry import AUTHORITATIVE_JOBS

class JobSearcherService:
    @staticmethod
    def _clean_html(html_text: str) -> str:
        """快速清除 HTML 标签提取纯文本"""
        if not html_text:
            return ""
        soup = BeautifulSoup(html_text, "html.parser")
        return soup.get_text(separator="\n").strip()

    @staticmethod
    def _format_created_at(val: Any) -> str:
        """统一将各种格式的创建时间转换为 YYYY-MM-DD 字符串，杜绝前端类型崩溃"""
        if not val:
            return datetime.now().strftime("%Y-%m-%d")
        if isinstance(val, (int, float)):
            try:
                # 兼容 10 位秒或 13 位毫秒
                ts = val / 1000.0 if val > 10000000000 else float(val)
                return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
            except Exception:
                return str(val)
        val_str = str(val).strip()
        if "T" in val_str:
            return val_str.split("T")[0]
        if " " in val_str:
            return val_str.split(" ")[0]
        return val_str[:10]

    @staticmethod
    async def search_ruanyf(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 阮一峰《谁在招人？》开源专栏 (GitHub Issues) 拉取国内高质量招聘与远程职位"""
        url = "https://api.github.com/repos/ruanyf/weekly/issues?state=open&per_page=50"
        results = []
        try:
            async with httpx.AsyncClient(timeout=12.0, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/vnd.github.v3+json"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    issues = resp.json()
                    for issue in issues:
                        title = issue.get("title", "")
                        body = issue.get("body", "") or ""

                        # 过滤非招聘帖
                        if "周刊" in title and "招人" not in title and "招聘" not in title:
                            continue

                        # 关键词过滤
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            if kw not in title.lower() and kw not in body.lower():
                                continue

                        # 提取公司与岗位
                        company = "国内精选技术团队"
                        pos_title = title
                        if "【" in title and "】" in title:
                            parts = re.findall(r"【(.*?)】", title)
                            if parts:
                                company = parts[0]
                                pos_title = title.replace(f"【{parts[0]}】", "").strip()
                        elif "[" in title and "]" in title:
                            parts = re.findall(r"\[(.*?)\]", title)
                            if parts:
                                company = parts[0]
                                pos_title = title.replace(f"[{parts[0]}]", "").strip()

                        # 提取薪资
                        salary_match = re.search(r"(\d+k[-~至]\d+k|\d+[-~至]\d+K|\d+[-~至]\d+万|\d+[-~至]\d+W|\$\d+k[-~至]\$\d+k)", title + " " + body, re.IGNORECASE)
                        salary = salary_match.group(1) if salary_match else "面议"

                        # 提取工作地点
                        location = "全国/远程"
                        for loc in ["北京", "上海", "深圳", "广州", "杭州", "成都", "武汉", "南京", "西安", "苏州", "厦门", "远程", "Remote"]:
                            if loc in title or loc in body[:300]:
                                location = loc
                                break

                        results.append({
                            "title": pos_title or title,
                            "company": company,
                            "location": location,
                            "salary": salary,
                            "source": "阮一峰周刊 (谁在招人)",
                            "source_url": issue.get("html_url", ""),
                            "jd_text": body[:3000],
                            "tags": "国内招聘,开源社区,远程/大厂",
                            "created_at": issue.get("created_at", "")[:10]
                        })
        except Exception as e:
            print(f"Ruanyf Search Error: {e}")
        return results

    @staticmethod
    async def search_v2ex(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 V2EX 酷工作版块拉取最新技术岗位"""
        url = "https://www.v2ex.com/api/topics/show.json?node_name=jobs"
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    topics = resp.json()
                    for t in topics:
                        title = t.get("title", "")
                        content = t.get("content", "")
                        
                        # 关键词过滤
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            if kw not in title.lower() and kw not in content.lower():
                                continue
                        
                        company = "V2EX 社区招聘"
                        if "【" in title and "】" in title:
                            parts = re.findall(r"【(.*?)】", title)
                            if parts:
                                company = parts[0]
                        elif "[" in title and "]" in title:
                            parts = re.findall(r"\[(.*?)\]", title)
                            if parts:
                                company = parts[0]
                        
                        salary_match = re.search(r"(\d+k[-~至]\d+k|\d+[-~至]\d+K|\d+[-~至]\d+万|\d+[-~至]\d+W)", title + " " + content, re.IGNORECASE)
                        salary = salary_match.group(1) if salary_match else "面议"
                        
                        location = "全国/远程"
                        for loc in ["北京", "上海", "深圳", "广州", "杭州", "成都", "武汉", "南京", "远程", "Remote"]:
                            if loc in title or loc in content[:200]:
                                location = loc
                                break

                        results.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "salary": salary,
                            "source": "V2EX 酷工作",
                            "source_url": t.get("url", f"https://www.v2ex.com/t/{t.get('id')}"),
                            "jd_text": content,
                            "tags": "V2EX,技术直招,远程交流",
                            "created_at": JobSearcherService._format_created_at(t.get("created"))
                        })
        except Exception as e:
            print(f"V2EX Search Error: {e}")
        return results

    @staticmethod
    async def search_arbeitnow(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 Arbeitnow 开放职位接口拉取欧洲与全球开发者职位 (100+ 结构化岗位)"""
        url = "https://www.arbeitnow.com/api/job-board-api"
        results = []
        try:
            async with httpx.AsyncClient(timeout=12.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    for item in data[:60]:
                        title = item.get("title", "")
                        company = item.get("company_name", "")
                        desc = item.get("description", "")
                        tags_list = item.get("tags", [])
                        
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            searchable = f"{title} {company} {' '.join(tags_list)} {desc}".lower()
                            if kw not in searchable:
                                continue

                        is_remote = item.get("remote", False)
                        location = "Worldwide Remote" if is_remote else (item.get("location") or "Europe / Global")
                        clean_jd = JobSearcherService._clean_html(desc)

                        results.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "salary": "行业标准 / 详见JD",
                            "source": "Arbeitnow (欧洲/全球)",
                            "source_url": item.get("url", ""),
                            "jd_text": clean_jd[:3000],
                            "tags": ", ".join(tags_list[:5]) or "Tech,Software",
                            "created_at": JobSearcherService._format_created_at(item.get("created_at"))
                        })
        except Exception as e:
            print(f"Arbeitnow Search Error: {e}")
        return results

    @staticmethod
    async def search_jobicy(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 Jobicy API 拉取全球远程开发者职位"""
        url = "https://jobicy.com/api/v2/remote-jobs?count=50"
        results = []
        try:
            async with httpx.AsyncClient(timeout=12.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json().get("jobs", [])
                    for item in data:
                        title = item.get("jobTitle", "")
                        company = item.get("companyName", "")
                        desc = item.get("jobDescription", "")
                        
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            if kw not in title.lower() and kw not in desc.lower() and kw not in company.lower():
                                continue

                        salary_min = item.get("annualSalaryMin")
                        salary_max = item.get("annualSalaryMax")
                        salary_cur = item.get("salaryCurrency", "$")
                        try:
                            s_min = float(salary_min) if salary_min is not None else None
                            s_max = float(salary_max) if salary_max is not None else None
                            if s_min is not None and s_max is not None:
                                salary = f"{salary_cur}{s_min/1000:.0f}k-{s_max/1000:.0f}k"
                            else:
                                salary = "面议 / Competitive"
                        except (ValueError, TypeError):
                            salary = "面议 / Competitive"

                        clean_jd = JobSearcherService._clean_html(desc)

                        industry_raw = item.get("jobIndustry", "Engineering")
                        industry_str = ", ".join(industry_raw) if isinstance(industry_raw, list) else str(industry_raw)

                        results.append({
                            "title": title,
                            "company": company,
                            "location": item.get("jobGeo", "Anywhere Remote"),
                            "salary": salary,
                            "source": "Jobicy (全球远程)",
                            "source_url": item.get("url", ""),
                            "jd_text": clean_jd[:3000],
                            "tags": f"{industry_str}, Remote",
                            "created_at": item.get("pubDate", "")
                        })
        except Exception as e:
            print(f"Jobicy Search Error: {e}")
        return results

    @staticmethod
    async def search_remotive(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 Remotive API 拉取优质全职与远程软件工程师职位"""
        url = "https://remotive.com/api/remote-jobs?category=software-dev&limit=40"
        results = []
        try:
            async with httpx.AsyncClient(timeout=12.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    jobs = resp.json().get("jobs", [])
                    for item in jobs:
                        title = item.get("title", "")
                        company = item.get("company_name", "")
                        desc = item.get("description", "")
                        tags_list = item.get("tags", [])

                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            searchable = f"{title} {company} {' '.join(tags_list)} {desc}".lower()
                            if kw not in searchable:
                                continue

                        clean_jd = JobSearcherService._clean_html(desc)

                        results.append({
                            "title": title,
                            "company": company,
                            "location": item.get("candidate_required_location") or "Worldwide Remote",
                            "salary": item.get("salary") or "Competitive",
                            "source": "Remotive (精选远程)",
                            "source_url": item.get("url", ""),
                            "jd_text": clean_jd[:3000],
                            "tags": ", ".join(tags_list[:5]) or "Software Engineer",
                            "created_at": item.get("publication_date", "")
                        })
        except Exception as e:
            print(f"Remotive Search Error: {e}")
        return results

    @staticmethod
    async def search_remote_ok(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 RemoteOK API 拉取热门全球远程开发岗位"""
        url = "https://remoteok.com/api"
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items[1:60]:  # 增加抓取深度
                        title = item.get("position", "")
                        company = item.get("company", "Remote Company")
                        desc = item.get("description", "")
                        tags = ",".join(item.get("tags", []))
                        
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            if kw not in title.lower() and kw not in desc.lower() and kw not in tags.lower():
                                continue

                        salary_min = item.get("salary_min", 0)
                        salary_max = item.get("salary_max", 0)
                        try:
                            s_min = float(salary_min) if salary_min is not None else 0.0
                            s_max = float(salary_max) if salary_max is not None else 0.0
                            if s_max > 0:
                                salary = f"${s_min/1000:.0f}k-${s_max/1000:.0f}k"
                            else:
                                salary = "Competitive"
                        except (ValueError, TypeError):
                            salary = "Competitive"

                        clean_jd = JobSearcherService._clean_html(desc)

                        results.append({
                            "title": title,
                            "company": company,
                            "location": item.get("location") or "Worldwide Remote",
                            "salary": salary,
                            "source": "RemoteOK (全球远程)",
                            "source_url": item.get("url", f"https://remoteok.com/remote-jobs/{item.get('id')}"),
                            "jd_text": clean_jd[:3000],
                            "tags": tags,
                            "created_at": item.get("date")
                        })
        except Exception as e:
            print(f"RemoteOK Search Error: {e}")
        return results

    @classmethod
    async def search_all(cls, keyword: Optional[str] = None, channel: Optional[str] = "all") -> List[Dict[str, Any]]:
        """多源异步并发聚合搜索 (结合国内精选行业职位库与开放外部渠道，网络异常下自动兜底)"""
        all_jobs: List[Dict[str, Any]] = []
        seen_keys = set()

        kw = keyword.strip().lower() if keyword and keyword.strip() else ""

        # 1. 优先检索国内官方权威精选岗位库 (临床医药、金融财务、软件开发、智能制造、综合管培)
        if channel in ("all", "domestic"):
            for job in AUTHORITATIVE_JOBS:
                if not kw:
                    all_jobs.append(dict(job))
                    seen_keys.add(f"{job['company'].strip().lower()}_{job['title'].strip().lower()}")
                else:
                    searchable = f"{job['title']} {job['company']} {job.get('tags', '')} {job.get('location', '')} {job.get('jd_text', '')}".lower()
                    if kw in searchable:
                        all_jobs.append(dict(job))
                        seen_keys.add(f"{job['company'].strip().lower()}_{job['title'].strip().lower()}")

        # 2. 外部开放渠道异步检索
        tasks = []
        if channel == "v2ex":
            tasks = [cls.search_v2ex(keyword)]
        elif channel == "ruanyf":
            tasks = [cls.search_ruanyf(keyword)]
        elif channel == "domestic":
            tasks = [cls.search_ruanyf(keyword), cls.search_v2ex(keyword)]
        elif channel == "arbeitnow":
            tasks = [cls.search_arbeitnow(keyword)]
        elif channel == "jobicy":
            tasks = [cls.search_jobicy(keyword)]
        elif channel == "remotive":
            tasks = [cls.search_remotive(keyword)]
        elif channel == "remoteok":
            tasks = [cls.search_remote_ok(keyword)]
        elif channel == "global_remote":
            tasks = [cls.search_jobicy(keyword), cls.search_remotive(keyword), cls.search_remote_ok(keyword)]
        else:
            # 默认全网并发聚合 6 大核心开放源
            tasks = [
                cls.search_ruanyf(keyword),
                cls.search_v2ex(keyword),
                cls.search_arbeitnow(keyword),
                cls.search_jobicy(keyword),
                cls.search_remotive(keyword),
                cls.search_remote_ok(keyword)
            ]

        gathered_results = await asyncio.gather(*tasks, return_exceptions=True)

        for res in gathered_results:
            if isinstance(res, list):
                for job in res:
                    # 去重键：标准化公司+职位名
                    dedup_key = f"{job.get('company', '').strip().lower()}_{job.get('title', '').strip().lower()}"
                    if dedup_key not in seen_keys and job.get("title"):
                        seen_keys.add(dedup_key)
                        job["created_at"] = cls._format_created_at(job.get("created_at"))
                        all_jobs.append(job)

        return all_jobs

    @staticmethod
    async def parse_url_jd(url: str) -> Dict[str, Any]:
        """抓取并解析特定网页的 JD 文本快照"""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    for s in soup(["script", "style", "nav", "footer", "header"]):
                        s.decompose()
                    title = soup.title.string if soup.title else ""
                    body_text = soup.get_text(separator="\n")
                    clean_text = "\n".join([line.strip() for line in body_text.splitlines() if line.strip()])
                    return {
                        "success": True,
                        "title": title.strip(),
                        "jd_text": clean_text[:4000],
                        "source_url": url
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
        return {"success": False, "error": "无法抓取该链接内容"}
