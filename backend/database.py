import os
from sqlmodel import SQLModel, create_engine, Session

import sys

# 数据库文件路径存储在程序根目录下 (兼容源码运行与 PyInstaller 打包运行)
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(os.path.abspath(sys.executable))
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DB_PATH = os.path.join(BASE_DIR, "job_copilot.db")
sqlite_url = f"sqlite:///{DB_PATH}"

from sqlalchemy import event, text

engine = create_engine(
    sqlite_url, 
    echo=False, 
    connect_args={"check_same_thread": False, "timeout": 30}
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA busy_timeout=30000;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

def init_db():
    """初始化数据库表并执行无损安全迁移"""
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(jobs)"))
            cols = [row[1] for row in result.fetchall()]
            if "job_group" not in cols and len(cols) > 0:
                conn.execute(text("ALTER TABLE jobs ADD COLUMN job_group VARCHAR DEFAULT '默认未分组'"))
                conn.commit()

            # 性能优化：创建常用高频过滤复合索引，加速海量岗位与招录查询
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_jobs_status_group ON jobs(status, job_group);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_jobs_updated ON jobs(updated_at DESC);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_campus_status_ind ON campus_recruits(status, industry);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_public_status_cat ON public_recruits(status, category);"))
            conn.commit()
        except Exception as e:
            print(f"Migration note: {e}")

def get_session():
    """获取数据库会话生成器 (FastAPI 依赖项)"""
    with Session(engine) as session:
        yield session
