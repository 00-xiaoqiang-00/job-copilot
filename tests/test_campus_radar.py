import sys
import os

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

def test_campus_radar_full_flow():
    with TestClient(app) as client:
        # 0. 确保测试前数据库处于纯净状态
        client.delete('/api/campus/purge/all')

        # 1. 验证初始绝对纯净状态 (0条记录)
        resp_init = client.get('/api/campus/')
        assert resp_init.status_code == 200
        assert len(resp_init.json()) == 0
        print("✅ PASS: Verified 100% clean initial state (0 mock records)")

        # 2. 主动触发真实开源多渠道同步
        sync_res = client.post('/api/campus/sync')
        assert sync_res.status_code == 200
        print(f"✅ PASS: Sync triggered: {sync_res.json()['message']}")

        # 3. 验证同步后的多行业分类与大盘统计
        resp = client.get('/api/campus/')
        assert resp.status_code == 200
        recruits = resp.json()
        print(f"✅ PASS: Synced campus recruits retrieved: {len(recruits)} companies")
        assert len(recruits) >= 50, "Expected at least 50 authentic multi-industry companies"

        stats_resp = client.get('/api/campus/stats')
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        print(f"✅ PASS: Campus stats retrieved: Total={stats['total_companies']}, Medical={stats['medical_count']}, Tech={stats['tech_count']}, Mfg={stats['manufacturing_count']}, State={stats['state_owned_count']}, Finance={stats['finance_count']}")
        assert stats['total_companies'] == len(recruits)
        assert stats['medical_count'] >= 5
        assert stats['tech_count'] >= 20
        assert stats['manufacturing_count'] >= 8
        assert stats['state_owned_count'] >= 4
        assert stats['finance_count'] >= 4

        # 2. 行业多维度筛选 (医疗健康/生物医药)
        med_resp = client.get('/api/campus/?industry=医疗')
        assert med_resp.status_code == 200
        med_items = med_resp.json()
        print(f"✅ PASS: Medical campus recruits filtered: {len(med_items)} companies")
        assert len(med_items) >= 4
        for m in med_items:
            assert '医疗' in m['industry'] or '生物' in m['industry']

        # 3. 关键词搜索
        kw_resp = client.get('/api/campus/?keyword=迈瑞')
        assert kw_resp.status_code == 200
        kw_items = kw_resp.json()
        print(f"✅ PASS: Keyword search '迈瑞': {len(kw_items)} found")
        assert len(kw_items) >= 1
        assert '迈瑞' in kw_items[0]['company_name']
        assert kw_items[0]['referral_code'] == 'MR2026VIP'

        # 4. 一键将迈瑞医疗秋招导入求职看板
        target_recruit = kw_items[0]
        import_resp = client.post(f"/api/campus/import-to-job/{target_recruit['id']}")
        assert import_resp.status_code == 200
        import_data = import_resp.json()
        print(f"✅ PASS: Imported to Job Kanban: {import_data['message']}")
        assert import_data['job']['company'] == '迈瑞医疗 (Mindray)'
        assert '秋招' in import_data['job']['title']
        assert import_data['calendar_event'] is not None, "Expected deadline calendar event"

        # 5. 验证看板中确已存在该岗位
        jobs_resp = client.get('/api/jobs/?status=wishlist')
        assert jobs_resp.status_code == 200
        wishlist_jobs = jobs_resp.json()
        assert any('迈瑞' in j['company'] for j in wishlist_jobs)
        print("✅ PASS: Job verified in Kanban wishlist column")

        # 6. 测试微信推文 / 招聘长文 AI 结构化提取接口
        sample_article = """
【2026届阿斯利康中国全球校园招聘全面启动】
一、面向对象：2026届高校应届生（本科/硕士/博士）
二、招募岗位方向：临床医学专员、生物医药数据分析师、医学信息沟通顾问
三、内推码：AZ_CHINA_VIP888
四、官方网申链接：https://careers.astrazeneca.com/china
五、网申截止时间：2026年10月15日
欢迎各位同学投递！
"""
        parse_resp = client.post('/api/campus/parse-article', json={
            'article_text': sample_article,
            'source_url': 'https://mp.weixin.qq.com/s/sample_test'
        })
        assert parse_resp.status_code == 200
        parsed_data = parse_resp.json()
        print(f"✅ PASS: AI article parsing result: {parsed_data['message']}")
        assert '阿斯利康' in parsed_data['recruit']['company_name'] or '招聘' in parsed_data['recruit']['company_name']
        print("✅ PASS: Campus Radar automated test suite passed 100%!")

        # 7. 清理并还原 100% 绝对纯净状态 (0 记录)
        client.delete(f"/api/jobs/{import_data['job']['id']}")
        purge_res = client.delete('/api/settings/purge-all-data')
        assert purge_res.status_code == 200
        assert len(client.get('/api/campus/').json()) == 0
        print("✅ PASS: Cleaned all test data and restored pure state (0 records)!")

if __name__ == '__main__':
    test_campus_radar_full_flow()
