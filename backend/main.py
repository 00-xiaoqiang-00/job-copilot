import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from backend.database import init_db, engine
from backend.models import Job, Interview, ResumeProfile
from backend.routes import jobs, interviews, resumes, search, ai

# 初始数据填充（首次启动时体验更丝滑）
def seed_demo_data():
    with Session(engine) as session:
        existing = session.exec(select(Job)).first()
        if not existing:
            # 种子岗位 1: 面试中
            job1 = Job(
                title="Python 后端开发工程师",
                company="腾讯科技 (TEG 事业群)",
                location="深圳·南山",
                salary="25k-40k·16薪",
                status="interview",
                source="Boss直聘",
                source_url="https://www.zhipin.com/job_detail/demo1.html",
                tags="Python,FastAPI,Redis,高并发,Docker",
                priority=1,
                resume_version="Python后端特化版_v2",
                resume_key_points="重点阐述秒杀系统高并发削峰、Redis 分布式锁与异步任务队列架构实战；强调接口性能优化经验。",
                skill_gaps="对 K8s 复杂编排与容器监控 Prometheus 了解较少，面试前需突击背诵常用概念与排查思路。",
                interview_strategy="自我介绍突出 Python 底层 GIL 与异步 FastAPI 优势；对于微服务治理结合项目展开。",
                applied_at="2026-08-10",
                jd_text="岗位职责：\n1. 负责海量高并发业务后台核心模块的设计与开发；\n2. 负责微服务架构演进、性能调优与稳定性保障；\n3. 参与关键技术难题攻关。\n\n任职要求：\n1. 本科及以上学历，精通 Python 语言，熟练掌握 FastAPI/Django/Flask 框架；\n2. 深入理解 MySQL、Redis 等数据库及缓存中间件，具备调优经验；\n3. 熟悉 Docker 容器化技术与 Linux 开发环境；\n4. 具备良好的编码规范与团队协作精神。"
            )
            session.add(job1)
            session.commit()
            session.refresh(job1)

            # 种子面试记录
            interview1 = Interview(
                job_id=job1.id,
                round_name="技术一面 (视频面)",
                interview_time="2026-08-18 14:30",
                meeting_link="腾讯会议: 888-999-666",
                interviewer="李老师 (资深架构师)",
                questions_notes="1. Python GIL 的底层原理，多进程与多线程选型？\n2. Redis 分布式锁怎么解决死锁和续期问题 (Redlock / Lua)？\n3. 慢 SQL 优化步骤与索引失效场景？",
                retrospective="总体发挥不错，分布式锁的 Lua 脚本写出来了，但对 Redis 内存淘汰策略（LRU/LFU）回答稍显犹豫，需要补课。",
                result="passed"
            )
            session.add(interview1)

            # 种子岗位 2: 已投递
            job2 = Job(
                title="全栈工程师 (Remote)",
                company="Arbeit Tech (海外远程)",
                location="Remote (全球远程)",
                salary="$4000-$6000/月",
                status="applied",
                source="RemoteOK",
                source_url="https://remoteok.com/remote-jobs/demo2",
                tags="Python,FastAPI,React,TypeScript",
                priority=1,
                resume_version="全栈开发英文版_v1",
                resume_key_points="突出独立开发端到端全栈 Web 项目能力，强调异步 API 设计与现代化 UI 交互。",
                skill_gaps="英文日常交流流畅度需要继续多练口语。",
                interview_strategy="准备好英文自我介绍和项目演示 Demo 链接。",
                applied_at="2026-08-12",
                jd_text="We are looking for a skilled Fullstack Engineer with strong proficiency in Python (FastAPI) and modern JavaScript (React/Vue). Experience with asynchronous architectures and cloud deployments is preferred."
            )
            session.add(job2)

            # 种子岗位 3: 意向待投
            job3 = Job(
                title="后端研发工程师",
                company="字节跳动 (抖音电商)",
                location="北京·海淀",
                salary="30k-50k·15薪",
                status="wishlist",
                source="内推",
                contact_person="师兄微信: tech_referral_01",
                tags="Python,Go,微服务,分布式",
                priority=2,
                resume_version="Python后端特化版_v2",
                resume_key_points="突出分布式高可用系统设计与消息队列 Kafka 使用经验。",
                skill_gaps="Go 语言基础语法需要复习。",
                jd_text="岗位职责：负责电商核心交易链条、营销活动高并发架构设计与开发。"
            )
            session.add(job3)

            # 默认简历
            resume1 = ResumeProfile(
                version_name="Python后端特化版_v2",
                target_role="Python 后端开发工程师 / 资深工程师",
                raw_content="熟练掌握 Python 核心语法、GIL 底层机制、元类与 asyncio 异步并发编程；精通 FastAPI、SQLAlchemy、SQLite 与 RESTful API 架构开发；具备 MySQL 索引调优、Redis 缓存设计（防雪崩/穿透/击穿）与分布式锁实战经验；熟练使用 Docker 容器化技术、Linux 常用运维指令与 Git 团队协作。",
                highlights="Python, FastAPI, 异步编程, Redis, MySQL, Docker, Linux, RESTful API"
            )
            session.add(resume1)

            session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库与演示数据
    init_db()
    seed_demo_data()
    yield

app = FastAPI(
    title="Job Copilot - 个人求职与岗位管理系统",
    description="全生命周期求职追踪、多源岗位搜索、JD快照、简历针对性标注与AI复盘助手",
    version="1.0.0",
    lifespan=lifespan
)

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(jobs.router)
app.include_router(interviews.router)
app.include_router(resumes.router)
app.include_router(search.router)
app.include_router(ai.router)

# 静态资源挂载
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_index():
    """主页直接提供前端 Single Page Application"""
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Job Copilot API is running. Visit /docs for Swagger UI."}
