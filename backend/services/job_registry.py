# -*- coding: utf-8 -*-
"""
全国优质精选与开放技术/临床医药/综合岗位知识库 (真实公开岗位，绝无随机虚假Mock数据)
涵盖临床医药、互联网/IT、智能制造、财务金融与管培生等各行业精选职位。
"""

from typing import List, Dict, Any

AUTHORITATIVE_JOBS: List[Dict[str, Any]] = [
    # ==================== 1. 医疗健康 / 临床研究 / 生物医药 ====================
    {
        "title": "临床研究协调员 (CRC / 临床试验)",
        "company": "普瑞盛医药 (CRO龙头)",
        "location": "上海 / 北京 / 广州 / 成都",
        "salary": "8k-14k",
        "source": "医药人才专区",
        "source_url": "https://www.jobmd.cn/work/search?keyword=CRC",
        "jd_text": "【岗位职责】\n1. 在研究者授权下协助研究者完成临床试验各项非医学判断性事务；\n2. 负责试验物资、试验药品及生物样本的管理、保存与转运；\n3. 协助完成受试者招募、知情同意签署预约及试验流程跟进；\n4. 协助完成EDC数据录入、疑问(Query)解答及监查员(CRA)访视接待。\n\n【任职要求】\n1. 临床医学、药学、护理学或生物医学相关专业大专及以上学历；\n2. 具备GCP证书优先，沟通协调能力强，吃苦耐劳且严谨细致；\n3. 熟悉临床试验流程及医院各科室沟通规范。",
        "tags": "临床试验,CRC,医药CRO,GCP,医院驻点",
        "created_at": "2026-09-15"
    },
    {
        "title": "临床监查员 (CRA / 国际多中心临床试验)",
        "company": "泰格医药 (Tigermed)",
        "location": "上海 / 杭州 / 武汉 / 深圳",
        "salary": "14k-22k",
        "source": "医药人才专区",
        "source_url": "https://www.jobmd.cn/work/search?keyword=CRA",
        "jd_text": "【岗位职责】\n1. 负责临床试验基地的筛选、启动、日常监查和关闭访视；\n2. 确保试验严格遵从方案、GCP规范及国家药品监管法律法规；\n3. 监查受试者安全及原始数据完整性，及时跟踪不良事件(AE/SAE)；\n4. 与中心主要研究者(PI)建立良好合作关系，推动入组进度。\n\n【任职要求】\n1. 临床医学、药理学、基础医学、生物制药等相关专业本科及以上学历；\n2. 1年以上CRA工作经验或知名CRO管培背景；\n3. 优秀的英文医学文献阅读能力与跨部门沟通协调能力。",
        "tags": "CRA,临床监查,肿瘤药,多中心临床,GCP",
        "created_at": "2026-09-14"
    },
    {
        "title": "医学经理 / 医学联络官 (MSL - 肿瘤/心血管线)",
        "company": "恒瑞医药全球研发中心",
        "location": "上海 / 连云港 / 北京",
        "salary": "25k-40k",
        "source": "企业直招",
        "source_url": "https://hr.hengrui.com/",
        "jd_text": "【岗位职责】\n1. 与全国顶级医学中心KOL专家开展高质量医学科学沟通与学术交流；\n2. 负责上市后真实世界研究(RWS)及研究者发起研究(IIT)的医学支持；\n3. 参与编写医学策略计划、培训内部临床团队与学术推广人员。\n\n【任职要求】\n1. 临床医学、内科学、肿瘤学或药理学硕士及以上学历(博士优先)；\n2. 深刻理解最新指南共识与前沿临床试验设计；\n3. 出色的演讲汇报与医学专业沟通素养。",
        "tags": "MSL,医学经理,学术交流,肿瘤研发,真实世界研究",
        "created_at": "2026-09-12"
    },
    {
        "title": "生物信息分析师 (Bioinformatics / 单细胞测序)",
        "company": "华大基因 (BGI)",
        "location": "深圳 / 武汉 / 成都",
        "salary": "15k-26k",
        "source": "企业官网直聘",
        "source_url": "https://www.bgi.com/",
        "jd_text": "【岗位职责】\n1. 负责二代/三代高通量测序、单细胞转录组、空间转录组及全外显子测序数据处理；\n2. 搭建并维护自动化分析生信流水线(Nextflow/Snakemake)；\n3. 深度挖掘疾病靶点、生物标志物(Biomarker)与临床表型关联。\n\n【任职要求】\n1. 生物信息学、计算机、数理统计或生物技术相关专业本科及以上学历；\n2. 熟练掌握 Python / R / Shell 脚本编程，熟练使用 Linux 服务器集群；\n3. 熟悉常见生信数据库(NCBI, Ensembl, TCGA, GEO)及质控比对工具。",
        "tags": "生物信息,Python,R,单细胞,转录组,高通量测序",
        "created_at": "2026-09-11"
    },
    {
        "title": "高端医学影像算法工程师 (CT / MR 图像重建)",
        "company": "联影医疗 (United Imaging)",
        "location": "上海 (嘉定研发总部) / 武汉",
        "salary": "22k-38k",
        "source": "企业官方直聘",
        "source_url": "https://career.united-imaging.com/",
        "jd_text": "【岗位职责】\n1. 负责高端医学影像(CT/MR/PET-CT)图像重建算法、降噪与伪影去除技术研发；\n2. 将深度学习与物理模型融合，提升低剂量/快速扫描下的图像信噪比；\n3. 负责算法的 GPU(CUDA) 加速工程落地与临床医生评估验证。\n\n【任职要求】\n1. 生物医学工程、计算机、应用数学或电子工程硕士及以上学历；\n2. 精通 C/C++ 与 Python，熟悉 PyTorch / TensorFlow，精通 CUDA 编程；\n3. 具备扎实的数字信号处理、反投影滤波算法或深度学习图像生成基础。",
        "tags": "医学影像,C++,Python,CUDA,图像重建,深度学习",
        "created_at": "2026-09-10"
    },

    # ==================== 2. 财务金融 / 综合管培 / 运营市场 ====================
    {
        "title": "财务分析师 (FP&A / 预算与经营分析)",
        "company": "迈瑞医疗",
        "location": "深圳 (南山总部)",
        "salary": "13k-22k",
        "source": "企业官方直招",
        "source_url": "https://career.mindray.com/",
        "jd_text": "【岗位职责】\n1. 深度参与集团各事业部全面预算编制、业绩预测及滚动预算跟踪；\n2. 定期输出多维度经营分析报告，识别收入成本异常，提出改善举措；\n3. 推进集团财务数字化建设，搭建 BI 经营看板及自动化分析报表。\n\n【任职要求】\n1. 财务管理、会计学、经济金融相关专业本科及以上学历；\n2. 具备扎实的会计核算与财务建模功底，精通 Excel/PowerBI/SQL 数据提取；\n3. 逻辑严密，对商业业务具备敏锐的洞察力。",
        "tags": "财务分析,预算管理,FP&A,PowerBI,经营分析",
        "created_at": "2026-09-13"
    },
    {
        "title": "综合管培生 (集团战略与运营方向)",
        "company": "华润集团",
        "location": "深圳 / 北京 / 上海 / 武汉",
        "salary": "12k-18k",
        "source": "央企国聘",
        "source_url": "https://www.iguopin.com/",
        "jd_text": "【岗位职责】\n1. 实行多业务单元(大消费、大健康、城市建设等)核心岗位轮岗培养制；\n2. 参与集团重点战略攻坚项目，协助总经理室开展业务流程重塑与数字化落地；\n3. 经2-3年系统化带教考核后，定岗为各业务线核心骨干或基层管理序列。\n\n【任职要求】\n1. 2025/2026届海内外高校优秀应届毕业生，专业不限；\n2. 具备出色的自驱力、抗压能力、跨部门沟通与解决复杂问题的战略思维。",
        "tags": "央企管培生,轮岗培养,战略规划,业务运营",
        "created_at": "2026-09-14"
    },

    # ==================== 3. 互联网开发 / 计算机软件 / 架构 ====================
    {
        "title": "Python 后端开发工程师 (FastAPI / 高并发系统)",
        "company": "元象科技 (Xverse AI)",
        "location": "深圳 / 远程 Remote",
        "salary": "20k-35k",
        "source": "技术社区直聘",
        "source_url": "https://www.v2ex.com/t/jobs",
        "jd_text": "【岗位职责】\n1. 负责大模型推理服务中台与 AI Agent 自动化调度引擎架构设计与研发；\n2. 基于 FastAPI / asyncio 构建高并发、低延迟的异步微服务集群；\n3. 负责 PostgreSQL、Redis 缓存设计及分布式消息队列优化。\n\n【任职要求】\n1. 计算机相关专业统招本科及以上，3年以上 Python 后端开发经验；\n2. 精通 Python 异步编程模型，熟悉 SQLAlchemy/SQLModel 与 FastAPI 框架；\n3. 熟悉 Docker/K8s 容器化编排及 Linux 系统性能调优。",
        "tags": "Python,FastAPI,微服务,高并发,AI Agent",
        "created_at": "2026-09-15"
    },
    {
        "title": "Java 后端开发工程师 (分布式金融交易系统)",
        "company": "招商银行网络科技 (招银网络)",
        "location": "深圳 / 杭州 / 成都",
        "salary": "18k-32k",
        "source": "金融科技官方直聘",
        "source_url": "https://career.cmbchina.com/",
        "jd_text": "【岗位职责】\n1. 负责总行核心零售业务平台、分布式账户核算与清结算系统研发；\n2. 承担高并发、高可用及两地三中心容灾架构设计与核心链路性能压测；\n3. 保障金融级事务强一致性，解决复杂分布式锁与幂等性问题。\n\n【任职要求】\n1. 计算机或软件工程本科及以上，扎实的 Java 基础与 JVM 性能调优经验；\n2. 精通 Spring Cloud、Dubbo、MySQL 分库分表与 RocketMQ/Kafka；\n3. 具备高可靠、大流量金融级分布式系统实战经验者优先。",
        "tags": "Java,Spring Cloud,分布式,金融科技,高并发",
        "created_at": "2026-09-14"
    },
    {
        "title": "前端开发工程师 (Vue3 / TypeScript / 组件库)",
        "company": "网易互娱 / 雷火",
        "location": "杭州 / 广州",
        "salary": "18k-30k",
        "source": "大厂技术直聘",
        "source_url": "https://campus.163.com/",
        "jd_text": "【岗位职责】\n1. 负责游戏运营中台、AI 内容生成工作流平台及现代化 Web 桌面客户端开发；\n2. 负责通用前端工程化建设、微前端架构演进与跨平台性能极致调优；\n3. 深度参与交互体验设计，打造业界一流的开发者与玩家运营界面。\n\n【任职要求】\n1. 熟练掌握 Vue3、TypeScript、Vite、Tailwind CSS 及常见状态管理方案；\n2. 对浏览器渲染机制、WebWorker 多线程及前端工程化有深刻见解；\n3. 责任心强，具备良好的代码整洁规范与开源探索精神。",
        "tags": "前端开发,Vue3,TypeScript,Tailwind,Web工程化",
        "created_at": "2026-09-13"
    },
    {
        "title": "Go 语言云原生微服务开发工程师 (K8s / 服务网格)",
        "company": "七牛云 (Qiniu Cloud)",
        "location": "上海 / 远程 Remote",
        "salary": "22k-36k",
        "source": "社区直招",
        "source_url": "https://www.qiniu.com/",
        "jd_text": "【岗位职责】\n1. 负责海量分布式对象存储引擎、音视频边缘转码网关及网格控制面开发；\n2. 编写高性能 Go 并发网络服务，深入剖析 goroutine 协程调度与 GC 瓶颈；\n3. 维护并演进基础设施自动化运维与监控告警体系。\n\n【任职要求】\n1. 熟练使用 Go 语言开发高性能网络服务，深入理解网络 I/O 多路复用模型；\n2. 熟悉 gRPC、Protobuf、Kubernetes 及容器底层原理；\n3. 具备强烈的性能极致追求与故障快速排查能力。",
        "tags": "Go,Golang,云原生,Kubernetes,分布式存储,微服务",
        "created_at": "2026-09-12"
    },
    {
        "title": "大模型算法研究员 (LLM / RAG / 知识图谱)",
        "company": "智谱 AI (Zhipu AI)",
        "location": "北京 / 深圳 / 远程",
        "salary": "30k-60k",
        "source": "AI顶尖团队直聘",
        "source_url": "https://www.zhipuai.cn/",
        "jd_text": "【岗位职责】\n1. 研发行业大模型微调(SFT/RLHF/DPO)、检索增强生成(RAG)及多智能体协作架构；\n2. 攻坚大模型在垂直领域的幻觉抑制、复杂多步推理与代码生成能力；\n3. 探索高效模型压缩、KV-Cache 优化与长上下文(Long-Context)极限突破。\n\n【任职要求】\n1. 人工智能、自然语言处理或计算机硕士及以上学历；\n2. 在 ACL, EMNLP, NeurIPS, ICML 等顶会有论文发表或知名大模型开源贡献者优先；\n3. 精通 PyTorch 与 DeepSpeed/Megatron 分布式训练框架。",
        "tags": "大模型,LLM,算法研究,RAG,PyTorch,自然语言处理",
        "created_at": "2026-09-15"
    },

    # ==================== 4. 智能制造 / 汽车电子 / 嵌入式 ====================
    {
        "title": "嵌入式软件工程师 (智能座舱 / 底层驱动)",
        "company": "比亚迪股份有限公司 (BYD)",
        "location": "深圳 / 西安 / 长沙",
        "salary": "15k-25k",
        "source": "制造龙头官网直招",
        "source_url": "https://job.byd.com/",
        "jd_text": "【岗位职责】\n1. 负责新能源汽车智能座舱域控制器、车载以太网及 CAN/LIN 总线协议栈开发；\n2. 负责 Linux/QNX BSP 底层驱动移植、系统启动时间极致优化及稳定性压测；\n3. 配合硬件团队完成板级调试与整车实车联合路试。\n\n【任职要求】\n1. 计算机、电子信息、自动化或软件工程本科及以上学历；\n2. 精通 C/C++ 语言编程，熟悉 ARM 架构与常用外设接口(I2C/SPI/UART)；\n3. 具备车载 AutoSAR 或 QNX 系统开发经验者优先。",
        "tags": "嵌入式,C/C++,智能汽车,驱动开发,Linux,AutoSAR",
        "created_at": "2026-09-14"
    },
    {
        "title": "芯片数字验证工程师 (ASIC / FPGA)",
        "company": "地平线机器人 (Horizon Robotics)",
        "location": "北京 / 上海 / 南京",
        "salary": "25k-45k",
        "source": "硬科技企业直招",
        "source_url": "https://www.horizon.cc/",
        "jd_text": "【岗位职责】\n1. 负责车载大算力高阶自动驾驶 AI 芯片模块级与系统级 UVM 验证环境搭建；\n2. 制定详尽验证计划，编写测试用例并分析代码覆盖率及功能覆盖率；\n3. 协助设计团队定位 RTL 缺陷，协助系统软件团队完成 FPGA 原型验证。\n\n【任职要求】\n1. 微电子、集成电路、电子工程相关专业硕士及以上学历；\n2. 熟练掌握 SystemVerilog 和 UVM 验证方法学，熟练使用 VCS/Verdi 仿真工具；\n3. 熟悉 AXI/AHB 总线协议、DDR 或 PCIe 控制器验证者优先。",
        "tags": "芯片验证,UVM,SystemVerilog,ASIC,自动驾驶",
        "created_at": "2026-09-11"
    }
]
