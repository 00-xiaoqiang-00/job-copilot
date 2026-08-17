# 🎯 Job Copilot - 个人全栈求职管理与职位发现系统

一个专为个人求职者打造的全栈生命周期求职管理工具。解决海投管理混乱、JD快照丢失、简历针对性标注模糊、多渠道岗位分散与面试复盘无处沉淀的痛点。

---

## 🌟 核心特性

1. **📊 拖拽式求职看板 (Kanban Pipeline)**
   - 6 大生命周期阶段：`意向待投` → `已投递` → `初筛/笔试` → `技术面试` → `已获 Offer` → `未通过/归档`。
   - 原生丝滑跨列拖拽，状态与后端 SQLite 数据库实时同步。
   - 支持按渠道（Boss直聘、猎聘、牛客、V2EX、内推等）、优先级、关键词实时多维过滤。

2. **🎯 个人简历针对性标注与面试策略 (亮点功能)**
   - **多简历版本库**：支持维护不同侧重点的简历（如：Python后端特化版、全栈通用版、英文版）。
   - **岗位专属标注**：针对每个特定岗位，标注“本岗位面试时重点突出的项目经历”、“自我评估的技能 Gap 短板”与“自我介绍侧重点”。
   - **AI 智能匹配度诊断**：一键将目标岗位 JD 与你的简历进行技能拓扑比对，高亮已命中技能与缺失短板，提供针对性投递与突击准备建议。

3. **🌐 全网开放职位聚合搜索与一键导入**
   - 实时聚合 **V2EX 酷工作**、**RemoteOK 全球远程技术岗** 等开放招聘数据源。
   - 搜索结果卡片支持 **“一键导入到我的看板”**，自动提取职位、公司、薪资、渠道与完整 JD 快照。
   - **网页 JD 一键快照抓取**：输入任意招聘网页链接，自动解析提取岗位正文快照。

4. **📝 多轮面试记录与复盘沉淀 (Retrospectives)**
   - 记录每一轮面试的时间、地点/会议号、面试官信息。
   - 结构化沉淀被问到的 **笔试/面试真题与自我答题漏洞复盘**。
   - **AI 面试预测题**：根据岗位 JD 要求，一键自动生成 5~10 道高频技术和项目预测题。

5. **📈 求职漏斗与数据可视化分析**
   - 实时统计投递总数、推进中岗位数、初筛回复转化率与 Offer 数。
   - 阶段分布环形图与求职信息渠道分布柱状图。

---

## 🛠️ 技术架构

- **后端**：Python 3.12 + **FastAPI** + **Pydantic**
- **数据库**：**SQLite + SQLModel (SQLAlchemy)**（零配置，本地文件存储 `job_copilot.db`）
- **抓取与网络**：`httpx` + `BeautifulSoup4`
- **前端**：HTML5 + **Tailwind CSS** + **Lucide Icons** + **SortableJS** + **Chart.js**
- **前后端架构**：FastAPI 统一托管 RESTful API 与静态前端页面，单命令一键启动。

---

## 🚀 极速启动方式

打开终端（PowerShell 或 CMD），进入项目目录并运行：

```powershell
cd C:\Users\hxq\.gemini\antigravity\scratch\job-copilot
python run.py
```

服务启动后将自动在浏览器中打开：
- 🖥️ **Web 应用主页**：[http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **交互式 API 文档 (Swagger UI)**：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📁 项目目录结构

```
job-copilot/
├── backend/                  # Python 后端
│   ├── database.py           # SQLite 数据库引擎与会话管理
│   ├── models.py             # 岗位、面试、简历 SQLModel 数据模型
│   ├── main.py               # FastAPI 主入口与演示数据填充
│   ├── routes/               # API 路由
│   │   ├── jobs.py           # 岗位 CRUD 与统计接口
│   │   ├── interviews.py     # 面试记录与复盘接口
│   │   ├── resumes.py        # 简历版本库接口
│   │   ├── search.py         # 在线职位检索与网页解析接口
│   │   └── ai.py             # AI 技能匹配与面试题预测接口
│   └── services/             # 核心业务服务
│       ├── job_searcher.py   # V2EX / RemoteOK 聚合抓取服务
│       └── ai_assistant.py   # 智能技能提取与预测题生成引擎
├── static/                   # 前端静态单页应用 (SPA)
│   ├── index.html            # 主界面 HTML
│   ├── css/
│   │   └── style.css         # 自定义视觉样式
│   └── js/
│       ├── api.js            # API 请求客户端
│       ├── kanban.js         # 看板渲染与拖拽流转
│       ├── search.js         # 职位发现与一键导入
│       ├── resume.js         # 简历版本管理与 AI 诊断
│       ├── analytics.js      # 图表统计渲染
│       └── app.js            # 应用主控制器与弹窗管理
├── requirements.txt          # Python 依赖清单
├── run.py                    # 一键启动脚本
└── README.md                 # 项目文档
```
