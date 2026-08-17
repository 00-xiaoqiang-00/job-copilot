from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

from backend.services.job_searcher import JobSearcherService

router = APIRouter(prefix="/api/search", tags=["Job Search"])

@router.get("/jobs")
async def search_jobs(
    keyword: Optional[str] = Query(None, description="搜索关键词，如 Python, 前端, 远程"),
    source: Optional[str] = Query("all", description="数据源: all, v2ex, remoteok")
) -> List[Dict[str, Any]]:
    """在线检索开放职位（V2EX 酷工作、RemoteOK 远程职位等）"""
    if source == "v2ex":
        return await JobSearcherService.search_v2ex(keyword)
    elif source == "remoteok":
        return await JobSearcherService.search_remote_ok(keyword)
    else:
        return await JobSearcherService.search_all(keyword)

@router.get("/parse-url")
async def parse_job_url(url: str = Query(..., description="目标岗位网页地址")):
    """抓取并提取网页中的 JD 文本快照"""
    return await JobSearcherService.parse_url_jd(url)
