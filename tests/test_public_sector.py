import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from backend.main import app
from backend.database import engine
from backend.models import PublicRecruit, Job, Interview

client = TestClient(app)

def test_public_sector_clean_state_and_lifecycle():
    # 确保测试前数据库处于纯净状态
    client.delete("/api/public-sector/purge/all")

    print("\n--- 1. 验证考公考编初始绝对纯净状态 (0示例数据) ---")
    resp = client.get("/api/public-sector/")
    assert resp.status_code == 200
    initial_items = resp.json()
    print(f"初始招考记录数: {len(initial_items)} (应为 0)")
    assert len(initial_items) == 0

    stats_resp = client.get("/api/public-sector/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_recruits"] == 0

    print("\n--- 2. 验证真实推文/公告 AI 智能提取入库 ---")
    sample_article = """
中共广东省委组织部 广东省人力资源和社会保障厅
广东省2026年度选调优秀大学毕业生公告

为加强高素质专业化干部队伍源头建设，大力发现储备年轻干部，根据公务员法等有关法律法规，决定面向全国部分高校选调优秀大学毕业生到广东省各级机关工作。
一、选调对象与人数
面向全国部分高校2026届全日制应届大学毕业生，共计划选调 1,500 人。
二、招录专业方向
涵盖法学、计算机科学与技术、电气工程、电子信息、临床医学、公共卫生、城乡规划与综合管理等大类。
三、报名与考试安排
报名时间：2026年10月15日09:00至2026年10月25日18:00。
统一笔试时间：2026年11月18日。
官方报名网站：https://ggfw.hrss.gd.gov.cn/gwyks/
    """
    parse_resp = client.post("/api/public-sector/parse-article", json={
        "article_text": sample_article,
        "source_url": "https://mp.weixin.qq.com/s/sample_gd_xds"
    })
    assert parse_resp.status_code == 200
    data = parse_resp.json()
    assert "选调" in data["recruit"]["title"] or "广东" in data["recruit"]["title"]
    assert "广东省" in data["recruit"]["organization"] or "组织部" in data["recruit"]["organization"]
    recruit_id = data["recruit"]["id"]
    print(f"成功提取并入库招考: ID={recruit_id}, 标题={data['recruit']['title']}, 编制={data['recruit']['category']}, 地区={data['recruit']['region']}")

    print("\n--- 3. 验证多维度组合筛选 ---")
    # 按分类筛选
    filtered = client.get("/api/public-sector/?category=选调生").json()
    assert len(filtered) >= 1
    # 按地区筛选
    filtered_reg = client.get("/api/public-sector/?region=广东").json()
    assert len(filtered_reg) >= 1
    # 统计更新
    new_stats = client.get("/api/public-sector/stats").json()
    assert new_stats["total_recruits"] >= 1
    assert new_stats["talent_scout_count"] >= 1

    print("\n--- 4. 验证一键转入【备考看板】与建立【报名+笔试】日历提醒 ---")
    imp_resp = client.post(f"/api/public-sector/import-to-job/{recruit_id}")
    assert imp_resp.status_code == 200
    imp_data = imp_resp.json()
    print("导入反馈:", imp_data["message"])
    assert imp_data["events_count"] >= 1
    job_id = imp_data["job"]["id"]

    # 验证数据库中的 Job 和 Interview 事件
    with Session(engine) as s:
        job = s.get(Job, job_id)
        assert job is not None
        assert "体制内" in job.tags
        interviews = s.exec(select(Interview).where(Interview.job_id == job_id)).all()
        print(f"自动生成的备考日历事件数: {len(interviews)}")
        for it in interviews:
            print(f"  • {it.round_name} | 时间: {it.interview_time}")
        assert len(interviews) >= 1

    print("\n--- 5. 验证主动从公开开源渠道同步【全网全品类招考日程】 ---")
    sync_resp = client.post("/api/public-sector/sync")
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    print("同步反馈:", sync_data["message"])
    assert sync_data["total_active"] >= 40

    # 验证四大类目均有真实日程
    civil_list = client.get("/api/public-sector/?category=公务员").json()
    assert len(civil_list) >= 8
    scout_list = client.get("/api/public-sector/?category=选调生").json()
    assert len(scout_list) >= 5
    inst_list = client.get("/api/public-sector/?category=事业").json()
    assert len(inst_list) >= 5
    soe_list = client.get("/api/public-sector/?category=国企").json()
    assert len(soe_list) >= 15

    # 验证各省份覆盖
    for prov in ["广东", "北京", "上海", "江苏", "浙江", "山东", "四川"]:
        prov_list = client.get(f"/api/public-sector/?region={prov}").json()
        assert len(prov_list) >= 1, f"省份 {prov} 应有招考日程"

    # 验证统计概览
    synced_stats = client.get("/api/public-sector/stats").json()
    assert synced_stats["total_recruits"] >= 40
    assert synced_stats["civil_servant_count"] >= 8
    assert synced_stats["talent_scout_count"] >= 5
    assert synced_stats["institution_count"] >= 5
    assert synced_stats["soe_count"] >= 15
    print(f"全网同步统计大盘验证成功: 总计={synced_stats['total_recruits']}, 公务员={synced_stats['civil_servant_count']}, 选调={synced_stats['talent_scout_count']}, 事业编={synced_stats['institution_count']}, 央国企={synced_stats['soe_count']}")

    print("\n--- 6. 验证清理与恢复 100% 绝对纯净状态 ---")
    # 删除临时生成的 Job 与 Interview
    client.delete(f"/api/jobs/{job_id}")
    # 清空所有 public-recruits
    purge_resp = client.delete("/api/public-sector/purge/all")
    assert purge_resp.status_code == 200
    
    # 确认全库归零
    final_items = client.get("/api/public-sector/").json()
    assert len(final_items) == 0
    print("已彻底清空测试数据，考公考编库归零成功！")

if __name__ == "__main__":
    test_public_sector_clean_state_and_lifecycle()
    print("\n🎉 test_public_sector 全部断言通过！")
