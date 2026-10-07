# 🎯 Job Copilot v4.5 - 个人全栈求职管理与智能决策系统 (旗舰版)

> **一个专为个人求职者打造的全栈生命周期求职管理与智能决策系统。**  
> 解决海投管理混乱、JD快照丢失、简历针对性标注模糊、多渠道岗位分散、Offer决策盲目与面试复盘无处沉淀的痛点。

---

## 🌟 核心特性一览

### 1. 📊 拖拽式自适应求职看板 (Adaptive Kanban Pipeline)
- **6 大生命周期阶段**：`意向待投` → `已投递` → `初筛/笔试` → `技术面试` → `已获 Offer` → `未通过/归档`。
- **待投企业自定义分组 (Wishlist Groups)**：支持为“意向待投”企业创建专属分组（如按简历版本“Python后端投递组”、“大厂核心组”、“外企远程组”等），一键折叠/展开、按分组快速筛选、卡片直观呈现分组徽章。
- **全视口自适应布局**：在不同分辨率和缩放比例下，6 列泳道自动等比适配填充屏幕，告别横向溢出，卡片信息密度与滚动条智能优化。
- **跨列拖拽流转**：状态与后端本地 SQLite 数据库实时毫秒级同步，拖入“已投递”智能自动补全投递日期。
- **卡片直达外链**：卡片底部配备原职位一键外链跳转按钮，免点详情即可直达。
- **多维实时过滤**：支持按渠道、分组、优先级与关键词即时检索。

### 2. 🧭 5 大主入口导航与分组体验 (v4.5 新增)
- **极简降噪架构**：整合为 `求职看板`、`发现 ▾`、`面试日历`、`Offer 对比`、`资料 ▾` 5 大核心主入口。
- **下拉分组收纳**：「发现」收纳职位搜索、秋招情报、考公国企与企业调研；「资料」收纳简历库与漏斗分析。
- **全局自研 UI 套件 (`UI`)**：全面替换原生粗糙弹窗，包含 `UI.confirm()`（防误触危险确认框）、`UI.toast()`（悬浮毛玻璃通知）与 `UI.empty()`（统一引导空状态）。

### 3. ⌨️ 全键盘快捷键沉浸体验 (v4.5 新增)
- 按 <kbd>?</kbd>（或 <kbd>Shift</kbd>+<kbd>/</kbd>）随时唤出快捷键帮助指南面板。
- <kbd>1</kbd> ~ <kbd>5</kbd> 快速切换主导航板块。
- <kbd>N</kbd> 键看板快速呼出岗位录入。
- <kbd>Ctrl+K</kbd> / <kbd>/</kbd> 快速聚焦搜索框，<kbd>Esc</kbd> 极速关闭模态框或清空筛选。

### 4. 🧩 浏览器一键采集插件 (Chrome / Edge Extension)
- 位于 `extension/` 目录，支持加载到 Chrome 或 Edge 浏览器。
- 打开 **Boss直聘、猎聘、牛客、拉勾、企业官网** 等任意职位页，点击浏览器插件图标即可一键提取岗位名称、公司、薪酬、地点及完整 JD，秒级同步录入到本地看板。

### 5. 📅 面试排期日历 & 桌面倒计时提醒
- 独立月度日历排期网格，可视化标注各轮面试安排。
- **近期待面试倒计时卡片**，精确到天与小时。
- 接入系统 Web Notification 机制，在面试前 30 分钟弹出 Windows 桌面通知提醒。

### 6. 📄 简历版本库 & PDF 简历直接解析
- 支持维护不同侧重点的简历（Python后端特化版、全栈通用版、英文版等）。
- **支持拖拽上传 PDF 简历文件**，自动提取多页文本并智能归纳核心技术栈标签。
- **岗位专属针对性标注**：为特定岗位标注“面试时重点突出的经历”、“自我评估的技能 Gap 短板”与“自我介绍策略”。

### 7. ⚖️ 多 Offer 科学决策与真实时薪测算器
- 拒绝“虚高总包”陷阱，综合底薪、年终奖、每月补贴、实际日工时、单双休、带薪年假与通勤耗时。
- 精准测算**【真实税后时薪 (Real Hourly Rate)】**、**【预估税后到手年薪】**与【综合性价比得分】。
- 配备 **Chart.js 5 维多维度对比雷达图**（薪资总包、真实时薪性价比、平台前景、福利保障、通勤便利）。

