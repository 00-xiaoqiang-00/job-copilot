import os
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_backup_and_restore_workflow():
    with TestClient(app) as client:
        # 1. 录入一条测试岗位
        add_res = client.post("/api/jobs/", json={
            "title": "备份测试工程师",
            "company": "测试科技集团",
            "status": "applied",
            "salary": "25k-35k"
        })
        assert add_res.status_code == 200
        job_id = add_res.json()["id"]

        # 2. 测试一键备份下载接口
        backup_res = client.get("/api/settings/backup-db")
        assert backup_res.status_code == 200
        assert backup_res.headers["content-type"] == "application/x-sqlite3"
        backup_bytes = backup_res.content
        assert len(backup_bytes) > 100
        assert backup_bytes.startswith(b"SQLite format 3\x00")

        # 3. 测试 JSON 导出接口
        export_res = client.get("/api/settings/export-json")
        assert export_res.status_code == 200
        export_data = export_res.json()
        assert export_data["version"] == "4.5.0"
        assert any(j["id"] == job_id for j in export_data["jobs"])

        # 4. 测试错误文件格式防护
        invalid_res = client.post(
            "/api/settings/restore-db",
            files={"file": ("fake.txt", io.BytesIO(b"hello world"), "text/plain")}
        )
        assert invalid_res.status_code == 400

        # 5. 测试真实 .db 文件恢复上传接口
        restore_res = client.post(
            "/api/settings/restore-db",
            files={"file": ("valid_backup.db", io.BytesIO(backup_bytes), "application/x-sqlite3")}
        )
        assert restore_res.status_code == 200
        assert restore_res.json()["success"] is True

        # 6. 清理测试岗位
        client.delete(f"/api/jobs/{job_id}")
