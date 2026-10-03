import sys
import os
import urllib.parse
from datetime import date, timedelta

os.environ["TESTING"] = "1"

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models import Offer, Job, Interview
from backend.services.offer_calculator import OfferCalculatorService
from backend.services.public_sector import PublicSectorService
from backend.services.campus_recruiter import CampusRecruiterService

def test_offer_calculator_null_safety():
    dummy_offer = Offer(
        id=999,
        title="异常值测试岗位",
        company="健壮性测试企业",
        base_salary_monthly=None,
        months_count=None,
        year_end_bonus=None,
        monthly_allowance=None,
        work_hours_per_day=None,
        work_days_per_week=None,
        annual_leave_days=None,
        commute_minutes_per_day=None,
        benefits_score=None,
        growth_score=None
    )
    metrics = OfferCalculatorService.calculate_offer_metrics(dummy_offer)
    assert metrics["id"] == 999
    assert metrics["total_gross_annual"] >= 0
    assert metrics["estimated_net_annual"] >= 0
    assert metrics["real_hourly_wage"] >= 0
    assert 0 <= metrics["overall_score"] <= 100
    assert "salary" in metrics["radar_scores"]
    print("✅ PASS: OfferCalculatorService 面对全 None 字段安全计算通过！")

def test_date_parsing_resilience():
    future_slash = (date.today() + timedelta(days=20)).strftime("%Y/%m/%d")
    future_dot = (date.today() + timedelta(days=20)).strftime("%Y.%m.%d")
    ending_soon = (date.today() + timedelta(days=2)).strftime("%Y/%m/%d")
    past_date = (date.today() - timedelta(days=5)).strftime("%Y.%m.%d")

    st1 = PublicSectorService.calculate_status(None, future_slash)
    assert st1 == "hot"
    st2 = PublicSectorService.calculate_status(None, ending_soon)
    assert st2 == "ending"
    st3 = PublicSectorService.calculate_status(None, past_date)
    assert st3 == "closed"

    c_st1 = CampusRecruiterService.calculate_status(future_dot)
    assert c_st1 == "hot"
    c_st2 = CampusRecruiterService.calculate_status(ending_soon)
    assert c_st2 == "ending"
    c_st3 = CampusRecruiterService.calculate_status(past_date)
    assert c_st3 == "closed"
    c_st4 = CampusRecruiterService.calculate_status("非法日期文本")
    assert c_st4 == "hot"

    print("✅ PASS: 日期多格式正则弹性解析通过！")

def test_job_cascade_interview_deletion():
    with TestClient(app) as client:
        j_resp = client.post("/api/jobs/", json={
            "title": "待删岗位",
            "company": "联级测试企业",
            "status": "wishlist"
        })
        assert j_resp.status_code == 200
        job_id = j_resp.json()["id"]

        iv1 = client.post("/api/interviews/", json={
            "job_id": job_id,
            "round_name": "一面",
            "interview_time": "2026-10-01 10:00"
        })
        assert iv1.status_code == 200
        iv1_id = iv1.json()["id"]

        iv2 = client.post("/api/interviews/", json={
            "job_id": job_id,
            "round_name": "二面",
            "interview_time": "2026-10-03 14:00"
        })
        assert iv2.status_code == 200
        iv2_id = iv2.json()["id"]

        ivs = client.get(f"/api/interviews/by-job/{job_id}").json()
        assert len(ivs) == 2

        del_resp = client.delete(f"/api/jobs/{job_id}")
        assert del_resp.status_code == 200

        all_ivs = client.get("/api/interviews/").json()
        assert not any(x["id"] in (iv1_id, iv2_id) for x in all_ivs)
        print("✅ PASS: 删除 Job 时从属面试日程 100% 连带清理通过！")

