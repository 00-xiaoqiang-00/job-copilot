import sys
import os
import time
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

try:
    import uvicorn
    import webview
    from backend.main import app

    def run_fastapi():
        """在后台线程中启动 FastAPI 服务"""
        try:
            uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")
        except Exception as e:
            with open("server_error.log", "a", encoding="utf-8") as f:
                f.write(f"FastAPI Server Error: {str(e)}\n{traceback.format_exc()}\n")

    if __name__ == "__main__":
        log_msg("=" * 60)
        log_msg("正在启动 Job Copilot 桌面客户端窗口...")
        log_msg("=" * 60)

        # 1. 启动后台服务器线程
        server_thread = threading.Thread(target=run_fastapi, daemon=True)
        server_thread.start()

        # 2. 等待服务就绪
        time.sleep(1.0)

        # 3. 创建原生系统桌面窗口 (基于 Windows Edge/WebView2 引擎)
        window = webview.create_window(
            title="Job Copilot - 个人求职与职位管理系统",
            url="http://127.0.0.1:8000",
            width=1366,
            height=860,
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
    # 如果有 UI 错误，弹窗提示
    try:
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, f"启动失败，详情见日志:\n{str(e)}", "Job Copilot 启动错误", 0x10)
    except Exception:
        pass
