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
print("🚀 开始一键编译与打包 Job Copilot v4.3 全网动态检索旗舰版 便携安装包...")
print("=" * 60)

# 1. 准备快捷方式批处理脚本与使用说明
shortcut_bat = """@echo off
chcp 65001 >nul
title Job Copilot v4.3 旗舰版 - 创建桌面快捷方式
cd /d "%~dp0"
echo ====================================================================
echo 正在为 Job Copilot v4.3 旗舰版 创建桌面快捷方式...
echo ====================================================================

set SCRIPT="%TEMP%\\CreateShortcut_%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\Job Copilot 求职公考全景调研.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0JobCopilot.exe" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.Description = "Job Copilot v4.3 - 全网动态搜索·企业全景调研·公考校招情报站" >> %SCRIPT%
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
  Job Copilot v4.4 - 待投分组聚合·全网动态搜索·企业全景调研 (绿色便携版)
====================================================================

【软件简介】
Job Copilot 是一套开箱即用的现代化个人求职全周期追踪、全网动态校招/公考情报与企业全景调研系统。
采用本地 SQLite 数据库独立存储，数据 100% 留在你的电脑本地，隐私安全且永久可控。

【v4.4 核心重磅升级】
1. 🗂️ 待投企业赛道分组与简历版本聚合 (Wishlist Grouping & Resume Mapping)：
   - 支持将待投企业按投递赛道（如算法AI组、后端开发组、临床医药CRA组、管培生组）或同一份简历版本聚合分块；
   - 看板「意向待投」列支持【折叠卡夹分组视图】与【常规平铺视图】一键切换；
   - 分组卡夹直观展示专属简历绑定标签（如 📄 专属简历: 算法专用版v2）；
   - 支持「🚀 一键投递全组」，秒级将整组企业转入已投递并自动记录投递时间；
   - 配套【待投赛道与简历分组中心】，支持可视化查看分组统计、批量调配与赛道聚焦。
2. 🌐 全网动态多通道搜索 (Live Search Engine)：
   - 彻底打破“仅靠静态预录”限制！搜索任意企业或岗位时，系统动态抓取全国高校就业网（上海交大、东南大学等）与名企网申公告；
   - 实时解析岗位类型、内推码、网申直达链接，并支持【一键导入本地求职看板】。
3. 🔍 任意企业全景调研与AI画像：
   - 无论是跨国500强（如IQVIA、药明康德、罗氏），还是新能源龙头（宁德时代、比亚迪）、科技互联网大厂；
   - 实时调取权威百科 OpenAPI 与全网信源，自动梳理企业成立时间、总部地址、人员规模、业务概览、WLB加班风评、高频面试真题与深度背调入口。
4. 🏛️ 全国考公考编与央国企专区：
   - 覆盖国考、各省省考、定向选调、事业单位与央企国企；
   - 支持智能日程转化与报名倒计时提醒。
5. ☀️ 现代清爽视觉与自适应交互：
   - 纯净现代白色卡片质感，支持深浅模式自由切换；
   - 纯净出厂无垃圾占位数据，全功能支持本地自闭环。

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
zip_basename = os.path.join(dist_parent, "JobCopilot_v4.4_待投分组与全网检索旗舰版_便携安装包")

print(f"  [4/4] 正在将 release 目录压缩打包: {zip_basename}.zip ...")
archive_format = "zip"
final_zip = shutil.make_archive(zip_basename, archive_format, root_dir=dist_parent, base_dir="JobCopilot")

desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
try:
    shutil.copy(final_zip, os.path.join(desktop_path, "JobCopilot_v4.4_待投分组与全网检索旗舰版_便携安装包.zip"))
except Exception as e:
    print(f"复制到桌面跳过: {e}")

zip_size_mb = os.path.getsize(final_zip) / (1024 * 1024)
print("=" * 60)
print(f"🎉 打包全流程顺利完成！")
print(f"📦 产物路径: {final_zip}")
print(f"📏 安装包大小: {zip_size_mb:.2f} MB")
print("=" * 60)
