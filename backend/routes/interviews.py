from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from backend.database import get_session
from backend.models import Interview, InterviewCreate, InterviewUpdate, Job

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])

@router.get("/by-job/{job_id}", response_model=List[Interview])
def get_interviews_by_job(job_id: int, session: Session = Depends(get_session)):
    """获取指定岗位的全部面试与复盘记录"""
    query = select(Interview).where(Interview.job_id == job_id).order_by(Interview.created_at.asc())
    return session.exec(query).all()

@router.post("/", response_model=Interview)
def create_interview(interview_in: InterviewCreate, session: Session = Depends(get_session)):
    """新增一轮面试记录"""
    job = session.get(Job, interview_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="关联岗位不存在")
    
    interview = Interview.model_validate(interview_in)
    session.add(interview)
    
    # 自动同步岗位状态为面试中
    if job.status in ["wishlist", "applied", "screening"]:
        job.status = "interview"
        session.add(job)
        
    session.commit()
    session.refresh(interview)
    return interview

@router.patch("/{interview_id}", response_model=Interview)
def update_interview(interview_id: int, interview_in: InterviewUpdate, session: Session = Depends(get_session)):
    """更新面试复盘、问题记录与结果"""
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试记录不存在")
        
    update_data = interview_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interview, key, value)
        
    session.add(interview)
    session.commit()
    session.refresh(interview)
    return interview

@router.delete("/{interview_id}")
def delete_interview(interview_id: int, session: Session = Depends(get_session)):
    """删除面试记录"""
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试记录不存在")
    session.delete(interview)
    session.commit()
    return {"message": "面试记录已删除", "id": interview_id}
