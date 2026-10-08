import os
import shutil
import sqlite3
import json
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlmodel import Session, delete, select

from backend.database import get_session, DB_PATH, reconnect_engine
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

@router.get("/backup-db")
def backup_database():
    """一键下载当前本地 SQLite 数据库备份文件"""
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="数据库文件不存在")
    
    # 确保 WAL 缓存完全写入磁盘
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("PRAGMA wal_checkpoint(FULL);")
        conn.close()
    except Exception:
        pass

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    download_filename = f"job_copilot_backup_{timestamp}.db"
    return FileResponse(
        path=DB_PATH,
        filename=download_filename,
        media_type="application/x-sqlite3"
    )

@router.post("/restore-db")
async def restore_database(file: UploadFile = File(...)):
    """一键上传并恢复/迁移外部 SQLite 数据库 (.db 文件)"""
    if not file.filename.lower().endswith((".db", ".sqlite", ".sqlite3")):
        raise HTTPException(status_code=400, detail="只支持恢复 .db, .sqlite 格式的数据库文件")

    content = await file.read()
    if len(content) < 100 or not content.startswith(b"SQLite format 3\x00"):
        raise HTTPException(status_code=400, detail="上传的文件不是合法的 SQLite 3 数据库文件")

    temp_path = DB_PATH + ".restore_temp"
    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        # 检查数据库完整性及业务数据量
        conn = sqlite3.connect(temp_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [r[0] for r in cur.fetchall()]
        
        job_count = 0
        if "jobs" in tables:
            cur.execute("SELECT COUNT(*) FROM jobs;")
            job_count = cur.fetchone()[0]
        conn.close()

        # 安全防线：为当前旧数据库备份一份 .bak
        if os.path.exists(DB_PATH):
            shutil.copy2(DB_PATH, DB_PATH + ".bak")

        # 覆盖主数据库并移除临时文件
        shutil.move(temp_path, DB_PATH)

        # 清除旧的 WAL 与 SHM 临时缓存文件
        for ext in ["-wal", "-shm"]:
            wal_file = DB_PATH + ext
            if os.path.exists(wal_file):
                try:
                    os.remove(wal_file)
                except Exception:
                    pass

        # 重新初始化 engine 链接池
        reconnect_engine()

        return {
            "success": True,
            "message": f"数据库恢复成功！已成功载入 {job_count} 条岗位记录。",
            "job_count": job_count,
            "tables": tables
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"数据库恢复失败: {str(e)}")

@router.get("/export-json")
def export_json_backup(session: Session = Depends(get_session)):
    """导出全量求职业务数据为标准 JSON 格式"""
    jobs = session.exec(select(Job)).all()
    interviews = session.exec(select(Interview)).all()
    resumes = session.exec(select(ResumeProfile)).all()
    offers = session.exec(select(Offer)).all()

    export_data = {
        "version": "4.5.0",
        "exported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "jobs": [j.model_dump() for j in jobs],
        "interviews": [i.model_dump() for i in interviews],
        "resumes": [r.model_dump() for r in resumes],
        "offers": [o.model_dump() for o in offers],
    }
    return export_data

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