def test_company_intelligence_endpoint():
    with TestClient(app) as client:
        # 1. 精准匹配库内公司
        resp_tx = client.get("/api/company/profile?name=腾讯")
        assert resp_tx.status_code == 200
        data_tx = resp_tx.json()
        assert "腾讯" in data_tx["name"]
        assert "Tencent" in data_tx["name"] or "腾讯" in data_tx["aliases"]
        assert "南山" in data_tx["headquarters"]

        # 2. 未收录公司的自适应生成
        resp_unknown = client.get("/api/company/profile?name=未知初创科技")
        assert resp_unknown.status_code == 200
        data_unknown = resp_unknown.json()
        assert data_unknown["name"] == "未知初创科技"
        assert "科技" in data_unknown["company_type"]

        # 3. 空白字符串的边界防御（避免越界或误返回第一条）
        resp_empty = client.get("/api/company/profile?name=  ")
        assert resp_empty.status_code == 200
        data_empty = resp_empty.json()
        assert data_empty["name"] == "目标企业"

        # 4. AI 背调接口在无 Key 时优雅降级
        ai_resp = client.post("/api/company/ai-research", json={
            "company_name": "测试企业",
            "job_title": "研发工程师"
        })
        assert ai_resp.status_code == 200
        ai_data = ai_resp.json()
        assert ai_data["success"] is True
        assert len(ai_data["report"]) > 0
        print("✅ PASS: 企业全景背调接口与边界防御测试 100% 通过！")

def test_iqvia_search_and_intelligence():
    with TestClient(app) as client:
        # 1. 验证艾昆纬 (IQVIA) 知识库精准收录
        resp = client.get("/api/company/profile?name=艾昆纬")
        assert resp.status_code == 200
        data = resp.json()
        assert "艾昆纬" in data["name"]
        assert "IQVIA" in data["name"]
        assert data["wlb_badge"] == "green"
        assert "CRO" in data["industry"]

        # 2. 验证英文与别名命中
        resp_en = client.get("/api/company/profile?name=iqvia")
        assert resp_en.status_code == 200
        assert "艾昆纬" in resp_en.json()["name"]

        # 3. 验证秋招同步包含艾昆纬
        client.post("/api/campus/sync")
        c_resp = client.get("/api/campus/?keyword=艾昆纬")
        assert c_resp.status_code == 200
        c_items = c_resp.json()
        assert len(c_items) >= 1
        assert any("艾昆纬" in x["company_name"] for x in c_items)

        # 4. 验证不存在关键词返回 0 条而非崩溃
        miss_resp = client.get("/api/campus/?keyword=根本不存在的企业名称测试xyz999")
        assert miss_resp.status_code == 200
        assert len(miss_resp.json()) == 0

        print("✅ PASS: 艾昆纬 (IQVIA) 与关键词弹性搜索全链路测试通过！")

def test_company_bidirectional_matching():
    """验证工商全称、简称、外文名与特殊字符双向匹配鲁棒性"""
    from backend.services.company_registry import CompanyRegistryService, COMPANY_PROFILES_KB

    test_cases = [
        ("腾讯科技有限公司", "腾讯科技 (Tencent)"),
        ("北京字节跳动科技有限公司", "字节跳动 (ByteDance)"),
        ("华为技术有限公司", "华为技术有限公司 (Huawei)"),
        ("比亚迪股份有限公司", "比亚迪股份有限公司 (BYD)"),
        ("艾昆纬企业管理（上海）有限公司", "艾昆纬 (IQVIA)"),
        ("宁德时代新能源科技股份有限公司", "宁德时代 (CATL)"),
        ("AstraZeneca China", "阿斯利康 (AstraZeneca)"),
        ("McDonald's 餐饮管理", "目标企业"), # 未入库但单引号不报错
    ]

    for query, expected_target in test_cases:
        matched = [c for c in COMPANY_PROFILES_KB if CompanyRegistryService.match_company(c, query)]
        if expected_target != "目标企业":
            assert len(matched) >= 1, f"Query '{query}' failed to match KB"
            assert expected_target in matched[0]["name"]
        else:
            profile = CompanyRegistryService.get_company_profile(query)
            assert profile is not None
            assert profile["name"] == query

    # 验证特殊字符输入边界安全性
    with TestClient(app) as client:
        for spec_q in ["McDonald's", "L'Oreal", "AT&T", "<script>alert(1)</script>", "  "]:
            resp = client.get(f"/api/company/profile?name={urllib.parse.quote(spec_q)}")
            assert resp.status_code == 200
            assert "name" in resp.json()

    print("✅ PASS: 工商全称双向精准匹配与单引号特殊字符防御测试 100% 通过！")

