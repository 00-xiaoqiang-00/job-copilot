import httpx
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

class JobSearcherService:
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
                        
                        # 从标题提取公司和岗位（启发式规则）
                        company = "V2EX 社区发布"
                        if "【" in title and "】" in title:
                            parts = re.findall(r"【(.*?)】", title)
                            if parts:
                                company = parts[0]
                        elif "[" in title and "]" in title:
                            parts = re.findall(r"\[(.*?)\]", title)
                            if parts:
                                company = parts[0]
                        
                        # 提取大致薪资
                        salary_match = re.search(r"(\d+k[-~至]\d+k|\d+[-~至]\d+K|\d+[-~至]\d+万)", title + " " + content, re.IGNORECASE)
                        salary = salary_match.group(1) if salary_match else "面议"
                        
                        # 提取工作地点
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
                            "tags": "Python,全栈,技术圈",
                            "created_at": t.get("created")
                        })
        except Exception as e:
            print(f"V2EX Search Error: {e}")
        return results

    @staticmethod
    async def search_remote_ok(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """从 RemoteOK API 拉取全球远程岗位"""
        url = "https://remoteok.com/api"
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items[1:30]:  # 跳过第一个合规说明项
                        title = item.get("position", "")
                        company = item.get("company", "Remote Company")
                        desc = item.get("description", "")
                        
                        if keyword and keyword.strip():
                            kw = keyword.strip().lower()
                            if kw not in title.lower() and kw not in desc.lower():
                                continue

                        tags = ",".join(item.get("tags", []))
                        salary_min = item.get("salary_min", 0)
                        salary_max = item.get("salary_max", 0)
                        salary = f"${salary_min/1000:.0f}k-${salary_max/1000:.0f}k" if salary_max else "Competitive"

                        # 清理 HTML 标签
                        soup = BeautifulSoup(desc, "html.parser")
                        clean_jd = soup.get_text(separator="\n").strip()

                        results.append({
                            "title": title,
                            "company": company,
                            "location": item.get("location") or "Worldwide Remote",
                            "salary": salary,
                            "source": "RemoteOK (全球远程)",
                            "source_url": item.get("url", f"https://remoteok.com/remote-jobs/{item.get('id')}"),
                            "jd_text": clean_jd,
                            "tags": tags,
                            "created_at": item.get("date")
                        })
        except Exception as e:
            print(f"RemoteOK Search Error: {e}")
        return results

    @staticmethod
    async def search_all(keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        """多源聚合搜索"""
        v2ex_results = await JobSearcherService.search_v2ex(keyword)
        remote_results = await JobSearcherService.search_remote_ok(keyword)
        
        # 合并结果
        combined = v2ex_results + remote_results
        return combined

    @staticmethod
    async def parse_url_jd(url: str) -> Dict[str, Any]:
        """抓取并解析特定网页的 JD 文本快照"""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # 移除无用元素
                    for s in soup(["script", "style", "nav", "footer", "header"]):
                        s.decompose()
                    title = soup.title.string if soup.title else ""
                    body_text = soup.get_text(separator="\n")
                    clean_text = "\n".join([line.strip() for line in body_text.splitlines() if line.strip()])
                    return {
                        "success": True,
                        "title": title.strip(),
                        "jd_text": clean_text[:4000], # 保留前4000字核心内容
                        "source_url": url
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
        return {"success": False, "error": "无法抓取该链接内容"}
