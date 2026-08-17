@echo off
chcp 65001 >nul
title Job Copilot 网页版
cd /d "%~dp0"
echo ======================================================
echo 正在启动 Job Copilot 服务并打开浏览器...
echo ======================================================
"D:\Anaconda3\python.exe" run.py
if errorlevel 1 (
    echo.
    echo 启动遇到错误，请查看上方提示
    pause
)
