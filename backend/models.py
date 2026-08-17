from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class JobBase(SQLModel):
    title: str = Field(index=True, description="岗位名称")
    company: str = Field(index=True, description="公司名称")
    location: Optional[str] = Field(default="不限/远程", description="工作地点")
    salary: Optional[str] = Field(default="面议", description="薪资范围")
    status: str = Field(default="wishlist", index=True, description="求职状态: wishlist, applied, screening, interview, offer, rejected")
    source: Optional[str] = Field(default="手动录入", description="渠道来源: Boss直聘, 猎聘, 牛客, V2EX, 官网直投, 内推, LinkedIn, RemoteOK 等")
    source_url: Optional[str] = Field(default="", description="原职位链接")
    jd_text: Optional[str] = Field(default="", description="岗位职责与要求全文快照")
    contact_person: Optional[str] = Field(default="", description="HR/内推人联系方式")
    tags: Optional[str] = Field(default="", description="技术标签，逗号隔开")
    priority: int = Field(default=2, description="优先级: 1高, 2中, 3低")
    
    # 针对性简历与面试标注
    resume_version: Optional[str] = Field(default="默认通用简历", description="所投递的简历版本")
    resume_key_points: Optional[str] = Field(default="", description="针对该岗位简历重点突出的项目与经历")
    skill_gaps: Optional[str] = Field(default="", description="技能差距与待突击补齐点")
    interview_strategy: Optional[str] = Field(default="", description="自我介绍侧重点与面试应对策略")
    
    applied_at: Optional[str] = Field(default="", description="投递时间")

class Job(JobBase, table=True):
    __tablename__ = "jobs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    interviews: List["Interview"] = Relationship(back_populates="job", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class JobCreate(JobBase):
    pass

class JobUpdate(SQLModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    jd_text: Optional[str] = None
    contact_person: Optional[str] = None
    tags: Optional[str] = None
    priority: Optional[int] = None
    resume_version: Optional[str] = None
    resume_key_points: Optional[str] = None
    skill_gaps: Optional[str] = None
    interview_strategy: Optional[str] = None
    applied_at: Optional[str] = None

class InterviewBase(SQLModel):
    job_id: int = Field(foreign_key="jobs.id", index=True, description="所属岗位ID")
    round_name: str = Field(default="技术一面", description="面试轮次: 初筛沟通, 技术一面, 技术二面, 终面, HR面, 笔试等")
    interview_time: Optional[str] = Field(default="", description="面试时间 (YYYY-MM-DD HH:mm)")
    meeting_link: Optional[str] = Field(default="", description="会议链接或地点")
    interviewer: Optional[str] = Field(default="", description="面试官姓名/职位")
    questions_notes: Optional[str] = Field(default="", description="面试被问到的问题与面经记录")
    retrospective: Optional[str] = Field(default="", description="面试复盘与自我评价")
    result: str = Field(default="pending", description="结果: pending, passed, failed")

class Interview(InterviewBase, table=True):
    __tablename__ = "interviews"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    job: Optional[Job] = Relationship(back_populates="interviews")

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(SQLModel):
    round_name: Optional[str] = None
    interview_time: Optional[str] = None
    meeting_link: Optional[str] = None
    interviewer: Optional[str] = None
    questions_notes: Optional[str] = None
    retrospective: Optional[str] = None
    result: Optional[str] = None

class ResumeProfileBase(SQLModel):
    version_name: str = Field(index=True, description="简历版本名称，如 'Python 后端特化版'")
    target_role: Optional[str] = Field(default="后端开发", description="求职目标岗位")
    raw_content: Optional[str] = Field(default="", description="简历纯文本内容(用于AI匹配)")
    highlights: Optional[str] = Field(default="", description="核心亮点与优势标签")
    file_name: Optional[str] = Field(default="", description="附件文件名")

class ResumeProfile(ResumeProfileBase, table=True):
    __tablename__ = "resumes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class ResumeProfileCreate(ResumeProfileBase):
    pass

class ResumeProfileUpdate(SQLModel):
    version_name: Optional[str] = None
    target_role: Optional[str] = None
    raw_content: Optional[str] = None
    highlights: Optional[str] = None
    file_name: Optional[str] = None
