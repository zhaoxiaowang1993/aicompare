from collections.abc import Callable, Generator
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.entities import CaseRecord, QualityRule
from app.services.bootstrap import seed_default_users


@dataclass(frozen=True)
class ApiContext:
    client: TestClient
    session_factory: Callable[[], Session]


@pytest.fixture()
def api_context(tmp_path: Path) -> Generator[ApiContext, None, None]:
    engine = create_engine(f"sqlite:///{tmp_path / 'aicompare-test.db'}", connect_args={"check_same_thread": False})
    testing_session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    db = testing_session_factory()
    try:
        seed_default_users(db)
    finally:
        db.close()

    def override_get_db() -> Generator[Session, None, None]:
        test_db = testing_session_factory()
        try:
            yield test_db
        finally:
            test_db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        yield ApiContext(client=client, session_factory=testing_session_factory)
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def login(client: TestClient, username: str, password: str) -> dict:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200
    return response.json()


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def operator_id(client: TestClient, admin_token: str) -> int:
    response = client.get("/api/admin/plans/owners", headers=auth_headers(admin_token))
    assert response.status_code == 200
    return response.json()[0]["id"]


def create_operator(client: TestClient, admin_token: str, username: str = "operator2") -> int:
    response = client.post(
        "/api/admin/users",
        headers=auth_headers(admin_token),
        json={"username": username, "password": username, "role": "operator"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def csv_file(text: str) -> dict:
    return {"file": ("cases.csv", text.encode("utf-8"), "text/csv")}


def create_plan_with_csv(client: TestClient, admin_token: str, owner_user_id: int, csv_text: str, name: str = "操作员测试计划") -> dict:
    response = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": name, "owner_user_id": str(owner_user_id), "description": "operator api test"},
        files=csv_file(csv_text),
    )
    assert response.status_code == 201, response.text
    return response.json()


def seed_quality_rules(db: Session) -> None:
    db.add_all(
        [
            QualityRule(category="admission_record", content="入院记录必须包含主诉", score="2", created_by=1),
            QualityRule(
                category="daily_course_record",
                content="已删除规则不应下发给操作员",
                score="1",
                deleted_at=datetime.utcnow(),
                created_by=1,
            ),
        ]
    )
    db.commit()


def test_operator_plan_list_next_task_permissions_and_rule_filter(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    create_operator(client, admin_token)
    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "O001,病例一,A1质控结果,B1质控结果\n"
        "O002,病例二,A2质控结果,B2质控结果\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text)
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        seed_quality_rules(db)
        first_case = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).order_by(CaseRecord.id.asc()).first()
        assert first_case is not None
        expected_output_a = getattr(first_case, first_case.display_a_source)
        expected_output_b = getattr(first_case, first_case.display_b_source)

    operator_token = login(client, "czy", "czy")["access_token"]
    list_response = client.get("/api/operator/plans", headers=auth_headers(operator_token))
    assert list_response.status_code == 200
    plan_item = list_response.json()["items"][0]
    assert plan_item["id"] == plan_id
    assert plan_item["total_cases"] == 2
    assert plan_item["annotated_cases"] == 0
    assert plan_item["pending_cases"] == 2
    assert plan_item["completion_rate"] == 0

    task_response = client.get(f"/api/operator/plans/{plan_id}/tasks/next", headers=auth_headers(operator_token))
    assert task_response.status_code == 200
    task = task_response.json()
    assert task["case_id"] == first_case.id
    assert task["output_a"] == expected_output_a
    assert task["output_b"] == expected_output_b
    assert {rule["content"] for rule in task["quality_rules"]} == {"入院记录必须包含主诉"}

    other_operator_token = login(client, "operator2", "operator2")["access_token"]
    forbidden = client.get(f"/api/operator/plans/{plan_id}/tasks/next", headers=auth_headers(other_operator_token))
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"] == "PLAN_NOT_ASSIGNED_TO_OPERATOR"

    missing = client.get("/api/operator/plans/999999/tasks/next", headers=auth_headers(operator_token))
    assert missing.status_code == 404
    assert missing.json()["detail"] == "PLAN_NOT_FOUND"

    close_response = client.patch(f"/api/admin/plans/{plan_id}", headers=auth_headers(admin_token), json={"status": "closed"})
    assert close_response.status_code == 200
    closed_task = client.get(f"/api/operator/plans/{plan_id}/tasks/next", headers=auth_headers(operator_token))
    assert closed_task.status_code == 409
    assert closed_task.json()["detail"] == "PLAN_CLOSED"

    closed_list = client.get("/api/operator/plans", headers=auth_headers(operator_token))
    assert closed_list.status_code == 200
    assert closed_list.json()["items"][0]["status"] == "closed"


def test_operator_annotation_submit_validation_duplicate_and_progress(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "S001,病例一,A1,B1\n"
        "S002,病例二,A2,B2\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text, name="提交测试计划")
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        cases = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).order_by(CaseRecord.id.asc()).all()
    first_case_id = cases[0].id
    second_case_id = cases[1].id

    operator_token = login(client, "czy", "czy")["access_token"]
    headers = auth_headers(operator_token)

    created = client.post(
        f"/api/operator/tasks/{first_case_id}/annotate",
        headers=headers,
        json={"decision": "BOTH_BAD", "reason_codes": ["NO_OVER_QC"], "notes": "第一条验收"},
    )
    assert created.status_code == 201
    assert created.json()["case_id"] == first_case_id
    assert created.json()["other_reason_text"] is None

    duplicate = client.post(
        f"/api/operator/tasks/{first_case_id}/annotate",
        headers=headers,
        json={"decision": "B_BETTER", "reason_codes": ["NO_MISSING_RULE"]},
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["detail"] == "ANNOTATION_ALREADY_EXISTS"

    missing_other_text = client.post(
        f"/api/operator/plans/{plan_id}/tasks/{second_case_id}/annotation",
        headers=headers,
        json={"decision": "A_BETTER", "reason_codes": ["OTHER"]},
    )
    assert missing_other_text.status_code == 400
    assert missing_other_text.json()["detail"] == "VALIDATION_ERROR"

    created_with_other = client.post(
        f"/api/operator/plans/{plan_id}/tasks/{second_case_id}/annotation",
        headers=headers,
        json={"decision": "A_BETTER", "reason_codes": ["NO_HIT_ERROR_RULE", "OTHER"], "other_reason_text": "规则外原因"},
    )
    assert created_with_other.status_code == 201
    assert created_with_other.json()["other_reason_text"] == "规则外原因"

    next_task = client.get(f"/api/operator/plans/{plan_id}/tasks/next", headers=headers)
    assert next_task.status_code == 200
    assert next_task.json() is None

    plans = client.get("/api/operator/plans", headers=headers)
    assert plans.status_code == 200
    plan = plans.json()["items"][0]
    assert plan["annotated_cases"] == 2
    assert plan["pending_cases"] == 0
    assert plan["completion_rate"] == 1
