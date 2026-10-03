# -*- coding: utf-8 -*-
"""
全国重点行业知名企业真实全景档案与背调知识库
覆盖：互联网/软件、通信/硬件芯片/智能制造、生物医药/医疗器械、央国企/科研院所、金融/银行/证券等龙头。
提供企业属性、WLB加班指数、薪资福利体系、面试流程风格及避坑指南。
"""

from typing import List, Dict, Any, Optional

COMPANY_PROFILES_KB: List[Dict[str, Any]] = [
    # ==================== 1. 互联网与泛软件大厂 ====================
    {
        "name": "腾讯科技 (Tencent)",
        "aliases": ["腾讯", "tencent", "企鹅", "腾讯互娱", "微信", "wxg", "teg", "csig", "pcg", "ieg"],
        "industry": "互联网 / 社交 / 互动娱乐 / 云计算",
        "company_type": "知名上市公司 / 互联网头部大厂",
        "headquarters": "广东深圳 (南山腾讯滨海大厦)",
        "scale": "100,000+ 人",
        "founded_year": 1998,
        "website": "https://www.tencent.com",
        "wlb_level": "中等偏良 (部门差异大)",
        "wlb_badge": "yellow",
        "work_hours": "通常 10:00 - 21:00 (WXG / 游戏核心组加班较多，TEG/CSIG相对平稳，周末双休，加班有正规宵夜券与打车报销)",
        "salary_benefits": "通常 16-18 薪（公积金 12% 顶格），租房补贴、安居计划无息借款最高90万、免费班车、免费早餐、企鹅节专属关怀。",
        "interview_style": "通常 3~4 轮技术面 + 1 轮 HR 面。极其注重底层计算机网络 (TCP/IP、HTTP)、高并发架构设计、手撕算法 (LeetCode 中等偏上) 与海量分布式系统实战，WXG 面试偏极客风格。",
        "risk_tips": "内部各事业群 (BG) 文化风格差异极大，微信事业群 (WXG) 强度较高但年终奖丰厚；需留意项目组具体业务线是否处于成长期。",
        "highlights": "国内技术底蕴最深厚的平台之一，基础架构与海量服务经验公认度极高。"
    },
    {
        "name": "字节跳动 (ByteDance)",
        "aliases": ["字节", "bytedance", "今日头条", "抖音", "tiktok", "火山引擎", "飞书"],
        "industry": "移动互联网 / 算法推荐 / 电商 / 广告",
        "company_type": "全球超级独角兽 / 科技领军企业",
        "headquarters": "北京 (海淀中关村 / 望京)",
        "scale": "120,000+ 人",
        "founded_year": 2012,
        "website": "https://www.bytedance.com",
        "wlb_level": "节奏紧凑 / 高效狼性",
        "wlb_badge": "red",
        "work_hours": "通常 10:00 - 21:30+ (已取消大小周，周末双休，但工作日业务节奏与 OKR 导向非常强，崇尚 Context, not Control)。",
        "salary_benefits": "现金流与薪酬待遇行业第一梯队（通常 15-18 薪），就近租房补贴 (1500-2000元/月)、全天免费四餐 (三餐+下午茶)、健身房与优质五险一金。",
        "interview_style": "标准 3 轮技术面 + 1 轮 HR 交叉面。每轮必考手撕代码 (LeetCode 原题或变体，写完即测边界条件)，考察系统设计、Go / Python / Java 高性能并发编程与业务敏锐度。",
        "risk_tips": "OKR 考核严格，人员迭代与业务孵化淘汰速度较快，抗压能力要求较高。",
        "highlights": "技术基础设施与协同工具（飞书体系）极度先进，年轻人晋升通道相对透明扁平。"
    },
    {
        "name": "阿里巴巴集团 (Alibaba)",
        "aliases": ["阿里", "alibaba", "淘宝", "天猫", "阿里云", "菜鸟", "蚂蚁集团", "盒马"],
        "industry": "电子商务 / 云计算 / 金融科技 / 智慧物流",
        "company_type": "知名上市公司 / 综合数字商业巨头",
        "headquarters": "浙江杭州 (余杭西溪园区)",
        "scale": "200,000+ 人",
        "founded_year": 1999,
        "website": "https://www.alibaba.com",
        "wlb_level": "中等 / 业务分化",
        "wlb_badge": "yellow",
        "work_hours": "通常 09:30 - 20:30 (战役期/大促期间加班集中，平日周末保障双休)。",
        "salary_benefits": "通常 16 薪 (13薪基准+年终奖)，公积金 12% 顶格，提供免息置业贷款 (iHome)、入职周年专属福利、节日礼盒与关怀。",
        "interview_style": "通常 3~4 轮面试（技术架构、部门总监、HRG政委面）。尤其注重 Java 虚拟机底层原理、分布式中间件 (Dubbo/RocketMQ/Sentinel)、高可用微服务治理及业务场景设计。",
        "risk_tips": "HRG（政委体系）在招聘与绩效中有较大话语权，面试中注意文化契合度与心力、皮实度展现。",
        "highlights": "国内 Java 与电商高并发实战圣地，中间件生态完整，履历背书极佳。"
    },
    {
        "name": "美团 (Meituan)",
        "aliases": ["美团", "meituan", "美团点评", "到家", "到店", "美团优选", "美团外卖"],
        "industry": "本地生活 / 移动零售 / 即时配送 / 科技出行",
        "company_type": "知名上市公司 / 本地生活科技标杆",
        "headquarters": "北京 (朝阳望京恒基伟业 / 鼎成时代)",
        "scale": "90,000+ 人",
        "founded_year": 2010,
        "website": "https://about.meituan.com",
        "wlb_level": "务实拼搏 / 节奏充实",
        "wlb_badge": "yellow",
        "work_hours": "通常 10:00 - 20:30 (双休，崇尚苦练基本功，追求技术工程落地与 ROI 效益)。",
        "salary_benefits": "通常 15.5 薪 (年终奖通常 2-3.5 个月)，公积金 12%，定期体检、打车餐补、内部技术大学体系完整。",
        "interview_style": "通常 3 轮技术面 + 1 轮 HR 面。重在基础工程能力：MySQL 索引优化、锁机制、Redis 穿透雪崩治理、Java/C++ 内存管理，手撕算法重视边界清晰。",
        "risk_tips": "推崇务实与勤俭文化，部分事业群绩效考核严格，适合踏实打磨工程技能的同学。",
        "highlights": "在业界以技术博客与工程文化过硬著称，技术文档与新人培养沉淀深厚。"
    },
    {
        "name": "小红书 (Xiaohongshu)",
        "aliases": ["小红书", "red", "xiaohongshu", "行吟信息"],
        "industry": "生活方式社区 / 兴趣电商 / AI推荐",
        "company_type": "高成长高估值独角兽企业",
        "headquarters": "上海 (黄浦新天地 / 漕河泾)",
        "scale": "10,000+ 人",
        "founded_year": 2013,
        "website": "https://www.xiaohongshu.com",
        "wlb_level": "节奏紧凑 / 敏捷成长",
        "wlb_badge": "yellow",
        "work_hours": "通常 10:00 - 21:00 (双休，产品迭代敏捷，年轻人比例高，氛围活力开放)。",
        "salary_benefits": "薪资在上海互联网极具竞争力（通常 15-18 薪），提供丰厚房补、免费三餐及零食下午茶、年轻化团建与潮酷办公环境。",
        "interview_style": "通常 3 轮技术面试。重视推荐算法、大模型落地应用、多模态搜索、Go 开发与复杂数据流链路设计，面试氛围开放尊重候选人。",
        "risk_tips": "商业化与社区生态平衡处于快速演进期，需适应频繁的业务调整与跨部门协作节奏。",
        "highlights": "一线社区产品龙头，上海地区互联网就业优选，国际化与出海业务发展强劲。"
    },
    {
        "name": "米哈游 (miHoYo)",
        "aliases": ["米哈游", "mihoyo", "原神", "崩坏", "绝区零", "米家"],
        "industry": "二次元互动娱乐 / 游戏引擎研发 / 动漫文化",
        "company_type": "全球顶级游戏研运一体化企业",
        "headquarters": "上海 (徐汇漕河泾)",
        "scale": "6,000+ 人",
        "founded_year": 2011,
        "website": "https://www.mihoyo.com",
        "wlb_level": "相对良性 / 弹性双休",
        "wlb_badge": "green",
        "work_hours": "通常 10:00 - 19:30 (双休为主，版本封版期加班相对可控，杜绝无意义内耗形式主义)。",
        "salary_benefits": "行业顶格薪酬（年终奖通常 3-6 个月+，核心项目更高），公积金 12% 顶格，免费三餐食堂、年会阳光普照丰厚、年度体检与带薪年假充足。",
        "interview_style": "通常 2~3 轮专业面 + 1 轮 HR 面。看重候选人对 ACG 文化的热爱、扎实的图形学渲染 (Shader/OpenGL/Vulkan)、C++/C# 深度功底与游戏引擎底层架构理解。",
        "risk_tips": "门槛极高，非游戏研发序列（如运营、市场）竞争同样白热化；重作品集与真诚沟通。",
        "highlights": "“技术宅拯救世界”工程师文化，现金流极其充沛，二次元游戏工业化天花板。"
    },

    # ==================== 2. 通信 / 智能硬件 / 汽车与芯片 ====================
    {
        "name": "华为技术有限公司 (Huawei)",
        "aliases": ["华为", "huawei", "海思", "车BU", "终端", "云计算", "数通"],
        "industry": "ICT基础设施 / 智能终端 / 芯片半导体 / 智能汽车",
        "company_type": "全球通信与智能硬件科技巨头",
        "headquarters": "广东深圳 (龙岗坂田 / 东莞松山湖)",
        "scale": "200,000+ 人",
        "founded_year": 1987,
        "website": "https://www.huawei.com",
        "wlb_level": "奋斗拼搏 / 强度较高",
        "wlb_badge": "red",
        "work_hours": "通常 08:30 - 20:30+ (逢月末周六为全员加班日，依法支付双倍加班费；项目攻坚期强度较大，但加班费与分红真实兑现)。",
        "salary_benefits": "薪资+高额年终奖+TUP/内部虚拟受限股分红，长期收益行业天花板；提供高标准班车、优美欧式园区、完善的商业保险与家庭医疗保障。",
        "interview_style": "校招统考上机题（ACM/牛客模式，满分制通过率严格），专业 2 轮面试 + 1 轮高管业务终面。注重 C/C++、底层操作系统内核、计算机体系结构、数通网络协议与工程抗压能力。",
        "risk_tips": "末位淘汰考核机制较严，职级与绩效直接挂钩分红；适合渴望在核心硬核技术领域沉淀与追求高回报的求职者。",
        "highlights": "研发投入规模全国第一，全栈自研自主可控，全球化技术平台与履历含金量极高。"
    },
    {
        "name": "比亚迪股份有限公司 (BYD)",
        "aliases": ["比亚迪", "byd", "弗迪", "腾势", "仰望", "方程豹"],
        "industry": "新能源汽车 / 动力电池 / 轨道交通 / 半导体制造",
        "company_type": "全球新能源汽车与动力电池领航者",
        "headquarters": "广东深圳 (坪山区比亚迪路)",
        "scale": "700,000+ 人",
        "founded_year": 1995,
        "website": "https://www.bydglobal.com",
        "wlb_level": "工业制造标准 / 规整有序",
        "wlb_badge": "yellow",
        "work_hours": "通常 08:00 - 17:30 (研发部门根据交付节点有不同程度加班，工厂与制造体系倒班制)。",
        "salary_benefits": "根据毕业院校层次严格对应 F/E/D 职级定薪，提供极其实惠的内部员工宿舍、自选员工食堂、超低折扣内部购车补贴与利润分红。",
        "interview_style": "通常 1~2 轮综合技术面试。重点考察机械制造、汽车电子、嵌入式硬件开发、三电系统 (电池/电机/电控) 与车辆工程核心知识，面试效率高。",
        "risk_tips": "制造业庞大管理体系，流程制度严密，等级与工号制度分明；适合看好新能源汽车大趋势的技术同学。",
        "highlights": "垂直一体化自研全产业链，业务营收与全球交付量高速增长，对应届生接纳度极大。"
    },
    {
        "name": "大疆创新 (DJI)",
        "aliases": ["大疆", "dji", "大疆创新", "大疆无人机", "大疆车载"],
        "industry": "民用无人机 / 智能影像 / 激光雷达 / 智能车载",
        "company_type": "全球领先智能飞行器与机器人创新龙头",
        "headquarters": "广东深圳 (南山区天空之城)",
        "scale": "15,000+ 人",
        "founded_year": 2006,
        "website": "https://www.dji.com",
        "wlb_level": "极客高压 / 追求极致",
        "wlb_badge": "red",
        "work_hours": "通常 09:30 - 21:00 (双休，崇尚工程师极客文化，对产品工艺与算法精度要求苛刻)。",
        "salary_benefits": "软硬件研发待遇在硬件行业位列前茅（通常 15-18 薪），提供超豪华“天空之城”总部办公环境、年度体检、无人机员工专属折扣与租房补贴。",
        "interview_style": "通常 2 轮专业技术面 + 终面答辩。注重嵌入式 C/C++、电机控制算法、SLAM/视觉里程计、多传感器融合、RTOS 与硬件系统底层原理。",
        "risk_tips": "对产品完成度与代码质量容忍度低，评审较严格；适合喜欢硬核技术、动手能力超强的极客。",
        "highlights": "在消费级与行业级无人机领域占据全球 70%+ 市场份额，技术话语权极强。"
    },

    # ==================== 3. 医疗健康 / 生物医药 / 医疗器械 ====================
    {
        "name": "深圳迈瑞医疗 (Mindray)",
        "aliases": ["迈瑞", "mindray", "迈瑞医疗", "迈瑞生物"],
        "industry": "高级医疗器械 / 生命信息与支持 / 体外诊断 / 医学影像",
        "company_type": "中国医疗器械龙头 / 创业板标杆企业",
        "headquarters": "广东深圳 (南山高新技术产业园)",
        "scale": "18,000+ 人",
        "founded_year": 1991,
        "website": "https://www.mindray.com",
        "wlb_level": "良性规范 / 双休保障",
        "wlb_badge": "green",
        "work_hours": "通常 08:30 - 17:30 (标准双休，打卡规范，加班通常有调休或合规补助，相比互联网强度明显更为平稳健康)。",
        "salary_benefits": "行业顶尖竞争力（通常 15-17 薪），公积金 12% 顶格，提供专属免息购房无息安家借款、多线路免费通勤班车、企业年金与专项健康保障。",
        "interview_style": "通常 2~3 轮专业面（技术主管+预研部总监）+ HR 面。看重生物医学工程、嵌入式驱动开发、FPGA/DSP 信号处理、超声成像算法以及医疗器械注册合规 (GCP/CE/FDA) 知识。",
        "risk_tips": "研发周期严谨，文档规范性与代码可追溯性极高，研发交付流程比消费电子更严格。",
        "highlights": "全球医疗器械前 30 强，研发投入常年超 10%，业务抗周期性与稳定性极强。"
    },
    {
        "name": "江苏恒瑞医药 (Hengrui Medicine)",
        "aliases": ["恒瑞", "hengrui", "恒瑞医药", "恒瑞医药研发"],
        "industry": "抗肿瘤创新药 / 自身免疫 / 生物大分子 / 临床研究",
        "company_type": "国内创新药研发龙头 / 上市医药集团",
        "headquarters": "江苏连云港 / 上海张江研发中心",
        "scale": "25,000+ 人",
        "founded_year": 1970,
        "website": "https://www.hengrui.com",
        "wlb_level": "规范稳健 / 视部门而定",
        "wlb_badge": "yellow",
        "work_hours": "通常 08:30 - 17:30 (临床与学术推广线出差较多，实验室研发线双休稳定，节假日严格依照国家法定)。",
        "salary_benefits": "硕士/博士提供极具吸引力的科研启动金、安家补贴与地方人才引进补贴，项目达成奖、五险一金齐全、学术进修资助。",
        "interview_style": "通常 2 轮专业学术面 + 1 轮部门负责人。重点考察药物化学合成路径设计、临床试验方案设计 (ICH-GCP)、药理毒理评估与科研文献综述能力。",
        "risk_tips": "医药行业面临医保集采与新药审评审批周期波动，研发立项阶段考核细致。",
        "highlights": "国内创新药自研管线最多、对外授权许可 (License-out) 标杆企业，医药科研人才聚集地。"
    },
    {
        "name": "药明康德 (WuXi AppTec)",
        "aliases": ["药明康德", "wuxi", "药明", "合全药业", "药明生物"],
        "industry": "医药研发合同外包 (CRO/CDMO) / 赋能平台",
        "company_type": "全球领先医药一体化研发服务企业",
        "headquarters": "上海 (浦东新区外高桥 / 张江)",
        "scale": "40,000+ 人",
        "founded_year": 2000,
        "website": "https://www.wuxiapptec.com",
        "wlb_level": "高效交付 / 项目制",
        "wlb_badge": "yellow",
        "work_hours": "通常 09:00 - 18:00 (双休，客户订单交付节点前需配合实验进度，加班合规计算或调休)。",
        "salary_benefits": "绩效奖金、实验安全津贴、补充商业医疗保险、应届生落户专项协助、系统的 SOP 与实验实操大培训体系。",
        "interview_style": "通常 1~2 轮技术面试。考察有机合成机理、谱图解析 (NMR/MS/HPLC)、实验安全规程、英语沟通与实验记录严谨度。",
        "risk_tips": "实验室工作接触有机试剂需注重防护规范；全球化业务需关注地缘贸易政策合规动向。",
        "highlights": "医药研发“黄埔军校”，对实验技能与药物工业化流程的培养极其扎实标准化。"
    },

    {
        "name": "艾昆纬 (IQVIA)",
        "aliases": ["艾昆纬", "iqvia", "艾昆伟", "昆泰", "ims health", "quintiles", "艾昆纬中国"],
        "industry": "临床试验研发外包 (CRO) / 医疗大数据 / 医药商业咨询",
        "company_type": "全球第一大外资 CRO 龙头 / 医疗健康数据跨国巨头",
        "headquarters": "美国北卡罗来纳州达勒姆 / 中国总部: 上海静安",
        "scale": "全球 88,000+ 人 (大中华区 5,000+ 人)",
        "founded_year": 1982,
        "website": "https://www.iqvia.com",
        "wlb_level": "良性平衡 / 外企规范 / 双休弹性",
        "wlb_badge": "green",
        "work_hours": "通常 09:00 - 18:00 (标准双休，打卡人性化，弹性办公，支持部分天数 Work From Home 居家远程；极少形式主义加班；临床监查员 CRA 需按项目周期配合三甲医院临床中心出差)。",
        "salary_benefits": "外企标准规范薪酬（通常 13-15 薪），公积金 12% 顶格足额缴纳，全额五险一金 + 涵盖配偶及子女的商业补充高端医疗保险，带薪年假 15 天起、带薪病假、年度健康体检、通讯与差旅补贴丰厚。",
        "interview_style": "通常 2~3 轮面试（HR电话初步英文沟通 ➔ 业务主管专业面试 ➔ 业务总监终面）。高度考察 ICH-GCP 临床试验质量管理规范、医学或药学专业基础、跨部门/多中心医院临床沟通情商与抗压能力、英语听说读写能力（英文邮件及海外申办方沟通）。",
        "risk_tips": "跨国企业流程审批规范（SOP极其详尽严格）；CRA 岗位需适应全国三甲医院现场监查出差；医药外包业务受全球生物医药投融资周期与药企临床研发预算波动影响。",
        "highlights": "全球临床试验外包与医疗大数据无可争议的行业标杆，全球 TOP 20 跨国药企核心合作伙伴，对应届生临床试验规范与全球化视野培训极具权威背书。"
    },
    {
        "name": "泰格医药 (Tigermed)",
        "aliases": ["泰格", "tigermed", "泰格医药", "杭州泰格"],
        "industry": "临床试验全流程 CRO / 注册申报 / 数据管理与生物统计",
        "company_type": "中国本土临床 CRO 领军上市企业 / A+H 双重上市",
        "headquarters": "浙江杭州 (滨江区泰格大厦) / 上海张江",
        "scale": "10,000+ 人",
        "founded_year": 2004,
        "website": "https://www.tigermed.net",
        "wlb_level": "务实平衡 / 双休为主",
        "wlb_badge": "green",
        "work_hours": "通常 09:00 - 18:00 (双休，临床监查员 CRA 和协调员 CRC 视医院试验进度排班与出差，加班规范提供调休)。",
        "salary_benefits": "行业具竞争力薪资（通常 13-15 薪），五险一金规范，项目绩效奖金、出差津贴、完善的临床专业学院带教机制。",
        "interview_style": "通常 2 轮面试（专业面试+HR面）。重点考察 GCP 规范理解、临床试验方案把控、现场稽查与医院伦理审查沟通技巧。",
        "risk_tips": "临床现场沟通工作量大，需具备较好的协调与抗压心理素质。",
        "highlights": "中国临床试验 CRO 领域市占率领先企业，项目经验覆盖几乎所有治疗领域。"
    },
    {
        "name": "百济神州 (BeiGene)",
        "aliases": ["百济神州", "beigene", "百济", "百济神州生物"],
        "industry": "抗肿瘤新药自主研发 / 创新靶向药 / 免疫抗癌",
        "company_type": "全球知名创新药上市巨头 / 首家三地上市药企 (美股/港股/科创板)",
        "headquarters": "北京 (昌平生命科学园) / 上海张江",
        "scale": "11,000+ 人",
        "founded_year": 2010,
        "website": "https://www.beigene.com.cn",
        "wlb_level": "外企文化 / 尊重人才",
        "wlb_badge": "green",
        "work_hours": "通常 09:00 - 18:00 (双休，崇尚科学严谨与人文关怀，少形式主义加班)。",
        "salary_benefits": "行业顶尖薪资待遇（通常 15-18 薪），顶格五险一金、股票期权激励计划、高端补充医疗险、国际化研发团队交流支持。",
        "interview_style": "通常 3 轮面试（专业技术报告/文献汇报 ➔ 跨国团队英文交叉面试 ➔ HR面）。要求极高科研素养与独立思考能力。",
        "risk_tips": "全球原研创新药研发风险高，对学术水准与实验数据严谨度要求极高。",
        "highlights": "国内自主研发抗癌新药走向全球市场的先锋，技术含金量与国际声誉极高。"
    },
    {
        "name": "阿斯利康 (AstraZeneca)",
        "aliases": ["阿斯利康", "astrazeneca", "az", "阿斯利康中国"],
        "industry": "跨国制药巨头 / 肿瘤 / 心血管 / 肾脏及代谢 / 罕见病",
        "company_type": "全球前十大跨国生物制药巨头 / 英瑞合资知名外企",
        "headquarters": "英国剑桥 / 中国总部: 上海静安",
        "scale": "全球 83,000+ 人 (中国区 16,000+ 人)",
        "founded_year": 1999,
        "website": "https://www.astrazeneca.com.cn",
        "wlb_level": "外企标杆 / 优良关怀",
        "wlb_badge": "green",
        "work_hours": "通常 09:00 - 17:30 (标准双休，支持弹性与居家办公，带薪假期充足)。",
        "salary_benefits": "通常 14-16 薪，五险一金顶格缴纳，全家补充商业医疗保险、15-20天带薪年假、应届生专项轮岗培养计划。",
        "interview_style": "通常 2~3 轮面试（HR视频评估 ➔ 业务部门案例答辩 ➔ 交叉总监面）。重视英文表达、商业洞察力与专业医学知识。",
        "risk_tips": "医药合规监管极其严格，合规红线零容忍；业务线调整受集采影响较大。",
        "highlights": "在中国跨国药企中销售规模与创新中心投入均位列前列，管培生项目知名度极高。"
    },
    {
        "name": "宁德时代 (CATL)",
        "aliases": ["宁德时代", "catl", "宁德", "时代电服", "时代新能源"],
        "industry": "动力电池 / 储能电池系统 / 新能源硬科技",
        "company_type": "全球动力电池出货量第一 / 创业板市值龙头",
        "headquarters": "福建宁德 / 上海智能科技中心",
        "scale": "110,000+ 人",
        "founded_year": 2011,
        "website": "https://www.catl.com",
        "wlb_level": "奋斗狼性 / 节奏紧凑",
        "wlb_badge": "red",
        "work_hours": "通常 08:30 - 21:00 (战役期推行奋斗文化，项目攻坚期存在加班，周末视交付安排排班)。",
        "salary_benefits": "行业顶薪竞争力（通常 16-20 薪），博士提供丰厚科研经费与政府引才安家费，员工宿舍与优质福利食堂。",
        "interview_style": "通常 2 轮专业面试 + 1 轮 HR 面。重点考察电化学原理、材料学、仿真模拟、热管理、制造工艺与高强度抗压意愿。",
        "risk_tips": "工作强度较大，OKR 导向明确；技术保密体系极其严格。",
        "highlights": "全球动力电池行业无可匹敌的绝对霸主，技术底蕴与研发实力冠绝全球新能源赛道。"
    },
    {
        "name": "小米集团 (Xiaomi)",
        "aliases": ["小米", "xiaomi", "雷军", "小米汽车", "米家", "红米"],
        "industry": "智能手机 / 智能电动汽车 / AIoT 物联网 / 消费电子",
        "company_type": "全球最年轻世界500强 / 知名科技上市公司",
        "headquarters": "北京 (海淀区小米科技园) / 武汉光谷总部",
        "scale": "35,000+ 人",
        "founded_year": 2010,
        "website": "https://www.mi.com",
        "wlb_level": "快速敏捷 / 务实高效",
        "wlb_badge": "yellow",
        "work_hours": "通常 09:30 - 20:30 (双休，手机与汽车量产发布冲刺期节奏快，平日加班有打车餐补)。",
        "salary_benefits": "通常 14-16 薪，公积金 12%，定期发放小米生态链科技产品与新品福利、免息置业贷款。",
        "interview_style": "通常 3 轮技术面 + 1 轮 HR 面。注重底层系统 (Android Framework/Linux内核)、算法、嵌入式、车载电子及系统设计。",
        "risk_tips": "业务线扩张迅速，手机与汽车双轮驱动，对业务应变和抗压能力要求较高。",
        "highlights": "极具极客创新氛围与粉丝文化，小米科技园软硬件设施完善，年轻人话语权高。"
    },

    # ==================== 4. 央国企 / 军工科研院所 / 能源通信 ====================
    {
        "name": "国家电网有限公司 (State Grid)",
        "aliases": ["国家电网", "国网", "state grid", "国网电力", "南瑞", "国电南瑞"],
        "industry": "特高压电网建设 / 能源互联网 / 电力调度与自动化",
        "company_type": "特大型国有重点骨干央企 / 世界500强前三",
        "headquarters": "北京 (西城区西长安街)",
        "scale": "1,500,000+ 人",
        "founded_year": 2002,
        "website": "http://www.sgcc.com.cn",
        "wlb_level": "极佳平衡 / 严谨规范",
        "wlb_badge": "green",
        "work_hours": "机关与设计院通常 08:30 - 17:00 (双休，法定节假日绝不扣减，基层变电/调度班组需轮班值守)。",
        "salary_benefits": "八险二金 (包含企业年金与补充医疗保险)，公积金顶格缴纳，体制内福利健全、职工食堂丰盛健康、极高职业安全感与稳定性。",
        "interview_style": "全国统考笔试（综合知识+电工类/计算机类专业知识，统一机考）➔ 面试（半结构化+专业答辩）。重视政治素养、学历背景、专业契合度与抗压稳定意愿。",
        "risk_tips": "基层轮岗多在变电站或县域供电所，晋升与调动看资历与综合考评，重视组织规矩。",
        "highlights": "中国央企代表，职业稳定性天花板，特高压与智能电网世界第一。"
    },
    {
        "name": "中国移动通信集团 (China Mobile)",
        "aliases": ["中国移动", "移动", "china mobile", "中移杭研", "中移苏研", "咪咕", "中移信息"],
        "industry": "电信通信 / 5G网络 / 云计算 (移动云) / 大数据",
        "company_type": "中央直属特大型电信央企",
        "headquarters": "北京 (西城区金融大街)",
        "scale": "450,000+ 人",
        "founded_year": 2000,
        "website": "http://www.chinamobileltd.com",
        "wlb_level": "优良双休 / 稳中求进",
        "wlb_badge": "green",
        "work_hours": "通常 08:30 - 17:30 (研发类直属子公司如苏研/杭研加班中等，省市分公司严格遵循国企工作制，双休)。",
        "salary_benefits": "七险二金（含企业年金），公积金 12% 顶格，交通补贴、通讯话费报销、工会工间福利、带薪年休假完备。",
        "interview_style": "统一笔试（行测+通信计算机知识+英语）➔ 2 轮结构化或半结构化面试。重在踏实度、团队协作、技术基础理解与沟通表达。",
        "risk_tips": "省分与研发子公司薪资结构有差异；传统运营商体制色彩较浓，注意工作流程的合规留痕。",
        "highlights": "移动云近年来营收突飞猛进，国企属性叠加现代 IT 研发，抗下行风险极强。"
    },
    {
        "name": "中国电子科技集团 (CETC)",
        "aliases": ["中国电科", "cetc", "电科", "14所", "28所", "29所", "38所", "54所"],
        "industry": "国防军工电子 / 雷达探测 / 航天测控 / 芯片元器件",
        "company_type": "中央直接管理的军工科研央企",
        "headquarters": "北京 (海淀区万寿路)",
        "scale": "200,000+ 人",
        "founded_year": 2002,
        "website": "http://www.cetc.com.cn",
        "wlb_level": "军工科研节奏 / 关键节点紧凑",
        "wlb_badge": "yellow",
        "work_hours": "平日通常 08:30 - 17:30 (型号任务节点前加班强度大，涉密要求高，双休，有专属探亲假与保密津贴)。",
        "salary_benefits": "事业编制/企业编制双轨制，硕博专属安家费（南京/成都/石家庄所通常数十万），提供单身公寓、保密津贴、公积金顶格、职业荣誉感高。",
        "interview_style": "通常由各研究所独立组织面试。专业学术答辩（PPT汇报课题与项目经历）+ 专家技术深问 + 综合政审背调。重点看科研课题契合度与军工保密审查。",
        "risk_tips": "涉密等级严格，出国/出境旅游需审批；工作电脑物理内外网隔离，需适应涉密科研管理。",
        "highlights": "国家重器研发单位，在雷达、通信、微波光电技术处于国内垄断与领先地位。"
    },

    # ==================== 5. 金融 / 商业银行 / 证券券商 ====================
    {
        "name": "招商银行股份有限公司 (CMB)",
        "aliases": ["招商银行", "招行", "cmb", "招银网络科技", "招银科技"],
        "industry": "股份制商业银行 / 财富管理 / 金融科技",
        "company_type": "全国性股份制商业银行龙头 / 零售之王",
        "headquarters": "广东深圳 (福田深南大道)",
        "scale": "110,000+ 人",
        "founded_year": 1987,
        "website": "https://www.cmbchina.com",
        "wlb_level": "金融科技节奏 / 规范双休",
        "wlb_badge": "yellow",
        "work_hours": "科技子公司（招银网络科技）通常 08:30 - 18:30/20:00 (双休，投产上线日需值守调休，相比传统银行效率更高)。",
        "salary_benefits": "银行业第一梯队薪酬（通常 16-18 薪），公积金 12%，节日费、降温烤火费、过节礼金、行庆关怀、补充商业险完备。",
        "interview_style": "统考统一机考（行测+金融常识+编程思维）➔ 专业面试（Java高可用、分布式事务、微服务、SpringCloud、数据库性能调优）➔ HR 综合面。",
        "risk_tips": "总行管培生与科技子公司发展路径不同；金融系统安全性合规要求极高，注重故障零容忍。",
        "highlights": "“零售之王”金融科技公认标杆，技术投入大，离职率在银行业属于较低水平。"
    },
    {
        "name": "中金公司 (CICC)",
        "aliases": ["中金", "cicc", "中金公司", "中国国际金融"],
        "industry": "投资银行 / 证券研究 / 资产管理 / 财富管理",
        "company_type": "头部顶尖外资基因全牌照投资银行",
        "headquarters": "北京 (西城区金融大街 / 国贸)",
        "scale": "15,000+ 人",
        "founded_year": 1995,
        "website": "https://www.cicc.com",
        "wlb_level": "投行高压 / 专业驱动",
        "wlb_badge": "red",
        "work_hours": "投行部门 (IBD) 项目期出差与加班密集 (996 甚至全天候响应客户)；后台 IT 与风控相对规范。",
        "salary_benefits": "基本薪资高，项目分红与年终奖弹性空间大，全额五险一金、全球顶级差旅标准与高端商业医疗保障。",
        "interview_style": "通常 4~5 轮面试（英文简历首筛 ➔ 业务多轮单面 ➔ 案例建模分析 Case Study ➔ 高级合伙人 MD 面试）。极度看重专业履历、财务报表勾稽、估值建模、商务英语与形象表达。",
        "risk_tips": "资本市场行情波动对年终奖影响显著，近年薪酬趋于理性平衡；工作强度与抗压要求极高。",
        "highlights": "中国投行“天花板”，参与海内外巨型企业 IPO 与并购重组，名利场背书极强。"
    }
]

