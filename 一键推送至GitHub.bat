@echo off
chcp 65001 >nul
title 推送 Job Copilot 到 GitHub
echo ========================================================
echo   Job Copilot v4.4 -^> GitHub (00-xiaoqiang-00/job-copilot)
echo ========================================================
echo.
set "PATH=C:\Users\hxq\AppData\Roaming\MobaXterm\slash\mx86_64b\bin;C:\Users\hxq\AppData\Roaming\MobaXterm\slash\mx86_64b\usr\git\git-core;%PATH%"
echo 正在推送到 GitHub main 分支...
echo.
echo 提示：GitHub 现需使用 Personal Access Token (PAT) 作为密码验证。
echo.
git.exe push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   [成功] 迭代版本已成功推送到您的 GitHub 项目！
    echo   https://github.com/00-xiaoqiang-00/job-copilot
    echo ========================================================
) else (
    echo.
    echo [提示] 推送遇到权限验证问题。
    echo 若提示需要 Token，请在 GitHub -^> Settings -^> Developer Settings
    echo -^> Personal access tokens (classic) 生成并勾选 repo 权限。
)
echo.
pause
