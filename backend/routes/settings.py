from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlmodel import Session, delete

from backend.database import get_session
from backend.models import Job, Interview, ResumeProfile, Offer, CampusRecruit, PublicRecruit
from backend.services.llm_client import LLMClientService

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class LLMConfigRequest(BaseModel):
    provider: str = "deepseek"
    base_url: str = "https://api.deepseek.com/v1"
    api_key: str = ""
    model_name: str = "deepseek-chat"

@router.get("/llm")
def get_llm_setting() -> Dict[str, Any]:
    """获取当前已保存的大模型配置"""
    cfg = LLMClientService.get_saved_config()
    # 遮罩敏感 key 供前端展示
    masked_key = ""
    if cfg.get("api_key"):
        raw = cfg["api_key"]
        masked_key = raw[:4] + "*" * max(len(raw) - 8, 4) + raw[-4:] if len(raw) > 8 else "***"
    return {
        "provider": cfg.get("provider", "deepseek"),
        "base_url": cfg.get("base_url", "https://api.deepseek.com/v1"),
        "model_name": cfg.get("model_name", "deepseek-chat"),
        "has_key": bool(cfg.get("api_key")),
        "masked_key": masked_key
    }

@router.post("/llm")
def save_llm_setting(req: LLMConfigRequest):
    """保存或更新大模型配置"""
    # 如果传过来的 key 包含星号且未变动，则保留原来的 key
    old_cfg = LLMClientService.get_saved_config()
    final_key = req.api_key
    if "*" in req.api_key and old_cfg.get("api_key"):
        final_key = old_cfg["api_key"]
        
    config_data = {
        "provider": req.provider,
        "base_url": req.base_url.strip(),
        "api_key": final_key.strip(),
        "model_name": req.model_name.strip()
    }
    LLMClientService.save_config(config_data)
    return {"message": "大模型配置已保存成功"}

@router.post("/test-llm")
async def test_llm_connection(req: LLMConfigRequest):
    """测试当前填写或保存的大模型连通性"""
    # 处理星号 key 回退
    final_key = req.api_key
    if "*" in req.api_key:
        old_cfg = LLMClientService.get_saved_config()
        final_key = old_cfg.get("api_key", "")

    config_data = {
        "provider": req.provider,
        "base_url": req.base_url.strip(),
        "api_key": final_key.strip(),
        "model_name": req.model_name.strip()
    }
    return await LLMClientService.test_connection(config_data)

@router.delete("/purge-all-data")
def purge_all_data(session: Session = Depends(get_session)):
    """一键清空全站业务数据（彻底恢复为 0 条记录的纯净系统）"""
    session.exec(delete(Interview))
    session.exec(delete(Job))
    session.exec(delete(ResumeProfile))
    session.exec(delete(Offer))
    session.exec(delete(CampusRecruit))
    session.exec(delete(PublicRecruit))
    session.commit()
    return {"message": "全站数据已清空，系统恢复至纯净初始状态", "purged": True}
