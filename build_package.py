import os
import sys
import shutil
import subprocess

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("=" * 60)
print("🚀 开始一键编译与打包 Job Copilot v4.5 极简导航与全能快捷键旗舰版 便携安装包...")
print("=" * 60)

# 1. 准备快捷方式批处理脚本与使用说明
shortcut_bat = """@echo off
chcp 65001 >nul
title Job Copilot v4.5 旗舰版 - 创建桌面快捷方式
cd /d "%~dp0"
echo ====================================================================
echo 正在为 Job Copilot v4.5 旗舰版 创建桌面快捷方式...
echo ====================================================================

set SCRIPT="%TEMP%\\CreateShortcut_%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\Job Copilot 求职公考全景调研.lnk" >> %SCRIPT%
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
"""

with open(os.path.join(BASE_DIR, "一键创建桌面快捷方式.bat"), "w", encoding="utf-8") as f:
    f.write(shortcut_bat)

readme_txt = """====================================================================
  Job Copilot v4.5 - 极简导航·自研UI套件·全键盘效率·全网动态搜索 (绿色便携版)
====================================================================

【软件简介】
Job Copilot 是一套开箱即用的现代化个人求职全周期追踪、全网动态校招/公考情报与企业全景调研系统。
采用本地 SQLite 数据库独立存储，数据 100% 留在你的电脑本地，隐私安全且永久可控。

【v4.5 核心重磅升级】
1. 🧭 5 大主入口降噪导航与下拉分组：
   - 整合为「求职看板」、「发现 ▾」、「面试日历」、「Offer 对比」、「资料 ▾」5 大核心主入口；
   - 下拉收纳职位搜索、秋招情报、考公国企、企业调研、简历库与漏斗分析，界面极致清爽。
2. ⚡ 纯本地离线秒开支持 (Offline-First)：
   - 预编译静态 Tailwind CSS，本地锁定 Vendor 依赖（Lucide / SortableJS / Chart.js）；
   - 彻底摆脱外部 CDN 依赖，断网亦可秒开，首屏零抖动。
3. 🎨 全套自研现代化 UI 组件库：
   - 全面替代浏览器原生丑陋弹窗，提供防误触、支持 Esc/Tab 焦点陷阱的 UI.confirm()；
   - 悬浮毛玻璃通知卡片 UI.toast() 与统一引导空状态 UI.empty()。
4. ⌨️ 全键盘沉浸式快捷键体系：
   - 随时按 ?（或 Shift+/）唤出快捷键帮助指南面板；
   - 数字键 1-5 快速在 5 大入口间直达切换，N 键快速录入新岗位；
   - Ctrl+K 或 / 快速聚焦搜索框，Esc 退出弹窗或快速清空搜索筛选。
5. 🔗 原职位一键直达外链与模态框背景点击退出：
   - 看板卡片直达原职位外链按钮，免去打开详情；
   - 全站 16 个模态框支持点击半透明暗色背景空白处自动关闭；
   - 岗位拖入「已投递」时智能自动补全当天投递时间戳。
6. 🗂️ 待投企业赛道分组与简历版本聚合 (Wishlist Groups)。
7. 🌐 全网动态多通道搜索 (Live Search Engine)。
8. 🔍 任意企业全景调研与 AI 画像背调。
9. 🏛️ 全国考公考编与央国企专区。
10. ☀️/🌙 全局双主题语义化自适应，无 !important 视觉补丁。

【快速启动说明】
- 方式一 (直接启动)：
  双击文件夹中的【JobCopilot.exe】即可秒开独立桌面窗口！
- 方式二 (桌面快捷方式)：
  双击【一键创建桌面快捷方式.bat】，系统会自动在你的电脑桌面上生成精美图标快捷方式。

【局域网或手机访问 (可选)】
本软件内置轻量级本地服务，启动后在浏览器访问 http://127.0.0.1:8000 即可使用完整网页版。
在同一 WiFi 局域网下，手机输入电脑局域网 IP:8000 亦可直接同步访问！
====================================================================
"""

with open(os.path.join(BASE_DIR, "使用说明.txt"), "w", encoding="utf-8") as f:
    f.write(readme_txt)

print("  [1/4] 辅助脚本与使用说明生成完毕。")

# 2. 调用 PyInstaller 编译
py_exe = sys.executable if os.path.exists(sys.executable) else r"D:\Anaconda3\python.exe"
spec_file = os.path.join(BASE_DIR, "JobCopilot.spec")

print("  [2/4] 正在执行 PyInstaller 独立桌面程序编译...")
cmd = [py_exe, "-m", "PyInstaller", spec_file, "-y"]
res = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True)

if res.returncode != 0:
    print("❌ 编译失败:", res.stderr)
    sys.exit(1)

print("  [OK] PyInstaller 编译成功！生成目标目录: dist/JobCopilot")

# 3. 将图标、快捷方式脚本、使用说明拷贝至 dist/JobCopilot
dist_dir = os.path.join(BASE_DIR, "dist", "JobCopilot")
shutil.copy(os.path.join(BASE_DIR, "app.ico"), os.path.join(dist_dir, "app.ico"))
shutil.copy(os.path.join(BASE_DIR, "一键创建桌面快捷方式.bat"), os.path.join(dist_dir, "一键创建桌面快捷方式.bat"))
shutil.copy(os.path.join(BASE_DIR, "使用说明.txt"), os.path.join(dist_dir, "使用说明.txt"))

# 确保打包后的数据库为全新纯净数据库（复制已验证为0记录的纯净db）
shutil.copy(os.path.join(BASE_DIR, "job_copilot.db"), os.path.join(dist_dir, "job_copilot.db"))

# 确保 static 资源在发布根目录 dist/JobCopilot/static 完整存在（双重保障）
dest_static = os.path.join(dist_dir, "static")
if os.path.exists(dest_static):
    shutil.rmtree(dest_static, ignore_errors=True)
shutil.copytree(os.path.join(BASE_DIR, "static"), dest_static)

print("  [3/4] 资源文件与纯净数据库同步至发布目录完成。")

# 4. 压缩打包并输出
dist_parent = os.path.join(BASE_DIR, "dist")
zip_basename = os.path.join(dist_parent, "JobCopilot_v4.5_极简导航与全能快捷键旗舰版_便携安装包")

print(f"  [4/4] 正在将 release 目录压缩打包: {zip_basename}.zip ...")
archive_format = "zip"
final_zip = shutil.make_archive(zip_basename, archive_format, root_dir=dist_parent, base_dir="JobCopilot")

desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
try:
    shutil.copy(final_zip, os.path.join(desktop_path, "JobCopilot_v4.5_极简导航与全能快捷键旗舰版_便携安装包.zip"))
except Exception as e:
    print(f"复制到桌面跳过: {e}")

zip_size_mb = os.path.getsize(final_zip) / (1024 * 1024)
print("=" * 60)
print(f"🎉 打包全流程顺利完成！")
print(f"📦 产物路径: {final_zip}")
print(f"📏 安装包大小: {zip_size_mb:.2f} MB")
print("=" * 60)