def test_live_search_resilience_and_import():
    """验证全网动态检索超时自愈能力与校招一键导入完整闭环"""
    from unittest.mock import patch
    import httpx
    from backend.services.live_searcher import LiveSearchService

    with TestClient(app) as client:
        # 1. 模拟网络超时/受限场景下的优雅降级兜底
        with patch.object(httpx.AsyncClient, "get", side_effect=httpx.ConnectTimeout("Network unreachable")):
            res = client.get("/api/campus/live-search?keyword=创新药初创科技").json()
            assert res["total"] >= 1
            first_res = res["results"][0]
            assert "2026" in first_res["recruitment_type"]
            assert "创新药初创科技" in first_res["company_name"]
            assert first_res["is_live_result"] is True

        # 2. 测试一键将全网动态检索到的校招导入本地情报站
        imp_resp = client.post("/api/campus/import-live", json={
            "company_name": "创新药初创科技",
            "recruitment_type": "2026届校园招聘",
            "industry": "医疗健康/生物医药",
            "target_graduates": "2026/2027届",
            "roles_summary": "临床协调员 CRC, 临床监查员 CRA",
            "apply_url": "https://example.com/apply",
            "source": "全网实时动态检索测试"
        })
        assert imp_resp.status_code == 200
        imp_data = imp_resp.json()
        assert imp_data["success"] is True
        saved_id = imp_data["recruit"]["id"]

        # 3. 验证本地校招库中已存在该记录并可被搜索
        local_c = client.get("/api/campus/?keyword=创新药初创科技").json()
        assert len(local_c) >= 1
        assert local_c[0]["company_name"] == "创新药初创科技"

        # 4. 再次重复导入触发幂等更新
        imp_resp2 = client.post("/api/campus/import-live", json={
            "company_name": "创新药初创科技",
            "recruitment_type": "2026届校园招聘",
            "industry": "医疗健康/生物医药",
            "target_graduates": "2026/2027届",
            "roles_summary": "更新后的岗位描述: CRA管培生",
            "apply_url": "https://example.com/apply/v2"
        })
        assert imp_resp2.status_code == 200
        local_c2 = client.get("/api/campus/?keyword=创新药初创科技").json()
        assert local_c2[0]["roles_summary"] == "更新后的岗位描述: CRA管培生"
        assert local_c2[0]["apply_url"] == "https://example.com/apply/v2"

        # 5. 一键转入求职看板
        transfer_resp = client.post(f"/api/campus/import-to-job/{saved_id}")
        assert transfer_resp.status_code == 200
        assert "求职看板" in transfer_resp.json()["message"]

        # 验证看板中生成了该岗位
        jobs = client.get("/api/jobs/?keyword=创新药初创科技").json()
        assert len(jobs) >= 1
        assert jobs[0]["company"] == "创新药初创科技"

    print("✅ PASS: 全网动态检索自愈兜底、一键导入与看板流转全链路测试 100% 通过！")

