from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from backend.database import get_session
from backend.models import ResumeProfile, ResumeProfileCreate, ResumeProfileUpdate
from backend.services.pdf_parser import PDFParserService

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

@router.get("/", response_model=List[ResumeProfile])
def get_resumes(session: Session = Depends(get_session)):
    """获取所有简历版本库"""
    resumes = session.exec(select(ResumeProfile).order_by(ResumeProfile.updated_at.desc())).all()
    return resumes

@router.post("/", response_model=ResumeProfile)
def create_resume(resume_in: ResumeProfileCreate, session: Session = Depends(get_session)):
    """新增简历版本"""
    resume = ResumeProfile.model_validate(resume_in)
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume

@router.post("/upload-pdf")
async def upload_pdf_resume(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """上传 PDF 简历文件并自动解析文本与提取核心技能"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="只支持上传 .pdf 格式的简历文件")
    
    # 限制文件大小为 10MB
    content_bytes = await file.read()
    if len(content_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="简历 PDF 文件过大，请保持在 10MB 以内")
        
    parse_res = PDFParserService.parse_pdf_bytes(content_bytes, file.filename)
    
    if not parse_res["success"]:
        raise HTTPException(status_code=400, detail=parse_res["error"])
        
    # 自动保存为新简历版本
    new_resume = ResumeProfile(
        version_name=parse_res["version_name"],
        target_role="待完善",
        raw_content=parse_res["raw_content"],
        highlights=parse_res["highlights"],
        file_name=file.filename
    )
    session.add(new_resume)
    session.commit()
    session.refresh(new_resume)
    
    return {
        "message": "PDF 简历解析成功并已录入版本库",
        "resume": new_resume,
        "page_count": parse_res.get("page_count", 1)
    }

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
