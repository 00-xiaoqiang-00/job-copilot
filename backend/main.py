import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import init_db
from backend.routes import jobs, interviews, resumes, search, ai, offers, settings, campus, public_sector, company
from backend.scheduler import start_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时仅初始化数据表结构，不注入任何演示数据
    init_db()
    
    # 启动定时同步调度器
    start_scheduler()
    
    yield
    
    # 优雅关闭定时调度器，释放事件循环
    shutdown_scheduler()


app = FastAPI(
    title="Job Copilot - 个人求职管理与公考校招情报站",
    description="全生命周期求职追踪、考公考编国企雷达、秋招情报站、Offer真实时薪测算与AI助手",
    version="4.5.0",
    lifespan=lifespan
)

# 允许跨域（允许浏览器插件与外部客户端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 强制禁用 HTTP 响应缓存中间件（彻底杜绝 WebView 渲染旧版 HTML/JS）
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/static/vendor/"):
        # 第三方库已锁定版本 (URL 带 ?v=),可放心长期缓存,加快启动
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# 注册 API 路由
app.include_router(jobs.router)
app.include_router(interviews.router)
app.include_router(resumes.router)
app.include_router(search.router)
app.include_router(ai.router)
app.include_router(offers.router)
app.include_router(settings.router)
app.include_router(campus.router)
app.include_router(public_sector.router)
app.include_router(company.router)

import sys

def find_static_dir() -> str:
    """寻找静态资源目录 (兼容 PyInstaller v6+ onedir/onefile, _MEIPASS, _internal 与本地源码)"""
    candidate_paths = []
    
    # 1. PyInstaller 运行时解压/绑定的 _MEIPASS 目录
    if hasattr(sys, '_MEIPASS'):
        candidate_paths.append(os.path.join(sys._MEIPASS, "static"))
        
    # 2. 如果是打包后的 exe，检查 exe 所在同级目录及 _internal 目录
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        candidate_paths.append(os.path.join(exe_dir, "static"))
        candidate_paths.append(os.path.join(exe_dir, "_internal", "static"))
        
    # 3. 本地源码运行路径
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    candidate_paths.append(os.path.join(curr_dir, "static"))
    candidate_paths.append(os.path.join(os.path.dirname(curr_dir), "static"))
    candidate_paths.append(os.path.join(os.path.dirname(os.path.dirname(curr_dir)), "static"))

    for p in candidate_paths:
        if os.path.exists(os.path.join(p, "index.html")):
            return p

    for p in candidate_paths:
        if os.path.exists(p):
            return p

    fallback = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
    os.makedirs(fallback, exist_ok=True)
    return fallback

STATIC_DIR = find_static_dir()

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_index():
    """主页直接提供前端 Single Page Application (带强禁缓存响应头)"""
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(
            index_file,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    return {"message": "Job Copilot API is running. Visit /docs for Swagger UI."}
