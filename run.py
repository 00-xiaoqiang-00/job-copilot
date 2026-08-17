import sys
import os
import uvicorn
import webbrowser
import threading
import time

# 设置控制台输出编码为 utf-8 避免 Windows GBK 报错
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def log_msg(msg):
    try:
        print(msg)
    except Exception:
        pass

def open_browser():
    time.sleep(1.2)
    log_msg("正在打开浏览器: http://127.0.0.1:8000 ...")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    log_msg("=" * 60)
    log_msg("Job Copilot - 个人求职与岗位管理系统启动中...")
    log_msg("访问地址: http://127.0.0.1:8000")
    log_msg("API 文档: http://127.0.0.1:8000/docs")
    log_msg("=" * 60)
    
    # 启动定时器在服务启动后打开浏览器
    threading.Thread(target=open_browser, daemon=True).start()
    
    # 启动 FastAPI 服务
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
