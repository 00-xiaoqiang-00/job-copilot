import os
import sys

# 必须在任何 backend 模块导入前设置 TESTING 环境变量
os.environ["TESTING"] = "1"

import pytest

@pytest.fixture(scope="session", autouse=True)
def clean_test_db():
    yield
    # 测试结束后清理临时数据库文件
    for f in ["test_job_copilot.db", "test_job_copilot.db-wal", "test_job_copilot.db-shm"]:
        if os.path.exists(f):
            try:
                os.remove(f)
            except Exception:
                pass
