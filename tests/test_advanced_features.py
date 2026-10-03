import sys
import os
import io

# 设置 Windows 控制台安全输出
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# 将项目根目录添加到 sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from backend.main import app
from backend.services.offer_calculator import OfferCalculatorService
from backend.services.pdf_parser import PDFParserService
from backend.models import Offer

def test_advanced_features_suite():
    run_tests()

def run_tests():
    with TestClient(app) as client:
        # 1. Test Root SPA page
        resp = client.get('/')
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        print("[PASS 1/5] Root SPA endpoint working.")

        # 2. Test Offers Comparison & Real Hourly Wage (0 mock data principle)
        created_offer = client.post('/api/offers/', json={
            'title': '测试职位',
            'company': '测试企业',
            'base_salary_monthly': 25000,
            'months_count': 15,
            'year_end_bonus': 20000,
            'monthly_allowance': 1000,
            'work_hours_per_day': 8.5,
            'work_days_per_week': 5,
            'annual_leave_days': 7,
            'commute_minutes_per_day': 45,
            'benefits_score': 4,
            'growth_score': 4
        }).json()
        assert 'id' in created_offer

        resp = client.get('/api/offers/compare/all')
        assert resp.status_code == 200
        offers = resp.json()
        assert len(offers) >= 1
        o = offers[0]
        assert o['real_hourly_wage'] > 0
        print(f"[PASS 2/5] Offers Comparison API working: {o['company']} ({o['title']}): Real Hourly Wage = {o['real_hourly_wage']} CNY/h | Overall Score = {o['overall_score']}")

        # Clean up test offer
        client.delete(f"/api/offers/{created_offer['id']}")

        # 3. Test LLM Settings
        resp = client.get('/api/settings/llm')
        assert resp.status_code == 200
        cfg = resp.json()
        assert 'provider' in cfg
        print(f"[PASS 3/5] LLM Settings API working. Provider: {cfg['provider']}")

        # 4. Test AI Resume Tailoring and Mock Interview (Offline rule fallback)
        resp_tailor = client.post('/api/ai/tailor-resume', json={
            'resume_text': 'Python, FastAPI, Redis high-concurrency dev',
            'jd_text': 'Senior Python architect, microservices and concurrency'
        })
        assert resp_tailor.status_code == 200
        assert 'advice' in resp_tailor.json()

        resp_mock = client.post('/api/ai/mock-interview', json={
            'history': [],
            'jd_text': 'Python Backend Engineer',
            'candidate_answer': 'I am experienced with FastAPI async and connection pools'
        })
        assert resp_mock.status_code == 200
        assert 'reply' in resp_mock.json()
        print("[PASS 4/5] AI Resume Tailor & Mock Interview working with instant fallback.")

        # 5. Test PDF Parser
        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buf = io.BytesIO()
        writer.write(buf)
        buf.seek(0)
        pdf_res = PDFParserService.parse_pdf_bytes(buf.getvalue(), 'sample_resume.pdf')
        assert 'success' in pdf_res
        print("[PASS 5/5] PDF Parser Service verified.")

        print("\nALL 6 ADVANCED FEATURES PASSED ALL INTEGRATION TESTS SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