import re

class CompanyRegistryService:
    @classmethod
    def match_company(cls, c: Dict[str, Any], query: str) -> bool:
        """
        全向深度匹配企业名称、核心简称、别名及外文名
        支持用户输入完整工商注册名（如“腾讯科技有限公司”、“北京字节跳动科技有限公司”）精准命中
        """
        q = (query or "").strip().lower()
        if not q:
            return False
            
        c_name = c.get("name", "").lower()
        # 1. 直接全称/子串包含
        if q in c_name:
            return True
            
        # 2. 核心企业名称（去除中英文括号后）双向匹配
        c_core = re.sub(r"[\(（].*?[\)）]", "", c_name).strip()
        if c_core and (c_core in q or q in c_core):
            return True
            
        # 3. 别名与外文简称双向匹配
        for a in c.get("aliases", []):
            al = a.lower()
            if al == q:
                return True
            # 当别名长度>=2时，支持用户查询字符串包含该别名（如 "腾讯科技有限公司" 包含 "腾讯"）
            if len(al) >= 2 and al in q:
                return True
            # 当用户查询长度>=2时，支持别名包含用户查询（如 用户搜 "字节" 匹配别名 "字节跳动"）
            if len(q) >= 2 and q in al:
                return True
                
        return False

    @classmethod
    def search_companies(cls, query: str) -> List[Dict[str, Any]]:
        """模糊匹配或根据别名查询企业档案"""
        q = (query or "").strip().lower()
        if not q:
            # 默认返回各行业标杆推荐
            return COMPANY_PROFILES_KB[:8]

        results = []
        for c in COMPANY_PROFILES_KB:
            # 1. 深度企业核心名/别名精准匹配
            if cls.match_company(c, q):
                results.append(c)
                continue
            # 2. 行业或地点匹配
            if q in c.get("industry", "").lower() or q in c.get("headquarters", "").lower():
                results.append(c)

        if not results:
            # 自动生成启发式兜底档案（针对未预录入的中小微企业）
            results.append(cls.generate_heuristic_profile(query))

        return results

    @classmethod
    def get_company_profile(cls, name: str) -> Dict[str, Any]:
        """获取单个公司的完整画像档案"""
        clean_name = (name or "").strip()
        if not clean_name:
            return cls.generate_heuristic_profile("目标企业")
        matches = cls.search_companies(clean_name)
        if matches:
            return matches[0]
        return cls.generate_heuristic_profile(clean_name)

    @staticmethod
    def generate_heuristic_profile(name: str) -> Dict[str, Any]:
        """对于未入库企业，启发式智能推导企业性质、行业与全套背调跳转链接"""
        clean_name = (name or "").strip()
        
        # 智能推断企业性质
        if any(k in clean_name for k in ["局", "院", "所", "电网", "石油", "石化", "银行", "烟草", "铁", "电信", "移动", "联通", "有限责任公司"]):
            ctype = "国有企业 / 事业单位 / 央国企关联单位"
            wlb = "规范平稳 / 双休为主"
            badge = "green"
            hours = "通常 08:30 - 17:30 (法定节假日严格执行，打卡规范)"
        elif any(k in clean_name for k in ["网络", "互娱", "科技", "智能", "信息", "电商", "软件"]):
            ctype = "高新科技民营企业 / 互联网创新企业"
            wlb = "紧凑高效 / 弹性工作制"
            badge = "yellow"
            hours = "通常 09:30 - 19:30 (视业务冲刺情况弹性加班，周末原则双休)"
        elif any(k in clean_name for k in ["药", "医疗", "生物", "诊断", "健康"]):
            ctype = "生物医药 / 医疗健康专精企业"
            wlb = "良性稳健 / 标准工作制"
            badge = "green"
            hours = "通常 09:00 - 18:00 (双休，实验与合规流程严谨)"
        else:
            ctype = "行业民营实体 / 综合型成长企业"
            wlb = "行业常规 / 标准双休"
            badge = "yellow"
            hours = "通常 09:00 - 18:00 (国家法定节假日正常休假)"

        return {
            "name": clean_name or "目标企业",
            "aliases": [clean_name],
            "industry": "高新技术 / 综合商务服务",
            "company_type": ctype,
            "headquarters": "全国核心城市",
            "scale": "500 - 2,000 人 (预估)",
            "founded_year": 2018,
            "website": f"https://www.baidu.com/s?wd={clean_name}",
            "wlb_level": wlb,
            "wlb_badge": badge,
            "work_hours": hours,
            "salary_benefits": "依据企业定薪体系与行业水平；建议通过看准网或脉脉查证其年终奖兑现率与五险一金缴纳基数。",
            "interview_style": "通常 2~3 轮综合面试（专业初试 + 部门负责人复试 + HR薪酬面）。重点关注过往真实项目交付、落地解决问题能力与稳定性。",
            "risk_tips": "建议在接 Offer 前一键点击下方【天眼查】和【企查查】核验工商实缴资本、劳动争议裁判文书及经营异常记录，确保用人单位资质完备。",
            "highlights": "建议结合右侧一键直达外部背调工具箱，深度核验其实际口碑与员工评价。"
        }