### 8. 🤖 通用大模型深度赋能 (OpenAI 协议兼容)
- **100% 开放通用**：支持接入任何符合 OpenAI 格式的 API（如 OpenAI 官方、硅基流动、月之暗面 Kimi、智谱 GLM、通义千问、DeepSeek、本地 Ollama / LM Studio、OneAPI / 自定义中转）。
- **AI 针对性简历改写建议**：对比目标 JD 与简历，运用 STAR 原则生成改写文案与破冰话术。
- **AI 模拟面试官多轮对练**：针对具体岗位进行互动式技术面试，包含回答点评、1-10 分打分与循序渐进追问。
- **离线规则降级保护**：未配置 API Key 时自动启用内置本地规则库，离线亦可流畅运行。

### 9. 🌐 全网实时岗位聚合检索与一键导入 (Multi-Engine Job Aggregator)
- **多引擎全网实时搜索**：聚合主流招聘平台公开岗位数据，支持岗位名、城市、技能关键词综合检索。
- **自动增量拉新与智能更新**：支持一键刷新最新发布职位，后台比对防重，标记“新发布”标签。
- **一键纳管到看板**：搜索结果一键直接转入“意向待投”并可指定归属分组，无缝衔接求职全流程。
- **TTL 缓存与复合索引加速**：内置 5 分钟 TTL 本地检索缓存与防抖机制，极大节省网络请求并保障极速响应。

### 10. ☀️/🌙 全局双主题与纯本地离线支持 (Offline-First)
- 预编译静态 Tailwind CSS 与本地化 Vendor 库（SortableJS / Lucide / Chart.js），首屏零闪烁，断网秒开。
- 深度优化的深浅色主题适配，消除 `!important` 视觉补丁，卡片与图表配色自适应切换。

---

## 🛠️ 技术架构

- **后端**：Python 3.12 + **FastAPI** + **Pydantic**
- **数据库**：**SQLite + SQLModel (SQLAlchemy)**（零配置，本地文件存储 `job_copilot.db`）
- **PDF解析**：`pypdf`
- **抓取与网络**：`httpx` + `BeautifulSoup4`
- **桌面 GUI**：**pywebview** (基于 Windows Edge/WebView2 引擎)
- **前端**：HTML5 + **Tailwind CSS** + **Lucide Icons** + **SortableJS** + **Chart.js**

---

## 🚀 启动与使用方式

### 方式 A：双击运行桌面客户端（推荐）
- 直接双击桌面上的快捷方式 **`Job Copilot`**，或运行目录下的 **`启动桌面客户端(无黑框).vbs`** 即可极速秒开原生桌面窗口。

### 方式 B：通过 Python 脚本运行
```powershell
python run.py
```
访问：
- 🖥️ **Web 应用主页**：[http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **API 文档 (Swagger UI)**：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 方式 C：Docker 一键部署
```bash
docker compose up -d
```

---

## 📁 项目目录结构

```
job-copilot/
├── backend/                  # Python 后端服务
│   ├── database.py           # SQLite 数据库引擎与会话管理
│   ├── models.py             # 岗位、面试、简历、Offer、系统设置 SQLModel 模型
│   ├── main.py               # FastAPI 主入口与演示数据填充
│   ├── routes/               # API 路由 (jobs, interviews, resumes, search, ai, offers, settings)
│   └── services/             # 业务服务 (pdf_parser, offer_calculator, llm_client, job_searcher)
├── extension/                # Chrome / Edge 浏览器采集插件
│   ├── manifest.json         # 扩展配置清单 V3
│   ├── popup.html / popup.js # 采集弹窗界面与同步逻辑
│   ├── content.js            # 招聘页面 DOM 智能抓取器
│   └── README.md             # 插件安装说明
├── static/                   # 前端静态单页应用 (SPA)
│   ├── index.html            # 主界面 HTML
│   ├── css/style.css         # 主题与自定义样式
│   └── js/                   # 模块脚本 (theme, kanban, calendar, offer, search, resume, ai_deep, analytics, app)
├── tests/                    # 集成测试套件
│   └── test_advanced_features.py
├── requirements.txt          # Python 依赖清单
├── desktop.py                # 桌面客户端入口
├── run.py                    # Web 服务启动入口
├── 启动桌面客户端(无黑框).vbs # 双击无黑框启动脚本
├── 一键打包成exe.bat         # PyInstaller 独立桌面版打包脚本
└── README.md                 # 项目详细文档
```

---

## 📄 开源许可证

本项目基于 MIT License 开源。
