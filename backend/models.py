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
    
    # 待投赛道/分组
    job_group: Optional[str] = Field(default="默认未分组", description="意向待投所属分组/投递赛道(如: 算法与AI组, 前端开发组, 医药CRA组, 央国企管培组)")

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
    job_group: Optional[str] = None
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

# ==================== 新增: Offer 科学对比模型 ====================
class OfferBase(SQLModel):
    title: str = Field(description="岗位名称")
    company: str = Field(index=True, description="公司名称")
    job_id: Optional[int] = Field(default=None, description="关联的岗位ID (可选)")
    
    base_salary_monthly: float = Field(default=20000.0, description="每月基本底薪 (元)")
    months_count: float = Field(default=12.0, description="年薪月数 (如 12, 14, 15, 16 薪)")
    year_end_bonus: float = Field(default=0.0, description="额外预期年终奖/绩效奖金 (元)")
    monthly_allowance: float = Field(default=1000.0, description="每月补贴 (餐补/房补/交通补贴等)")
    
    work_hours_per_day: float = Field(default=8.5, description="每日实际工作/在岗时长 (小时，如 9:30-18:30 扣午休=8h)")
    work_days_per_week: float = Field(default=5.0, description="每周工作天数 (5天 / 5.5天 / 6天)")
    annual_leave_days: int = Field(default=7, description="每年带薪年假天数")
    commute_minutes_per_day: int = Field(default=60, description="每日往返通勤总耗时 (分钟)")
    
    benefits_score: int = Field(default=4, description="福利保障自评 (1-5星: 五险一金比例/全额公积金/体检/下午茶等)")
    growth_score: int = Field(default=4, description="平台与个人发展自评 (1-5星: 业务前景/技术成长/背书价值)")
    notes: Optional[str] = Field(default="", description="备注与顾虑要点")

class Offer(OfferBase, table=True):
    __tablename__ = "offers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class OfferCreate(OfferBase):
    pass

class OfferUpdate(SQLModel):
    title: Optional[str] = None
    company: Optional[str] = None
    job_id: Optional[int] = None
    base_salary_monthly: Optional[float] = None
    months_count: Optional[float] = None
    year_end_bonus: Optional[float] = None
    monthly_allowance: Optional[float] = None
    work_hours_per_day: Optional[float] = None
    work_days_per_week: Optional[float] = None
    annual_leave_days: Optional[int] = None
    commute_minutes_per_day: Optional[int] = None
    benefits_score: Optional[int] = None
    growth_score: Optional[int] = None
    notes: Optional[str] = None

# ==================== 新增: 系统设置模型 (存储本地大模型配置等) ====================
class SystemSetting(SQLModel, table=True):
    __tablename__ = "system_settings"
    
    key: str = Field(primary_key=True, description="配置键名")
    value: str = Field(default="", description="配置键值 (JSON或纯字符串)")
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# ==================== 新增: 全网秋招情报模型 ====================
class CampusRecruitBase(SQLModel):
    company_name: str = Field(index=True, description="企业/单位名称")
    industry: str = Field(default="互联网/IT", index=True, description="行业分类: 医疗健康/生物医药, 互联网/IT, 智能制造/汽车芯片, 央国企/科研院所, 金融/银行, 综合商贸")
    recruitment_type: str = Field(default="秋招提前批", index=True, description="招聘批次: 提前批 / 正式批 / 补录 / 实习")
    target_graduates: str = Field(default="2026届", index=True, description="面向届别: 如 2026届, 2027届, 2026/2027届")
    roles_summary: str = Field(default="", description="招募岗位方向与专业要求概要")
    apply_url: str = Field(default="", description="官方网申直达链接")
    referral_code: Optional[str] = Field(default="", description="内推码 / 内推通道")
    start_date: Optional[str] = Field(default="", description="开启日期 YYYY-MM-DD")
    deadline: Optional[str] = Field(default="", description="截止日期 YYYY-MM-DD")
    status: str = Field(default="hot", description="状态: hot(进行中), ending(即将截止), closed(已截止)")
    source: str = Field(default="全网秋招雷达", description="来源渠道: 微信公众号 / GitHub开源日程 / 飞书共享表 / 官方直聘")
    source_url: Optional[str] = Field(default="", description="原推文/通告出处链接")
    announcement_text: Optional[str] = Field(default="", description="完整招聘通告详情")

class CampusRecruit(CampusRecruitBase, table=True):
    __tablename__ = "campus_recruits"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class CampusRecruitCreate(CampusRecruitBase):
    pass

class CampusRecruitUpdate(SQLModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    recruitment_type: Optional[str] = None
    target_graduates: Optional[str] = None
    roles_summary: Optional[str] = None
    apply_url: Optional[str] = None
    referral_code: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    announcement_text: Optional[str] = None

# ==================== 新增: 考公考编与央国企招录模型 ====================
class PublicRecruitBase(SQLModel):
    title: str = Field(index=True, description="招录公告全称 (如: 广东省2026年选调优秀大学毕业生公告)")
    organization: str = Field(index=True, description="招录部门/单位系统 (如: 广东省委组织部, 中国电网, 中山大学附属第一医院)")
    category: str = Field(default="公务员(国考/省考)", index=True, description="编制分类: 公务员(国考/省考), 选调生, 事业单位, 央企国企, 军队文职/其他")
    region: str = Field(default="全国", index=True, description="所属省份/地区: 全国, 北京, 广东, 上海, 江苏, 浙江, 山东, 四川, 湖北, 陕西等")
    target_graduates: str = Field(default="2026应届生", index=True, description="面向对象: 2026应届生, 往届可报, 不限")
    roles_summary: str = Field(default="", description="招录专业方向与主要岗位概要 (如: 临床医学, 计算机软件, 法学财会, 综合管理, 电气自动化)")
    headcount: Optional[str] = Field(default="", description="招录人数规模 (如: 1,200人)")
    apply_start_date: Optional[str] = Field(default="", description="报名开启时间 YYYY-MM-DD")
    apply_end_date: Optional[str] = Field(default="", description="报名截止时间 YYYY-MM-DD")
    exam_date: Optional[str] = Field(default="", description="笔试日期 YYYY-MM-DD")
    status: str = Field(default="hot", description="状态: hot(报名中), upcoming(即将开启), ending(即将截止≤3天), closed(报名截止)")
    apply_url: str = Field(default="", description="官方报名/准考证打印直达入口")
    announcement_url: Optional[str] = Field(default="", description="官方招录简章与职位表下载出处")
    announcement_text: Optional[str] = Field(default="", description="公告全文与报考条件要点")
    source: str = Field(default="公开招录网", description="数据来源: 国家公务员局 / 各省人事考试网 / 国聘网 / 微信推文提取")
    source_url: Optional[str] = Field(default="", description="原推文/通告出处")

class PublicRecruit(PublicRecruitBase, table=True):
    __tablename__ = "public_recruits"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class PublicRecruitCreate(PublicRecruitBase):
    pass

class PublicRecruitUpdate(SQLModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    target_graduates: Optional[str] = None
    roles_summary: Optional[str] = None
    headcount: Optional[str] = None
    apply_start_date: Optional[str] = None
    apply_end_date: Optional[str] = None
    exam_date: Optional[str] = None
    status: Optional[str] = None
    apply_url: Optional[str] = None
    announcement_url: Optional[str] = None
    announcement_text: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None


