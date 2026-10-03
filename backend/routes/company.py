from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.services.company_registry import CompanyRegistryService, COMPANY_PROFILES_KB
from backend.services.live_searcher import LiveSearchService
from backend.services.llm_client import LLMClientService

router = APIRouter(prefix="/api/company", tags=["Company Intelligence"])

class AICompanyResearchRequest(BaseModel):
    company_name: str
    job_title: Optional[str] = ""

@router.get("/search")
async def search_companies(query: str = Query(default="")):
    """搜索企业全景档案与背调画像（支持本地权威知识库匹配与全网实时百科/工商动态检索）"""
    clean_q = (query or "").strip()
    if not clean_q:
        results = CompanyRegistryService.search_companies("")
        return {"results": results, "total": len(results), "mode": "recommended"}

    # 1. 优先在权威精选知识库中匹配
    kb_matches = [
        c for c in COMPANY_PROFILES_KB 
        if CompanyRegistryService.match_company(c, clean_q)
    ]
    if kb_matches:
        return {"results": kb_matches, "total": len(kb_matches), "mode": "kb"}

    # 2. 未在预录入知识库时，穿透互联网实时全网检索（百度百科官方接口 + 权威工商/官网摘要，带TTL内存缓存）
    live_profile = await LiveSearchService.search_live_company_profile(clean_q)
    if live_profile:
        return {"results": [live_profile], "total": 1, "mode": "live_web"}

    # 3. 兜底启发式生成
    fallback = CompanyRegistryService.generate_heuristic_profile(clean_q)
    return {"results": [fallback], "total": 1, "mode": "heuristic"}

@router.get("/profile")
async def get_company_profile(name: str = Query(...), live: bool = Query(False)):
    """获取单家企业的详细背调画像档案与直达外部链接（支持动态全网实时百科与工商画像检索）"""
    clean_name = (name or "").strip()
    if not clean_name:
        return CompanyRegistryService.generate_heuristic_profile("目标企业")

    # 1. 查找知识库是否存在精准收录
    for c in COMPANY_PROFILES_KB:
        if CompanyRegistryService.match_company(c, clean_name):
            if not live:
                return c

    # 2. 实时穿透互联网检索真实企业百科、总部、成立时间、规模与主营（带TTL内存缓存）
    live_profile = await LiveSearchService.search_live_company_profile(clean_name)
    if live_profile:
        return live_profile

    return CompanyRegistryService.get_company_profile(clean_name)


@router.post("/ai-research")
async def run_ai_company_research(req: AICompanyResearchRequest):
    """调用大模型（或规则引擎）生成企业定制深度求职背调报告"""
    return await LLMClientService.company_research(req.company_name, req.job_title)
