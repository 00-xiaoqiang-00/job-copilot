@echo off
chcp 65001 >nul
title Job Copilot 一键打包工具
cd /d "%~dp0"
echo ====================================================================
echo 🎯 正在将 Job Copilot 极速打包为 Windows 独立桌面软件...
echo ====================================================================

"D:\Anaconda3\python.exe" -m PyInstaller --noconsole --onedir --add-data "static;static" --add-data "backend;backend" --hidden-import="uvicorn.logging" --hidden-import="uvicorn.loops" --hidden-import="uvicorn.loops.auto" --hidden-import="uvicorn.protocols" --hidden-import="uvicorn.protocols.http" --hidden-import="uvicorn.protocols.http.auto" --hidden-import="uvicorn.protocols.websockets" --hidden-import="uvicorn.protocols.websockets.auto" --hidden-import="uvicorn.lifespan" --hidden-import="uvicorn.lifespan.on" --hidden-import="uvicorn.lifespan.asyncio" --exclude-module PyQt5 --exclude-module PyQt6 --exclude-module PySide2 --exclude-module PySide6 --exclude-module matplotlib --exclude-module scipy --exclude-module IPython --exclude-module pandas --exclude-module pytest --exclude-module tkinter --exclude-module docutils desktop.py -n "JobCopilot" --clean -y

if %errorlevel% equ 0 (
    echo.
    echo ====================================================================
    echo 🎉 打包成功！
    echo 📁 输出目录: %~dp0dist\JobCopilot
    echo 🎁 你只需将 dist 目录下的【JobCopilot】文件夹压缩为 .zip 发给别人即可！
    echo 💡 对方解压后，双击里面的【JobCopilot.exe】即可秒开运行！
    echo ====================================================================
) else (
    echo.
    echo ❌ 打包失败，请检查报错信息。
)
pause
