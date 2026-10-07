@echo off
chcp 65001 >nul
title Job Copilot v4.5 旗舰版 - 创建桌面快捷方式
cd /d "%~dp0"
echo ====================================================================
echo 正在为 Job Copilot v4.5 旗舰版 创建桌面快捷方式...
echo ====================================================================

set SCRIPT="%TEMP%\CreateShortcut_%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Job Copilot 求职公考全景调研.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0JobCopilot.exe" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.Description = "Job Copilot v4.5 - 极简导航·全网动态搜索·企业全景调研·公考校招情报站" >> %SCRIPT%
echo oLink.IconLocation = "%~dp0app.ico,0" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo 🎉 桌面快捷方式创建成功！已放置在你的 Windows 桌面上。
echo 💡 双击桌面上的【Job Copilot 求职公考全景调研】图标即可秒开运行。
echo.
pause