def test_all_positions_matrix_and_role_import():
    """验证多方向细分专场、细分岗位提取、一键精准角色导入看板与6大直聘矩阵"""
    with TestClient(app) as client:
        # 1. 触发数据同步，确保最新全矩阵数据入库
        sync_res = client.post("/api/campus/sync")
        assert sync_res.status_code == 200

        # 2. 验证艾昆纬 (IQVIA) 全量岗位透视矩阵
        resp = client.get("/api/campus/company-all-positions?company_name=艾昆纬")
        assert resp.status_code == 200
        data = resp.json()
        assert data["matched_count"] >= 3, "IQVIA 应该包含临床、数据科学、咨询、数字化等多个细分专场"
        
        roles = [r["role_name"] for r in data["extracted_roles"]]
        assert any("CRA" in r or "临床" in r for r in roles)
        assert any("统计" in r or "数据" in r or "SAS" in r for r in roles)
        assert any("咨询" in r or "RWE" in r or "HEOR" in r for r in roles)

        # 验证 6 大官方与平台网申直通通道
        gateways = data["official_gateways"]
        assert len(gateways) == 6
        gw_names = [g["name"] for g in gateways]
        assert any("官方" in n for n in gw_names)
        assert any("丁香人才" in n for n in gw_names)
        assert any("实习僧" in n for n in gw_names)
        assert any("51Job" in n for n in gw_names)

        # 3. 验证具体细分岗位的精准导入
        first_role = data["extracted_roles"][0]
        rec_id = first_role["recruit_id"]
        role_name = first_role["role_name"]

        imp_role_resp = client.post(f"/api/campus/import-to-job/{rec_id}?role={urllib.parse.quote(role_name)}")
        assert imp_role_resp.status_code == 200
        imp_data = imp_role_resp.json()
        assert role_name in imp_data["message"]
        assert role_name in imp_data["job"]["title"]
        assert role_name in imp_data["job"]["tags"]

        # 4. 验证腾讯控股的多专场全景
        tx_resp = client.get("/api/campus/company-all-positions?company_name=腾讯")
        assert tx_resp.status_code == 200
        tx_data = tx_resp.json()
        assert tx_data["matched_count"] >= 2
        tx_roles = [r["role_name"] for r in tx_data["extracted_roles"]]
        assert any("大模型" in r or "算法" in r or "架构" in r for r in tx_roles)
        assert any("产品" in r or "运营" in r or "策划" in r for r in tx_roles)

        print("✅ PASS: 全岗位透视矩阵与具体岗位精准导入求职看板测试 100% 通过！")

def test_universal_arbitrary_companies_expansion():
    """
    验证【所有企业】通用全矩阵动态生成与全岗位透视能力（用户诉求：我不是说某一家企业，我是说所有企业）：
    无论搜索哪一家企业（医药罗氏/诺华、芯片地平线/北方华创、新能源极氪/小鹏、互联网美团/小米、央企电网、消费快消），
    系统均全面展开 4~5 个细分专场、提取 10+ 细分岗位，提供 6 大直聘通道，彻底杜绝单条卡片或信息不全。
    """
    with TestClient(app) as client:
        test_cases = [
            ("罗氏", "医疗健康/生物医药", ["临床", "统计", "咨询", "医学"]),
            ("地平线", "智能制造/汽车芯片", ["算法", "IC", "硬件", "仿真"]),
            ("极氪", "智能制造/汽车芯片", ["算法", "底盘", "硬件", "制造"]),
            ("美团", "互联网/IT", ["模型", "架构", "前端", "产品"]),
            ("中金公司", "金融科技/商业银行", ["金融", "投行", "量化", "财富"]),
            ("国家电网", "央国企/科研院所", ["研发", "网络", "工程", "管理"]),
            ("农夫山泉", "综合商贸/消费制造", ["营销", "智能", "采购", "管培"])
        ]
        
        for comp_name, expected_industry, expected_role_keywords in test_cases:
            # 1. 验证校招关键词搜索接口自动展开多赛道
            search_resp = client.get(f"/api/campus/?keyword={urllib.parse.quote(comp_name)}")
            assert search_resp.status_code == 200
            items = search_resp.json()
            assert len(items) >= 4, f"{comp_name} 必须自动展开至少4个细分赛道，实际得到 {len(items)}"
            assert any(expected_industry in it["industry"] for it in items), f"{comp_name} 应识别为 {expected_industry}"
            
            # 2. 验证全岗位透视矩阵接口
            all_resp = client.get(f"/api/campus/company-all-positions?company_name={urllib.parse.quote(comp_name)}")
            assert all_resp.status_code == 200
            all_data = all_resp.json()
            assert all_data["matched_count"] >= 4
            assert len(all_data["extracted_roles"]) >= 5
            assert len(all_data["official_gateways"]) == 6
            
            # 验证岗位关键词覆盖
            role_names = [r["role_name"] for r in all_data["extracted_roles"]]
            for kw in expected_role_keywords:
                assert any(kw in r for r in role_names), f"{comp_name} 提取的岗位列表中必须包含「{kw}」的岗位，实际为: {role_names}"
                
        print("✅ PASS: 全行业【所有企业】通用动态多赛道与全岗位透视矩阵验证 100% 通过！")

