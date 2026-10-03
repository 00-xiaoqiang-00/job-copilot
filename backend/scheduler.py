import os
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select
from backend.database import engine
from backend.services.campus_recruiter import CampusRecruiterService
from backend.services.public_sector import PublicSectorService
from backend.models import CampusRecruit, PublicRecruit

logger = logging.getLogger("apscheduler")

scheduler: AsyncIOScheduler = None

def get_scheduler() -> AsyncIOScheduler:
    global scheduler
    import asyncio
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if scheduler is None or (scheduler._eventloop and scheduler._eventloop.is_closed()):
        scheduler = AsyncIOScheduler(event_loop=current_loop)
    return scheduler

async def daily_sync_task():
    """每天定时执行的同步任务"""
    logger.info("Starting daily auto-sync for Campus and Public Sector recruits...")
    
    try:
        # 1. 同步校招数据
        campus_data = await CampusRecruiterService.sync_from_open_repos()
        with Session(engine) as session:
            for item in campus_data:
                existing = session.exec(
                    select(CampusRecruit).where(
                        CampusRecruit.company_name == item.get("company_name"),
                        CampusRecruit.recruitment_type == item.get("recruitment_type")
                    )
                ).first()
                if not existing:
                    recruit = CampusRecruit.model_validate(item)
                    session.add(recruit)
                else:
                    if item.get("deadline"): existing.deadline = item["deadline"]
                    if item.get("status"): existing.status = item["status"]
                    if item.get("apply_url"): existing.apply_url = item["apply_url"]
                    existing.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    session.add(existing)
            session.commit()
        logger.info(f"Daily sync: Campus recruits updated. Processed {len(campus_data)} items.")

        # 2. 同步考公考编数据
        public_data = await PublicSectorService.sync_from_open_sources()
        with Session(engine) as session:
            for item in public_data:
                existing = session.exec(
                    select(PublicRecruit).where(
                        PublicRecruit.organization == item.get("organization"),
                        PublicRecruit.title == item.get("title")
                    )
                ).first()
                if not existing:
                    recruit = PublicRecruit.model_validate(item)
                    session.add(recruit)
                else:
                    if item.get("apply_end_date"): existing.apply_end_date = item["apply_end_date"]
                    if item.get("exam_date"): existing.exam_date = item["exam_date"]
                    if item.get("status"): existing.status = item["status"]
                    if item.get("apply_url"): existing.apply_url = item["apply_url"]
                    existing.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    session.add(existing)
            session.commit()
        logger.info(f"Daily sync: Public Sector recruits updated. Processed {len(public_data)} items.")

    except Exception as e:
        logger.error(f"Daily sync failed: {e}")

def start_scheduler():
    """启动调度器，每天早上 10 点更新"""
    import asyncio
    sched = get_scheduler()
    # 每天 10:00 运行一次，使用 replace_existing 避免重复注册崩溃
    sched.add_job(daily_sync_task, 'cron', hour=10, minute=0, id='daily_sync', replace_existing=True)
    if not sched.running:
        sched.start()
        logger.info("APScheduler started: daily sync scheduled at 10:00 AM.")
    
    # 程序启动时，在后台先执行一次初始同步（避免未开机错过10点的定时任务；测试环境下跳过）
    if not os.environ.get("TESTING"):
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(daily_sync_task())
        except RuntimeError:
            pass

def shutdown_scheduler():
    """优雅停止调度器"""
    global scheduler
    if scheduler and scheduler.running:
        try:
            scheduler.shutdown(wait=False)
        except Exception:
            pass
