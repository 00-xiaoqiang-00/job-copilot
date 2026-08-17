import re
from typing import Dict, Any, List, Optional

# 常见核心技能与技术栈知识图谱库
TECH_SKILLS_KB = [
    # 语言
    "Python", "JavaScript", "TypeScript", "Go", "Golang", "Java", "C++", "Rust", "PHP", "SQL", "HTML", "CSS",
    # Python 生态
    "FastAPI", "Django", "Flask", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scrapy", "SQLAlchemy", "SQLModel", "Celery",
    # 前端生态
    "React", "Vue", "Vue3", "Next.js", "Nuxt", "Node.js", "Express", "Tailwind", "Vite", "Webpack", "Redux", "Pinia",
    # 数据库与中间件
    "MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "Elasticsearch", "Kafka", "RabbitMQ", "ClickHouse",
    # 云原生与 DevOps
    "Docker", "Kubernetes", "K8s", "Linux", "Git", "Nginx", "CI/CD", "GitHub Actions", "AWS", "阿里云", "腾讯云",
    # 架构与软技能
    "微服务", "RESTful API", "GraphQL", "分布式", "高并发", "缓存", "性能优化", "消息队列", "单元测试", "系统设计"
]

class AIAssistantService:
    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """从任意文本中提取技术栈与核心技能"""
        if not text:
            return []
        found = []
        text_lower = text.lower()
        for skill in TECH_SKILLS_KB:
            # 单词边界或包含匹配
            pattern = rf"(?i)\b{re.escape(skill)}\b"
            if re.search(pattern, text) or skill.lower() in text_lower:
                if skill not in found:
                    found.append(skill)
        return found

    @classmethod
    def analyze_jd_match(cls, jd_text: str, resume_text: str) -> Dict[str, Any]:
        """分析简历与岗位 JD 的匹配度与 Gap"""
        jd_skills = cls.extract_skills(jd_text)
        resume_skills = cls.extract_skills(resume_text)

        if not jd_skills:
            # 如果从 JD 没匹配到标准词，提取一些通用要求
            jd_skills = ["Python", "FastAPI", "SQL", "Git", "RESTful API"]

        matched = [s for s in jd_skills if s in resume_skills or any(s.lower() == r.lower() for r in resume_skills)]
        missing = [s for s in jd_skills if s not in matched]

        total_jd = len(jd_skills)
        match_score = int((len(matched) / total_jd) * 100) if total_jd > 0 else 70
        # 兜底分数平滑
        match_score = max(min(match_score, 100), 20)

        # 智能建议生成
        suggestions = []
        if missing:
            suggestions.append(f"建议在简历中补充或复习以下关键技术栈：{', '.join(missing[:4])}。")
        if match_score >= 80:
            suggestions.append("🎉 你的技能栈与该岗位高度契合，可作为优先主攻目标！")
        elif match_score >= 50:
            suggestions.append("⚠️ 整体契合度良好，建议在投递时重点定制项目经历中的相关关键词。")
        else:
            suggestions.append("💡 该岗位对部分技能有明确要求，建议投递前突击准备相关面试八股与实战方案。")

        return {
            "match_score": match_score,
            "jd_skills": jd_skills,
            "matched_skills": matched,
            "missing_skills": missing,
            "suggestions": suggestions
        }

    @classmethod
    def predict_interview_questions(cls, jd_text: str, title: str) -> List[Dict[str, str]]:
        """根据岗位 JD 和标题智能预测可能被问到的面试题"""
        skills = cls.extract_skills(jd_text)
        questions = []

        # 针对具体技能生成针对性经典考题
        skill_question_map = {
            "Python": "请谈谈 Python 的 GIL（全局解释器锁）机制及其对多线程并发的影响与解决方案？",
            "FastAPI": "FastAPI 的异步 (async/await) 底层原理是什么？它与 Flask/Django 在性能和架构上有何区别？",
            "Redis": "Redis 常见的数据结构有哪些？在实际项目中你是如何解决缓存穿透、击穿与雪崩的？",
            "MySQL": "请解释 MySQL InnoDB 的聚簇索引与非聚簇索引，以及如何优化一条慢查询 SQL？",
            "PostgreSQL": "PostgreSQL 在 JSONB 查询与高并发写入方面相比 MySQL 有哪些优势？",
            "Docker": "请简述 Docker 镜像的分层构建机制，以及你是如何减少 Docker 镜像体积的？",
            "RESTful API": "设计一套优雅且安全的 RESTful API 需要遵循哪些规范？如何做接口鉴权与限流？",
            "微服务": "微服务架构下，服务之间的通信协议（gRPC vs HTTP）如何选型？如何做分布式事务一致性？",
            "高并发": "如果系统瞬间涌入 10 万 QPS 请求，你通常会从哪几个层级（网关/服务/缓存/DB）设计削峰架构？"
        }

        # 优先匹配 JD 里的核心技能
        for skill in skills:
            if skill in skill_question_map:
                questions.append({
                    "category": f"{skill} 核心技术",
                    "question": skill_question_map[skill],
                    "tip": f"JD 明确要求具备 {skill} 实战经验，面试大概率会深挖底层原理与实际踩坑案例。"
                })

        # 通用架构与业务考题
        questions.append({
            "category": "项目深挖与软实力",
            "question": f"请详细介绍你过去做过的最有挑战性的项目，你在其中承担的角色以及遇到了什么技术难点？",
            "tip": "采用 STAR 法则（情境-任务-行动-结果）回答，重点突出个人贡献与量化收益。"
        })

        if len(questions) < 4:
            questions.append({
                "category": "系统设计与场景",
                "question": "如果让你从零设计一个支持高并发和数据持久化的任务队列系统，你会怎么做？",
                "tip": "考察系统架构思维、容灾设计与边界情况处理能力。"
            })

        return questions