def test_export_jobs_csv_excel_compatibility():
    """验证求职台账 CSV 导出接口与 Windows Excel 零乱码标准 BOM 编码"""
    with TestClient(app) as client:
        # 1. 插入一个测试岗位
        create_resp = client.post("/api/jobs/", json={
            "title": "大模型算法专家 (校招)",
            "company": "测试科技集团",
            "location": "上海/北京",
            "salary": "35k-50k",
            "status": "applied",
            "source": "官网直投",
            "priority": 1,
            "tags": "AI,Python,大模型",
            "resume_version": "算法专项简历v2",
            "resume_key_points": "突显自研多模态预训练经历"
        })
        assert create_resp.status_code == 200
        job_id = create_resp.json()["id"]

        try:
            # 2. 调用导出接口
            export_resp = client.get("/api/jobs/export/csv")
            assert export_resp.status_code == 200
            assert "text/csv" in export_resp.headers["content-type"]
            assert "attachment" in export_resp.headers["content-disposition"]
            
            # 3. 验证标准 UTF-8 BOM 头部 (确保 Windows Excel 双击直接打开绝对不乱码)
            content_bytes = export_resp.content
            assert content_bytes.startswith(b'\xef\xbb\xbf'), "CSV 必须包含 UTF-8 BOM 头以防 Excel 打开乱码"

            # 4. 解析 CSV 内容并验证字段
            import csv
            import io
            text_content = content_bytes.decode("utf-8-sig")
            reader = csv.reader(io.StringIO(text_content))
            rows = list(reader)
            assert len(rows) >= 2, "导出的 CSV 至少应包含表头和一条记录"
            headers = rows[0]
            assert "岗位名称" in headers
            assert "企业名称" in headers
            assert "当前求职状态" in headers
            assert "所属赛道分组" in headers

            # 验证测试数据行
            found_test_job = False
            for r in rows[1:]:
                if "大模型算法专家" in r[0] and "测试科技集团" in r[1]:
                    found_test_job = True
                    assert r[2] == "已投递"  # 状态转中文
                    assert r[3] == "默认未分组"  # 分组
                    assert r[5] == "35k-50k"  # 薪资
                    assert "高优" in r[6]    # 优先级转中文
                    assert "算法专项简历v2" in r[12] # 简历版本
                    break
            assert found_test_job, "导出的 CSV 中未找到刚创建的测试岗位"
            print("✅ PASS: 求职台账 CSV 导出与 Excel UTF-8 BOM 兼容性测试 100% 通过！")
        finally:
            client.delete(f"/api/jobs/{job_id}")

