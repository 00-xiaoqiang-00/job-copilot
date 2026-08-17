from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.services.ai_assistant import AIAssistantService

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

class MatchRequest(BaseModel):
    jd_text: str
    resume_text: str

class PredictQuestionsRequest(BaseModel):
    title: str
    jd_text: str

class ExtractSkillsRequest(BaseModel):
    text: str

@router.post("/match")
def match_resume_with_jd(req: MatchRequest):
    """分析简历与岗位 JD 的技能匹配度与 Gap 建议"""
    return AIAssistantService.analyze_jd_match(req.jd_text, req.resume_text)

@router.post("/predict-questions")
def predict_interview_questions(req: PredictQuestionsRequest):
    """基于岗位要求预测可能被提问的技术与项目问题"""
    return AIAssistantService.predict_interview_questions(req.jd_text, req.title)

@router.post("/extract-skills")
def extract_skills_from_text(req: ExtractSkillsRequest):
    """从文本中一键提炼技术标签"""
    skills = AIAssistantService.extract_skills(req.text)
    return {"skills": skills}
