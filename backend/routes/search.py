from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

from backend.services.job_searcher import JobSearcherService

router = APIRouter(prefix="/api/search", tags=["Job Search"])

@router.get("/jobs")
async def search_jobs(
    keyword: Optional[str] = Query(None, description="搜索关键词，如 Python, FastAPI, 前端, 远程, Go"),
    source: Optional[str] = Query("all", description="数据源: all, domestic, global_remote, ruanyf, v2ex, arbeitnow, jobicy, remotive, remoteok")
) -> List[Dict[str, Any]]:
    """多源异步检索开放职位（阮一峰周刊、V2EX、Arbeitnow、Jobicy、Remotive、RemoteOK）"""
    return await JobSearcherService.search_all(keyword=keyword, channel=source)

@router.get("/parse-url")
async def parse_job_url(url: str = Query(..., description="目标岗位网页地址")):
    """抓取并提取网页中的 JD 文本快照"""
    return await JobSearcherService.parse_url_jd(url)
