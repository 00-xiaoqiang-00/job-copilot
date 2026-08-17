@echo off
chcp 65001 >nul
title Job Copilot 桌面客户端
cd /d "%~dp0"
echo ======================================================
echo 正在启动 Job Copilot 桌面客户端...
echo ======================================================
"D:\Anaconda3\python.exe" desktop.py
if errorlevel 1 (
    echo.
    echo 启动遇到错误，请查看上方提示或 desktop_error.log
    pause
)
