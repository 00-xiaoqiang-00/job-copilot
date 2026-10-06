from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import csv
import io
import urllib.parse

from backend.database import get_session
from backend.models import Job, JobCreate, JobUpdate, Interview

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("/", response_model=List[Job])
def get_jobs(
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    source: Optional[str] = None,
    group: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """获取岗位列表，支持状态、关键词、渠道和待投分组筛选"""
    query = select(Job)
    if status and status != "all":
        query = query.where(Job.status == status)
    if source and source != "all":
        query = query.where(Job.source == source)
    if group and group not in ("all", "null", "undefined"):
        if group == "默认未分组":
            query = query.where((Job.job_group == "默认未分组") | (Job.job_group == None) | (Job.job_group == ""))
        else:
            query = query.where(Job.job_group == group)
    if keyword and keyword.strip():
        kw = f"%{keyword.strip()}%"
        query = query.where(
            (Job.title.like(kw)) | 
            (Job.company.like(kw)) | 
            (Job.tags.like(kw)) |
            (Job.jd_text.like(kw)) |
            (Job.job_group.like(kw))
        )
    query = query.order_by(Job.updated_at.desc())
    jobs = session.exec(query).all()
    return jobs

@router.post("/", response_model=Job)
def create_job(job_in: JobCreate, session: Session = Depends(get_session)):
    """新增求职岗位记录"""
    data = job_in.model_dump()
    if not (data.get("job_group") or "").strip():
        data["job_group"] = "默认未分组"
    job = Job.model_validate(data)
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

STATUS_NAME_MAP = {
    "wishlist": "意向待投",
    "applied": "已投递",
    "screening": "初筛/笔试",
    "interview": "面试中",
    "offer": "已获Offer",
    "rejected": "未通过/归档"
}

PRIORITY_MAP = {
    1: "高优 (P1)",
    2: "中等 (P2)",
    3: "备选 (P3)"
}

class BatchGroupStatusRequest(BaseModel):
    group_name: str
    from_status: Optional[str] = "wishlist"
    to_status: str = "applied"

class BatchAssignGroupRequest(BaseModel):
    job_ids: List[int]
    target_group: str
    target_resume_version: Optional[str] = None

@router.get("/groups/summary")
def get_groups_summary(session: Session = Depends(get_session)):
    """获取当前所有待投赛道/分组统计及其关联的常用简历版本（轻量列投影，避免全表扫描巨型文本）"""
    jobs = session.exec(
        select(Job.id, Job.company, Job.job_group, Job.status, Job.resume_version)
    ).all()
    groups_dict: Dict[str, Dict[str, Any]] = {}
    
    for _, company, job_group, status, resume_version in jobs:
        grp = (job_group or "").strip() or "默认未分组"
        if grp not in groups_dict:
            groups_dict[grp] = {
                "name": grp,
                "group_name": grp,
                "total_count": 0,
                "total_jobs": 0,
                "wishlist_count": 0,
                "applied_count": 0,
                "interview_count": 0,
                "resume_versions": {},
                "sample_companies": []
            }
        
        g = groups_dict[grp]
        g["total_count"] += 1
        g["total_jobs"] += 1
        if status == "wishlist":
            g["wishlist_count"] += 1
        elif status == "applied":
            g["applied_count"] += 1
        elif status in ("screening", "interview"):
            g["interview_count"] += 1
            
        if company and company not in g["sample_companies"]:
            if len(g["sample_companies"]) < 5:
                g["sample_companies"].append(company)
                
        r_ver = (resume_version or "默认通用简历").strip()
        g["resume_versions"][r_ver] = g["resume_versions"].get(r_ver, 0) + 1

    result = []
    for grp_name, data in groups_dict.items():
        top_resume = "默认通用简历"
        if data["resume_versions"]:
            top_resume = max(data["resume_versions"].items(), key=lambda x: x[1])[0]
        data["primary_resume"] = top_resume
        result.append(data)
        
    result.sort(key=lambda x: (x["wishlist_count"], x["total_count"]), reverse=True)
    return result

@router.post("/groups/batch-status")
def batch_update_group_status(
    req: BatchGroupStatusRequest,
    session: Session = Depends(get_session)
):
    """一键将某分组下所有处于特定状态的岗位（如全部待投）批量更新为目标状态（如全部已投递）"""
    if req.group_name == "默认未分组":
        query = select(Job).where((Job.job_group == "默认未分组") | (Job.job_group == None) | (Job.job_group == ""))
    else:
        query = select(Job).where(Job.job_group == req.group_name)
    if req.from_status and req.from_status != "all":
        query = query.where(Job.status == req.from_status)
        
    matched_jobs = session.exec(query).all()
    count = len(matched_jobs)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    applied_date = datetime.now().strftime("%Y-%m-%d")
    
    for job in matched_jobs:
        job.status = req.to_status
        if req.to_status == "applied" and not job.applied_at:
            job.applied_at = applied_date
        job.updated_at = now_str
        session.add(job)
        
    session.commit()
    target_name = STATUS_NAME_MAP.get(req.to_status, req.to_status)
    return {
        "message": f"🎉 已成功将分组「{req.group_name}」内的 {count} 家企业/岗位全部标记为「{target_name}」！",
        "updated_count": count
    }

@router.post("/groups/batch-assign")
def batch_assign_jobs_to_group(
    req: BatchAssignGroupRequest,
    session: Session = Depends(get_session)
):
    """批量将多个岗位分配至指定分组，并可统一指定简历版本"""
    jobs = session.exec(select(Job).where(Job.id.in_(req.job_ids))).all()
    count = len(jobs)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    for job in jobs:
        job.job_group = req.target_group
        if req.target_resume_version:
            job.resume_version = req.target_resume_version
        job.updated_at = now_str
        session.add(job)
        
    session.commit()
    return {
        "message": f"✅ 已成功将 {count} 个岗位归入分组「{req.target_group}」！",
        "updated_count": count
    }

@router.get("/export/csv")
def export_jobs_csv(session: Session = Depends(get_session)):
    """导出所有岗位求职进度台账为 Excel 完美兼容的标准 UTF-8 BOM CSV 文件"""
    jobs = session.exec(select(Job).order_by(Job.updated_at.desc())).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    headers = [
        "岗位名称",
        "企业名称",
        "当前求职状态",
        "所属赛道分组",
        "工作地点",
        "薪资范围",
        "优先级",
        "渠道来源",
        "原职位链接",
        "投递时间",
        "更新时间",
        "技能标签",
        "简历版本",
        "针对性重点",
        "待补齐差距",
        "面试策略",
        "HR/联系人"
    ]
    writer.writerow(headers)
    
    for j in jobs:
        writer.writerow([
            j.title or "",
            j.company or "",
            STATUS_NAME_MAP.get(j.status, j.status or ""),
            j.job_group or "默认未分组",
            j.location or "",
            j.salary or "",
            PRIORITY_MAP.get(j.priority, str(j.priority)),
            j.source or "",
            j.source_url or "",
            j.applied_at or "",
            j.updated_at or "",
            j.tags or "",
            j.resume_version or "",
            j.resume_key_points or "",
            j.skill_gaps or "",
            j.interview_strategy or "",
            j.contact_person or ""
        ])
        
    csv_bytes = output.getvalue().encode("utf-8-sig")
    filename = f"JobCopilot_求职进度台账_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    encoded_filename = urllib.parse.quote(filename)
    
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8-sig",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

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
    if update_data.get("status") == "applied" and not job.applied_at:
        job.applied_at = datetime.now().strftime("%Y-%m-%d")
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
    
    # 显式清理从属面试日程，确保双重保障无孤立残留
    child_interviews = session.exec(select(Interview).where(Interview.job_id == job_id)).all()
    for iv in child_interviews:
        session.delete(iv)
        
    session.delete(job)
    session.commit()
    return {"message": "岗位及关联面试日程已成功删除", "id": job_id}

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
