import sqlite3
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db_path = tmp_path / "aicompare-test.db"
    with sqlite3.connect(db_path) as connection:
        connection.execute("CREATE TABLE rules (id INTEGER PRIMARY KEY, code TEXT)")
        connection.execute("INSERT INTO rules (code) VALUES ('legacy-rule')")

    monkeypatch.setenv("SQLITE_PATH", str(db_path))
    for module_name in list(sys.modules):
        if module_name == "app" or module_name.startswith("app."):
            del sys.modules[module_name]

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client, db_path


def auth_headers(client: TestClient, username: str = "admin", password: str = "admin") -> dict[str, str]:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_admin_rules_crud_search_filter_and_soft_delete(client):
    test_client, db_path = client
    headers = auth_headers(test_client)

    with sqlite3.connect(db_path) as connection:
        old_table = connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rules'").fetchone()
        new_table = connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quality_rules'").fetchone()
    assert old_table is None
    assert new_table == ("quality_rules",)

    first = test_client.post(
        "/api/admin/rules",
        json={"category": "admission_record", "content": "入院记录必须完整", "score": "5分"},
        headers=headers,
    )
    assert first.status_code == 201
    first_payload = first.json()
    assert first_payload["category"] == "admission_record"
    assert "is_active" not in first_payload
    assert "code" not in first_payload

    second = test_client.post(
        "/api/admin/rules",
        json={"category": "daily_course_record", "content": "日常病程记录需要及时", "score": "score-only-keyword"},
        headers=headers,
    )
    assert second.status_code == 201

    by_content = test_client.get("/api/admin/rules", params={"keyword": "完整"}, headers=headers)
    assert by_content.status_code == 200
    assert by_content.json()["total"] == 1
    assert by_content.json()["items"][0]["id"] == first_payload["id"]

    by_score = test_client.get("/api/admin/rules", params={"keyword": "score-only-keyword"}, headers=headers)
    assert by_score.status_code == 200
    assert by_score.json()["total"] == 0

    by_category = test_client.get("/api/admin/rules", params={"category": "daily_course_record"}, headers=headers)
    assert by_category.status_code == 200
    assert by_category.json()["total"] == 1

    patched = test_client.patch(
        f"/api/admin/rules/{first_payload['id']}",
        json={"category": "first_course_record", "content": "首次病程记录完整", "score": "单项否决"},
        headers=headers,
    )
    assert patched.status_code == 200
    assert patched.json()["category"] == "first_course_record"
    assert patched.json()["score"] == "单项否决"

    deleted = test_client.delete(f"/api/admin/rules/{first_payload['id']}", headers=headers)
    assert deleted.status_code == 204
    after_delete = test_client.get("/api/admin/rules", params={"keyword": "首次病程"}, headers=headers)
    assert after_delete.status_code == 200
    assert after_delete.json()["total"] == 0
    patch_deleted = test_client.patch(f"/api/admin/rules/{first_payload['id']}", json={"score": "1"}, headers=headers)
    assert patch_deleted.status_code == 404


def test_admin_rules_validation_template_import_and_permissions(client):
    test_client, _ = client
    admin_headers = auth_headers(test_client)
    operator_headers = auth_headers(test_client, "czy", "czy")

    forbidden = test_client.get("/api/admin/rules", headers=operator_headers)
    assert forbidden.status_code == 403

    invalid_payload = test_client.post(
        "/api/admin/rules",
        json={"category": "bad_category", "content": "内容", "score": "1"},
        headers=admin_headers,
    )
    assert invalid_payload.status_code == 422

    template = test_client.get("/api/admin/rules/template.csv", headers=admin_headers)
    assert template.status_code == 200
    assert "规则分类,规则内容,分值" in template.content.decode("utf-8-sig")

    duplicate_csv = "category,content,score\ndaily_course_record,重复规则,2\ndaily_course_record,重复规则,2\n"
    duplicate_import = test_client.post(
        "/api/admin/rules/import-csv",
        files={"file": ("rules.csv", duplicate_csv.encode("utf-8"), "text/csv")},
        headers=admin_headers,
    )
    assert duplicate_import.status_code == 200
    assert duplicate_import.json()["total_rows"] == 2
    assert duplicate_import.json()["success_rows"] == 2
    assert duplicate_import.json()["failed_rows"] == 0

    chinese_csv = "规则分类,规则内容,分值\n入院病历,中文模板导入规则,2\n首次病程记录,中文分类导入规则,单项否决\n"
    chinese_validate = test_client.post(
        "/api/admin/rules/validate-csv",
        files={"file": ("rules.csv", chinese_csv.encode("utf-8"), "text/csv")},
        headers=admin_headers,
    )
    assert chinese_validate.status_code == 200
    assert chinese_validate.json()["success_rows"] == 2
    assert chinese_validate.json()["failed_rows"] == 0
    assert test_client.get("/api/admin/rules", params={"keyword": "中文模板"}, headers=admin_headers).json()["total"] == 0

    chinese_import = test_client.post(
        "/api/admin/rules/import-csv",
        files={"file": ("rules.csv", chinese_csv.encode("utf-8"), "text/csv")},
        headers=admin_headers,
    )
    assert chinese_import.status_code == 200
    assert chinese_import.json()["success_rows"] == 2
    imported = test_client.get("/api/admin/rules", params={"keyword": "中文模板"}, headers=admin_headers)
    assert imported.status_code == 200
    assert imported.json()["items"][0]["category"] == "admission_record"

    invalid_csv = (
        "category,content,score\n"
        ",缺分类,1\n"
        "not_allowed,非法分类,2\n"
        "admission_record,,3\n"
        "admission_record,缺少分值,\n"
    )
    invalid_import = test_client.post(
        "/api/admin/rules/import-csv",
        files={"file": ("rules.csv", invalid_csv.encode("utf-8"), "text/csv")},
        headers=admin_headers,
    )
    assert invalid_import.status_code == 200
    payload = invalid_import.json()
    assert payload["total_rows"] == 4
    assert payload["success_rows"] == 0
    assert payload["failed_rows"] == 4
    assert {item["field"] for item in payload["errors"]} == {"category", "content", "score"}
    assert test_client.get("/api/admin/rules", params={"keyword": "非法分类"}, headers=admin_headers).json()["total"] == 0
