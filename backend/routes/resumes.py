from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from backend.database import get_session
from backend.models import ResumeProfile, ResumeProfileCreate, ResumeProfileUpdate

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

@router.get("/", response_model=List[ResumeProfile])
def get_resumes(session: Session = Depends(get_session)):
    """获取所有简历版本库"""
    resumes = session.exec(select(ResumeProfile).order_by(ResumeProfile.updated_at.desc())).all()
    if not resumes:
        # 初始化一份默认示例简历版本
        default_resume = ResumeProfile(
            version_name="Python 全栈通用版",
            target_role="Python 后端 / 全栈开发工程师",
            raw_content="精通 Python、FastAPI、SQLAlchemy、SQLite 与 RESTful API 开发；熟悉 JavaScript、Tailwind CSS、React 基础交互与前端集成；具备 Redis 缓存优化与高并发项目实战经验；熟练使用 Git、Linux 系统与 Docker 容器化部署。",
            highlights="Python, FastAPI, SQLite, Redis, RESTful API, Docker, Git"
        )
        session.add(default_resume)
        session.commit()
        session.refresh(default_resume)
        return [default_resume]
    return resumes

@router.post("/", response_model=ResumeProfile)
def create_resume(resume_in: ResumeProfileCreate, session: Session = Depends(get_session)):
    """新增简历版本"""
    resume = ResumeProfile.model_validate(resume_in)
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume

@router.patch("/{resume_id}", response_model=ResumeProfile)
def update_resume(resume_id: int, resume_in: ResumeProfileUpdate, session: Session = Depends(get_session)):
    """更新简历内容与亮点"""
    resume = session.get(ResumeProfile, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历版本不存在")
        
    update_data = resume_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(resume, key, value)
        
    resume.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, session: Session = Depends(get_session)):
    """删除简历版本"""
    resume = session.get(ResumeProfile, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历版本不存在")
    session.delete(resume)
    session.commit()
    return {"message": "简历版本已删除", "id": resume_id}
