from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime

from backend.database import get_session
from backend.models import Job, JobCreate, JobUpdate, Interview

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("/", response_model=List[Job])
def get_jobs(
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    source: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """获取岗位列表，支持状态、关键词和渠道筛选"""
    query = select(Job)
    if status and status != "all":
        query = query.where(Job.status == status)
    if source and source != "all":
        query = query.where(Job.source == source)
    if keyword and keyword.strip():
        kw = f"%{keyword.strip()}%"
        query = query.where(
            (Job.title.like(kw)) | 
            (Job.company.like(kw)) | 
            (Job.tags.like(kw)) |
            (Job.jd_text.like(kw))
        )
    query = query.order_by(Job.updated_at.desc())
    jobs = session.exec(query).all()
    return jobs

@router.post("/", response_model=Job)
def create_job(job_in: JobCreate, session: Session = Depends(get_session)):
    """新增求职岗位记录"""
    job = Job.model_validate(job_in)
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.get("/{job_id}", response_model=Job)
def get_job(job_id: int, session: Session = Depends(get_session)):
    """获取单个岗位详情"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    return job

@router.patch("/{job_id}", response_model=Job)
def update_job(job_id: int, job_in: JobUpdate, session: Session = Depends(get_session)):
    """更新岗位信息（包括看板拖拽改变状态、更新简历标注等）"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    update_data = job_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
    
    job.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, session: Session = Depends(get_session)):
    """删除岗位及其关联的面试记录"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    session.delete(job)
    session.commit()
    return {"message": "岗位已成功删除", "id": job_id}

@router.get("/stats/summary")
def get_job_stats(session: Session = Depends(get_session)):
    """获取求职漏斗统计数据"""
    jobs = session.exec(select(Job)).all()
    
    status_counts = {
        "wishlist": 0,
        "applied": 0,
        "screening": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0
    }
    source_counts = {}
    
    for j in jobs:
        st = j.status if j.status in status_counts else "wishlist"
        status_counts[st] += 1
        
        src = j.source or "其他"
        source_counts[src] = source_counts.get(src, 0) + 1
        
    total_jobs = len(jobs)
    active_in_process = status_counts["applied"] + status_counts["screening"] + status_counts["interview"]
    response_rate = f"{( (total_jobs - status_counts['wishlist'] - status_counts['applied']) / max(total_jobs - status_counts['wishlist'], 1) ) * 100:.1f}%" if total_jobs > status_counts['wishlist'] else "0%"
    
    return {
        "total": total_jobs,
        "status_counts": status_counts,
        "source_counts": source_counts,
        "active_in_process": active_in_process,
        "response_rate": response_rate
    }
