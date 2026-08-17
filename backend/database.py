import os
from sqlmodel import SQLModel, create_engine, Session

# 数据库文件路径存储在项目根目录下
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "job_copilot.db")
sqlite_url = f"sqlite:///{DB_PATH}"

engine = create_engine(
    sqlite_url, 
    echo=False, 
    connect_args={"check_same_thread": False}
)

def init_db():
    """初始化数据库表"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """获取数据库会话生成器 (FastAPI 依赖项)"""
    with Session(engine) as session:
        yield session
