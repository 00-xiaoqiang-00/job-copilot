import httpx
import json
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from backend.database import engine
from backend.models import SystemSetting

DEFAULT_CONFIG = {
    "provider": "custom",
    "base_url": "https://api.openai.com/v1",
    "api_key": "",
    "model_name": "gpt-4o-mini"
}

class LLMClientService:
    @staticmethod
    def get_saved_config() -> Dict[str, Any]:
        """从本地数据库获取已保存的 AI 模型配置"""
        with Session(engine) as session:
            setting = session.get(SystemSetting, "llm_config")
            if setting and setting.value:
                try:
                    return json.loads(setting.value)
                except Exception:
                    pass
        return DEFAULT_CONFIG.copy()

    @staticmethod
    def save_config(config: Dict[str, Any]):
        """保存 AI 模型配置到本地数据库"""
        with Session(engine) as session:
            setting = session.get(SystemSetting, "llm_config")
            if not setting:
                setting = SystemSetting(key="llm_config", value=json.dumps(config, ensure_ascii=False))
            else:
                setting.value = json.dumps(config, ensure_ascii=False)
            session.add(setting)
            session.commit()

    @classmethod
    def _normalize_chat_url(cls, base_url: str) -> str:
        """智能规整各种格式的 Base URL 为标准的 /chat/completions 请求地址"""
        clean_url = (base_url or "").strip().rstrip("/")
        if not clean_url:
            return "https://api.openai.com/v1/chat/completions"
        if clean_url.endswith("/chat/completions"):
            return clean_url
        return f"{clean_url}/chat/completions"

    @classmethod
    async def chat_completion(cls, messages: List[Dict[str, str]], config: Optional[Dict[str, Any]] = None) -> str:
        """调用任意符合通用 OpenAI 兼容协议的大模型 API (OpenAI / Claude中转 / DeepSeek / 硅基流动 / Kimi / 智谱 / 通义 / Ollama / OneAPI 等)"""
        cfg = config or cls.get_saved_config()
        api_key = cfg.get("api_key", "").strip()
        base_url = cfg.get("base_url", "").strip()
        model_name = (cfg.get("model_name") or "gpt-4o-mini").strip()

        # 如果没有配置 API Key 且不是本地 Ollama / LM Studio 等本地服务，则返回空
        is_local = any(h in base_url for h in ["localhost", "127.0.0.1", "0.0.0.0"])
        if not api_key and not is_local:
            return ""

        url = cls._normalize_chat_url(base_url)
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}" if api_key else "Bearer local"
        }
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                if "choices" in data and len(data["choices"]) > 0:
                    msg = data["choices"][0].get("message", {})
                    return msg.get("content", "").strip()
                raise Exception("返回数据格式不符合 OpenAI choices 规范: " + str(data))
            else:
                raise Exception(f"大模型接口请求返回 HTTP {resp.status_code}: {resp.text}")

    @classmethod
    async def test_connection(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        """测试用户配置的通用 API 连通性"""
        try:
            test_messages = [{"role": "user", "content": "Hello! Please reply with 'API Connected Successfully'."}]
            reply = await cls.chat_completion(test_messages, config)
            if reply:
                return {"success": True, "reply": reply.strip()}
            return {"success": False, "error": "模型未返回有效内容，请检查 API Key 与模型名称是否正确。"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    async def tailor_resume(cls, resume_text: str, jd_text: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """AI 针对性简历改写与优化建议"""
        cfg = config or cls.get_saved_config()
        is_local = any(h in cfg.get("base_url", "") for h in ["localhost", "127.0.0.1"])
        if cfg.get("api_key") or is_local:
            prompt = f"""你是一名资深技术猎头与大厂招聘专家。请对比候选人的【个人简历】与目标【岗位职责要求(JD)】，为候选人提供 3~5 条高价值、极具针对性的简历润色与改写建议。

【目标岗位 JD】:
{jd_text}

【候选人当前简历】:
{resume_text}

请按照以下结构输出清晰有力的 Markdown 格式建议：
1. 💡 **核心经历针对性改写**：选取简历中可强化的 2-3 个项目经历，用 STAR 原则给出修改前后的具体文案对照。
2. 🎯 **技术关键词补充建议**：JD 中强调但简历未充分展现的核心技术词汇。
3. 🚀 **面试破冰自我推介要点**：针对该岗位的 1 分钟量化自我介绍提纲。"""
            
            messages = [
                {"role": "system", "content": "你是一名精准、专业的简历优化与职业发展教练。"},
                {"role": "user", "content": prompt}
            ]
            try:
                content = await cls.chat_completion(messages, cfg)
                if content:
                    return {"success": True, "mode": "llm", "advice": content}
            except Exception as e:
                print(f"LLM Resume Tailor error: {e}")

        # 本地离线规则降级方案 (确保零配置时也能正常展示)
        return {
            "success": True,
            "mode": "offline",
            "advice": f"### 💡 针对性简历优化建议 (本地规则模式)\n\n"
                      f"1. **强化与 JD 核心技术的绑定**：在项目经验首句增加对岗位所需关键技能的应用与解决实际问题的量化描述。\n"
                      f"2. **采用 STAR 原则突出指标**：将普通描述（如“负责接口开发”）重构为包含业务收益的表达（如“主导异步订单接口重构，QPS 提升 40%，平均响应延迟降低至 50ms”）。\n"
                      f"3. **量化项目难点与架构选型**：在简历末尾增加高并发/高可用场景的踩坑与应对策略，便于引导面试官提问。\n\n"
                      f"> 💡 *提示：点击右上角「AI设置」，填入任意支持通用 OpenAI 兼容协议的 API Key 与 Base URL（如 OpenAI, 硅基流动, Kimi, 智谱, DeepSeek, 本地Ollama等），即可获得由大模型针对当前 JD 逐字生成的深度润色文案！*"
        }

    @classmethod
    async def mock_interview_turn(cls, history: List[Dict[str, str]], jd_text: str, candidate_answer: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """AI 模拟面试官对话轮次"""
        cfg = config or cls.get_saved_config()
        is_local = any(h in cfg.get("base_url", "") for h in ["localhost", "127.0.0.1"])
        if cfg.get("api_key") or is_local:
            system_prompt = f"""你是一名严格但善于启发的大厂资深技术面试官。你正在对候选人进行针对以下岗位的模拟技术面试。

【目标岗位 JD】:
{jd_text}

你的职责：
1. 针对候选人的回答给出精准、客观的点评（指出回答中的亮点、遗漏点或概念瑕疵，并给出 1-10 分的打分）。
2. 根据岗位 JD 和当前面试节奏，提出下一道循序渐进的技术或项目实战提问。
请保持专业、严肃、紧凑的面试官口吻。"""

            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(history)
            if candidate_answer:
                messages.append({"role": "user", "content": candidate_answer})
            else:
                messages.append({"role": "user", "content": "你好面试官，我已准备好，请开始第一道技术提问。"})

            try:
                reply = await cls.chat_completion(messages, cfg)
                if reply:
                    return {"success": True, "reply": reply}
            except Exception as e:
                print(f"Mock Interview error: {e}")

        # 本地离线规则模拟面试问答
        sample_questions = [
            "【面试官提问 1】请简述你在过去项目中使用 Python/FastAPI 处理高并发请求时，是如何设计异步架构与数据库连接池的？",
            "【面试官提问 2】如果线上服务突然出现 Redis 缓存穿透与接口响应超时报警，你的标准排查链路和解决方案是什么？",
            "【面试官提问 3】请谈谈你在微服务或模块化设计中，如何保证分布式数据的一致性与接口幂等性？"
        ]
        current_turn = len(history) // 2
        q = sample_questions[current_turn % len(sample_questions)]
        feedback = "（已收到你的回答。逻辑较为清晰，若能结合生产环境的具体监控指标和量化收益展开，回答会更具说服力！）\n\n" if candidate_answer else ""

        return {
            "success": True,
            "reply": f"{feedback}{q}\n\n*(当前处于离线题库模式。在「AI设置」中填入任意通用大模型 API Key 即可体验多轮深度追问与智能打分)*"
        }

    @classmethod
    async def company_research(cls, company_name: str, job_title: str = "", config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """AI 深度企业全景背调与求职剖析报告生成"""
        cfg = config or cls.get_saved_config()
        is_local = any(h in cfg.get("base_url", "") for h in ["localhost", "127.0.0.1"])
        if cfg.get("api_key") or is_local:
            role_hint = f"该候选人正在准备应聘该企业的【{job_title}】岗位。" if job_title else "该候选人正在考察该企业的整体求职价值与环境。"
            prompt = f"""你是一名拥有 15 年经验的资深商业情报顾问与大厂技术猎头。请对企业【{company_name}】进行客观、中立、深度的求职背景调查与全景剖析。
{role_hint}

请严格按以下清晰的 Markdown 结构输出全景背调报告（语气专业、务实、直击痛点，不讲套话空话）：

### 🏢 1. 企业战略护城河与业务生态
- 分析该公司的核心主营业务、赚钱商业模式、行业市场地位（头部大厂/细分赛道冠军/成长型企业）及主要竞争对手。
- 若有针对【{job_title or '目标岗位'}】，分析该岗位所在研发/业务团队在公司内部是处于核心赢利线、战略孵化线还是支持保障部门。

### ⚖️ 2. 真实职场口碑与加班强度 (WLB)
- 客观剖析该企业的加班节奏（是否存在 996、大小周、隐形加班或形式主义打卡）。
- 团队管理风格（是扁平极客、务实狼性、流程驱动还是体制内国企文化）。

### 💰 3. 薪酬结构、福利体系与隐形机制
- 分析该企业的行业薪资竞争力、年终奖兑现通常月数、公积金缴纳标准（是否顶格12%）。
- 调薪晋升考核机制与是否存在试用期打折/卡转正等潜规则。

### 🎯 4. 面试考察偏好与通关技巧
- 面试常见轮次与考核风格（侧重底层基础、算法原题、系统设计、还是项目经验与业务理解）。
- 针对该企业文化的破冰与作答建议。

### ⚠️ 5. 风险预警与求职避坑提示
- 近期行业变动、业务缩招或裁员风向提示。
- 候选人在接 Offer 前务必注意的关键防坑要点。"""

            messages = [
                {"role": "system", "content": "你是一名精通各大行业企业真实生态、招聘机制与劳资关系的资深商业情报与求职背调专家。"},
                {"role": "user", "content": prompt}
            ]
            try:
                content = await cls.chat_completion(messages, cfg)
                if content:
                    return {"success": True, "mode": "llm", "report": content}
            except Exception as e:
                print(f"LLM Company Research error: {e}")

        # 本地离线规则生成结构化高质量背调
        from backend.services.company_registry import CompanyRegistryService
        p = CompanyRegistryService.get_company_profile(company_name)
        offline_report = f"""### 🏢 1. 企业战略定位与业务生态 (本地知识库模式)
- **企业性质与行业**：{p.get('company_type', '综合型优质企业')} · {p.get('industry', '高新技术领域')}
- **规模与总部**：{p.get('scale', '千人以上规模')} | 总部位于 {p.get('headquarters', '全国核心枢纽城市')}
- **核心定位**：{p.get('highlights', '业内具备良好口碑与技术积累的优质雇主。')}

### ⚖️ 2. 真实职场口碑与工作强度 (WLB)
- **加班节奏评定**：**{p.get('wlb_level', '常规标准工时')}**
- **工时规范**：{p.get('work_hours', '双休为主，按国家法定节假日排休')}

### 💰 3. 薪资待遇与福利机制
- **薪酬与激励**：{p.get('salary_benefits', '薪酬待遇与行业标准看齐，五险一金规范。')}

### 🎯 4. 面试流程风格与考察重点
- **考核路径**：{p.get('interview_style', '通常 2~3 轮专业面试，重在基础扎实与实战交付。')}

### ⚠️ 5. 避坑提示与风控建议
- **关键提醒**：{p.get('risk_tips', '建议面试时主动了解部门业务线发展阶段，并在接 Offer 前查阅劳动合同细则。')}

> 💡 *提示：您可以在右上角「设置」中填入任意大模型 API Key（DeepSeek、Kimi、OpenAI 等），即可随时一键调用 AI 针对【{company_name}】的特定业务线进行定制化的全网深度商业背调与面试预测！*"""

        return {
            "success": True,
            "mode": "offline",
            "report": offline_report
        }

