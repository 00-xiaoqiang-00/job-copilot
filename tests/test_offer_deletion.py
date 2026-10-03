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

def test_offers_complete_deletion():
    with TestClient(app) as client:
        # 1. Get all offers
        resp = client.get('/api/offers/')
        offers = resp.json()
        print(f"Initial offers count: {len(offers)}")

        # 2. Delete all existing offers
        for o in offers:
            del_resp = client.delete(f"/api/offers/{o['id']}")
            assert del_resp.status_code == 200
            print(f"Deleted offer id {o['id']} ({o['company']})")

        # 3. Check again - MUST be strictly 0!
        resp_after = client.get('/api/offers/')
        assert len(resp_after.json()) == 0, f"Error: expected 0 offers, got {len(resp_after.json())}"

        resp_compare = client.get('/api/offers/compare/all')
        assert len(resp_compare.json()) == 0, f"Error: expected 0 in compare, got {len(resp_compare.json())}"
        print("✅ PASS: All offers can be completely deleted and count is strictly 0!")

        # 4. Create one new offer
        create_resp = client.post('/api/offers/', json={
            'title': '测试职位',
            'company': '测试公司',
            'base_salary_monthly': 20000,
            'months_count': 12,
            'year_end_bonus': 0,
            'monthly_allowance': 0,
            'work_hours_per_day': 8,
            'work_days_per_week': 5,
            'annual_leave_days': 5,
            'commute_minutes_per_day': 30,
            'benefits_score': 4,
            'growth_score': 4
        })
        assert create_resp.status_code == 200
        print("✅ PASS: Created 1 new custom offer.")

        # 5. Check count is exactly 1
        resp_one = client.get('/api/offers/compare/all')
        assert len(resp_one.json()) == 1
        print("✅ PASS: Count is exactly 1!")

        # 6. Clean up: Delete created test offer so DB is guaranteed 100% clean (0 records)
        created_id = create_resp.json()['id']
        del_one = client.delete(f"/api/offers/{created_id}")
        assert del_one.status_code == 200
        final_check = client.get('/api/offers/')
        assert len(final_check.json()) == 0
        print("✅ PASS: Cleaned up test offer. Database strictly 0 records!")

if __name__ == '__main__':
    test_offers_complete_deletion()