def test_wishlist_grouping_and_batch_operations():
    """验证待投赛道分组、简历映射聚合、批量状态转移与批量调配接口"""
    with TestClient(app) as client:
        # 1. 创建属于不同赛道分组的测试岗位，绑定不同简历版本
        j1_resp = client.post("/api/jobs/", json={
            "title": "CV算法工程师",
            "company": "智算前沿科技",
            "status": "wishlist",
            "job_group": "算法与AI组",
            "resume_version": "算法大模型专用简历v3",
            "priority": 1
        })
        assert j1_resp.status_code == 200
        j1_id = j1_resp.json()["id"]

        j2_resp = client.post("/api/jobs/", json={
            "title": "NLP大模型研究员",
            "company": "生成式智能实验室",
            "status": "wishlist",
            "job_group": "算法与AI组",
            "resume_version": "算法大模型专用简历v3",
            "priority": 1
        })
        assert j2_resp.status_code == 200
        j2_id = j2_resp.json()["id"]

        j3_resp = client.post("/api/jobs/", json={
            "title": "临床监查员CRA",
            "company": "恒瑞创新医药",
            "status": "wishlist",
            "job_group": "临床医药组",
            "resume_version": "医药CRA专项简历v1",
            "priority": 2
        })
        assert j3_resp.status_code == 200
        j3_id = j3_resp.json()["id"]

        try:
            # 2. 验证分组聚合接口 GET /api/jobs/groups/summary
            summary_resp = client.get("/api/jobs/groups/summary")
            assert summary_resp.status_code == 200
            summary = summary_resp.json()
            groups = summary if isinstance(summary, list) else summary.get("groups", [])
            group_names = [g["group_name"] for g in groups]
            assert "算法与AI组" in group_names
            assert "临床医药组" in group_names

            ai_group = next(g for g in groups if g["group_name"] == "算法与AI组")
            assert ai_group["wishlist_count"] >= 2
            assert ai_group["primary_resume"] == "算法大模型专用简历v3"

            med_group = next(g for g in groups if g["group_name"] == "临床医药组")
            assert med_group["wishlist_count"] >= 1
            assert med_group["primary_resume"] == "医药CRA专项简历v1"

            # 3. 验证通过 group 参数筛选 GET /api/jobs/?group=算法与AI组
            filter_resp = client.get("/api/jobs/?group=算法与AI组")
            assert filter_resp.status_code == 200
            filtered_jobs = filter_resp.json()
            assert any(j["id"] == j1_id for j in filtered_jobs)
            assert any(j["id"] == j2_id for j in filtered_jobs)
            assert not any(j["id"] == j3_id for j in filtered_jobs)

            # 4. 验证批量状态流转 POST /api/jobs/groups/batch-status: 一键将「算法与AI组」从 wishlist 转入 applied
            batch_resp = client.post("/api/jobs/groups/batch-status", json={
                "group_name": "算法与AI组",
                "from_status": "wishlist",
                "to_status": "applied"
            })
            assert batch_resp.status_code == 200
            assert batch_resp.json()["updated_count"] >= 2

            # 检查 j1 和 j2 是否已成功推进到 applied，且记录了投递时间
            j1_check = client.get(f"/api/jobs/{j1_id}").json()
            j2_check = client.get(f"/api/jobs/{j2_id}").json()
            assert j1_check["status"] == "applied"
            assert j1_check["applied_at"] is not None
            assert j2_check["status"] == "applied"
            assert j2_check["applied_at"] is not None

            # 检查 j3 临床医药组不受影响，仍然在 wishlist
            j3_check = client.get(f"/api/jobs/{j3_id}").json()
            assert j3_check["status"] == "wishlist"

            # 5. 验证批量调配企业与简历绑定 POST /api/jobs/groups/batch-assign
            reassign_resp = client.post("/api/jobs/groups/batch-assign", json={
                "job_ids": [j3_id],
                "target_group": "大健康研发与外企组",
                "target_resume_version": "外企医疗英语版简历v2"
            })
            assert reassign_resp.status_code == 200
            assert reassign_resp.json()["updated_count"] == 1

            j3_updated = client.get(f"/api/jobs/{j3_id}").json()
            assert j3_updated["job_group"] == "大健康研发与外企组"
            assert j3_updated["resume_version"] == "外企医疗英语版简历v2"

            print("✅ PASS: 待投分组聚合、同一简历绑定、一键批量投递与赛道调配 100% 通过！")
        finally:
            # 清理测试数据
            client.delete(f"/api/jobs/{j1_id}")
            client.delete(f"/api/jobs/{j2_id}")
            client.delete(f"/api/jobs/{j3_id}")

def test_campus_stats_and_sync_time():
    """验证校招大盘统计与自动同步状态时间戳"""
    with TestClient(app) as client:
        stats_resp = client.get("/api/campus/stats")
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert "last_sync_time" in stats
        assert stats["sync_status"] == "active"
        assert len(stats["last_sync_time"]) >= 10
        print(f"✅ PASS: 校招大盘实时同步时间戳验证通过: {stats['last_sync_time']}")

if __name__ == "__main__":
    test_offer_calculator_null_safety()
    test_date_parsing_resilience()
    test_job_cascade_interview_deletion()
    test_company_intelligence_endpoint()
    test_iqvia_search_and_intelligence()
    test_company_bidirectional_matching()
    test_live_search_resilience_and_import()
    test_all_positions_matrix_and_role_import()
    test_universal_arbitrary_companies_expansion()
    test_export_jobs_csv_excel_compatibility()
    test_wishlist_grouping_and_batch_operations()
    test_campus_stats_and_sync_time()
    print("🏆 全部审计加固测试 100% 通过！")




