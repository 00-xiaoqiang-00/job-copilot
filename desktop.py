import sys
import os
import time
import shutil
import threading
import traceback

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

def cleanup_webview_cache():
    """清理旧版 WebView 缓存，确保加载最新 2.0 界面"""
    try:
        app_data = os.environ.get("APPDATA", "")
        if app_data:
            cache_path = os.path.join(app_data, "pywebview")
            if os.path.exists(cache_path):
                shutil.rmtree(cache_path, ignore_errors=True)
    except Exception:
        pass

try:
    cleanup_webview_cache()
    
    import uvicorn
    import webview
    from backend.main import app

    import socket

    def find_available_port(start_port=8000, max_attempts=50):
        """动态检测并分配可用端口，彻底避免端口占用导致崩溃"""
        for port in range(start_port, start_port + max_attempts):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('127.0.0.1', port))
                    return port
                except OSError:
                    continue
        return start_port

    ACTIVE_PORT = find_available_port(8000)

    def run_fastapi():
        """在后台线程中启动 FastAPI 服务"""
        try:
            uvicorn.run(app, host="127.0.0.1", port=ACTIVE_PORT, log_level="warning")
        except Exception as e:
            with open("server_error.log", "a", encoding="utf-8") as f:
                f.write(f"FastAPI Server Error: {str(e)}\n{traceback.format_exc()}\n")

    if __name__ == "__main__":
        log_msg("=" * 60)
        log_msg(f"正在启动 Job Copilot v4.4 Ultra 桌面客户端窗口 (运行端口: {ACTIVE_PORT})...")
        log_msg("=" * 60)

        # 1. 启动后台服务器线程
        server_thread = threading.Thread(target=run_fastapi, daemon=True)
        server_thread.start()

        # 2. 等待服务就绪
        time.sleep(1.0)

        # 3. 创建原生系统桌面窗口 (带时间戳防止 WebView 缓存)
        timestamp = int(time.time())
        window = webview.create_window(
            title="Job Copilot v4.4 Ultra - 个人求职管理·公考校招雷达·企业全景背调",
            url=f"http://127.0.0.1:{ACTIVE_PORT}/?v=4.4.0&t={timestamp}",
            width=1440,
            height=900,
            min_size=(1024, 680),
            confirm_close=True,
            text_select=True
        )

        # 4. 启动 GUI 主循环 (关闭窗口时会自动退出后台服务)
        webview.start(private_mode=False)

except Exception as e:
    err_str = f"Desktop Client Error: {str(e)}\n{traceback.format_exc()}"
    with open("desktop_error.log", "a", encoding="utf-8") as f:
        f.write(err_str + "\n")
    try:
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, f"启动失败，详情见日志:\n{str(e)}", "Job Copilot 启动错误", 0x10)
    except Exception:
        pass
