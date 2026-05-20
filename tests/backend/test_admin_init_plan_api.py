import json
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
from app.models.entities import Annotation, CaseRecord, ManualAnnotationEntry, ManualCaseAnnotation, Plan, QualityRule
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


def csv_file(text: str, filename: str = "cases.csv") -> dict:
    return {"file": (filename, text.encode("utf-8"), "text/csv")}


def create_plan_with_csv(
    client: TestClient,
    admin_token: str,
    owner_user_id: int,
    csv_text: str,
    name: str = "联调测试计划",
    annotation_type: str = "comparison",
) -> dict:
    response = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": name, "owner_user_id": str(owner_user_id), "description": "测试导入计划", "annotation_type": annotation_type},
        files=csv_file(csv_text),
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_health_check(api_context: ApiContext) -> None:
    response = api_context.client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_auth_login_refresh_me_and_role_boundaries(api_context: ApiContext) -> None:
    client = api_context.client

    invalid = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert invalid.status_code == 401
    assert invalid.json()["detail"] == "AUTH_INVALID_CREDENTIALS"

    invalid_token = client.get("/api/auth/me", headers=auth_headers("invalid-access-token"))
    assert invalid_token.status_code == 401
    assert invalid_token.json()["detail"] == "AUTH_UNAUTHORIZED"

    admin_session = login(client, "admin", "admin")
    assert admin_session["token_type"] == "bearer"
    assert admin_session["expires_in"] > 0
    assert admin_session["refresh_expires_in"] > 0
    assert admin_session["user"]["role"] == "admin"

    me = client.get("/api/auth/me", headers=auth_headers(admin_session["access_token"]))
    assert me.status_code == 200
    assert me.json()["username"] == "admin"
    assert me.json()["is_active"] is True

    refreshed = client.post("/api/auth/refresh", json={"refresh_token": admin_session["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    assert refreshed.json()["refresh_token"]

    invalid_refresh = client.post("/api/auth/refresh", json={"refresh_token": "bad-token"})
    assert invalid_refresh.status_code == 401
    assert invalid_refresh.json()["detail"] == "AUTH_INVALID_REFRESH_TOKEN"

    operator_session = login(client, "czy", "czy")
    forbidden = client.get("/api/admin/plans", headers=auth_headers(operator_session["access_token"]))
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"] == "FORBIDDEN"


def test_plan_import_status_conflicts_and_error_contracts(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)

    create_without_import = client.post(
        "/api/admin/plans",
        headers=auth_headers(admin_token),
        json={"name": "不应创建草稿", "owner_user_id": owner_user_id},
    )
    assert create_without_import.status_code == 400
    assert create_without_import.json()["detail"] == "PLAN_IMPORT_REQUIRED"

    invalid_owner = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": "错误负责人", "owner_user_id": "999"},
        files=csv_file("住院号,病历内容,智能体A输出,智能体B输出\nH001,病历,A,B\n"),
    )
    assert invalid_owner.status_code == 400
    assert invalid_owner.json()["detail"] == "VALIDATION_ERROR"

    invalid_file_type = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": "错误文件", "owner_user_id": str(owner_user_id)},
        files=csv_file("not,csv\n", filename="cases.txt"),
    )
    assert invalid_file_type.status_code == 400
    assert invalid_file_type.json()["detail"] == "CSV_INVALID_TEMPLATE"

    invalid_csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "H001,  病例 一  , A 输出 , B 输出\n"
        "H001,重复病例,A2,B2\n"
        "H002,病例二,A2,B2\n"
        "H003,缺少 A,,B3\n"
    )
    invalid_validation = client.post(
        "/api/admin/plans/import-csv/validate",
        headers=auth_headers(admin_token),
        data={"name": "预检失败", "owner_user_id": str(owner_user_id), "annotation_type": "comparison"},
        files=csv_file(invalid_csv_text),
    )
    assert invalid_validation.status_code == 200
    invalid_summary = invalid_validation.json()
    assert invalid_summary["plan_id"] is None
    assert invalid_summary["success_rows"] == 2
    assert invalid_summary["skipped_rows"] == 1
    assert invalid_summary["failed_rows"] == 1
    with api_context.session_factory() as db:
        assert db.query(Plan).count() == 0
        assert db.query(CaseRecord).count() == 0

    invalid_create = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": "不应创建错误 CSV", "owner_user_id": str(owner_user_id), "annotation_type": "comparison"},
        files=csv_file(invalid_csv_text),
    )
    assert invalid_create.status_code == 400
    assert invalid_create.json()["detail"]["code"] == "CSV_ROW_ERRORS"
    assert invalid_create.json()["detail"]["import_summary"]["failed_rows"] == 1
    with api_context.session_factory() as db:
        assert db.query(Plan).count() == 0
        assert db.query(CaseRecord).count() == 0

    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "H001,  病例 一  , A 输出 , B 输出\n"
        "H001,重复病例,A2,B2\n"
        "H002,病例二,A2,B2\n"
        "\n"
        ",,,\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text)
    plan = payload["plan"]
    summary = payload["import_summary"]
    assert plan["status"] == "active"
    assert plan["total_cases"] == 2
    assert summary["total_rows"] == 3
    assert summary["success_rows"] == 2
    assert summary["skipped_rows"] == 1
    assert summary["failed_rows"] == 0
    assert len(summary["errors"]) == 1

    list_response = client.get("/api/admin/plans", headers=auth_headers(admin_token), params={"status": "active"})
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1

    detail_response = client.get(f"/api/admin/plans/{plan['id']}", headers=auth_headers(admin_token))
    assert detail_response.status_code == 200
    assert detail_response.json()["pending_cases"] == 2

    not_found = client.get("/api/admin/plans/99999", headers=auth_headers(admin_token))
    assert not_found.status_code == 404
    assert not_found.json()["detail"] == "PLAN_NOT_FOUND"

    close_response = client.patch(f"/api/admin/plans/{plan['id']}", headers=auth_headers(admin_token), json={"status": "closed"})
    assert close_response.status_code == 200
    assert close_response.json()["status"] == "closed"

    metadata_update = client.patch(
        f"/api/admin/plans/{plan['id']}",
        headers=auth_headers(admin_token),
        json={"name": "关闭后仍可编辑", "description": "metadata only"},
    )
    assert metadata_update.status_code == 200
    assert metadata_update.json()["name"] == "关闭后仍可编辑"

    blocked_owner_update = client.patch(
        f"/api/admin/plans/{plan['id']}",
        headers=auth_headers(admin_token),
        json={"owner_user_id": owner_user_id},
    )
    assert blocked_owner_update.status_code == 409
    assert blocked_owner_update.json()["detail"] == "PLAN_STATUS_CONFLICT"

    blocked_import = client.post(
        f"/api/admin/plans/{plan['id']}/import-csv",
        headers=auth_headers(admin_token),
        files=csv_file("住院号,病历内容,智能体A输出,智能体B输出\nH009,病历,A,B\n"),
    )
    assert blocked_import.status_code == 409
    assert blocked_import.json()["detail"] == "PLAN_CLOSED"

    operator_token = login(client, "czy", "czy")["access_token"]
    with api_context.session_factory() as db:
        case_id = db.query(CaseRecord.id).filter(CaseRecord.plan_id == plan["id"]).first()[0]
    blocked_annotation = client.post(
        f"/api/operator/tasks/{case_id}/annotate",
        headers=auth_headers(operator_token),
        json={"decision": "A_BETTER", "reason_codes": ["NO_HIT_ERROR_RULE"]},
    )
    assert blocked_annotation.status_code == 409
    assert blocked_annotation.json()["detail"] == "PLAN_CLOSED"

    restart_response = client.patch(f"/api/admin/plans/{plan['id']}", headers=auth_headers(admin_token), json={"status": "active"})
    assert restart_response.status_code == 200
    assert restart_response.json()["status"] == "active"


def test_manual_plan_import_template_and_annotation_type_contracts(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)

    invalid_type = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": "非法类型", "owner_user_id": str(owner_user_id), "annotation_type": "invalid"},
        files=csv_file("住院号,病历内容\nM001,病历\n"),
    )
    assert invalid_type.status_code == 400
    assert invalid_type.json()["detail"] == "VALIDATION_ERROR"

    wrong_template = client.post(
        "/api/admin/plans/import-csv",
        headers=auth_headers(admin_token),
        data={"name": "模板不匹配", "owner_user_id": str(owner_user_id), "annotation_type": "manual"},
        files=csv_file("住院号,病历内容,智能体A输出,智能体B输出\nM001,病历,A,B\n"),
    )
    assert wrong_template.status_code == 400
    assert wrong_template.json()["detail"] == "CSV_INVALID_TEMPLATE"

    manual_invalid_csv = "住院号,病历内容\nM001,病历一\nM002,\n\n,\n"
    manual_invalid = client.post(
        "/api/admin/plans/import-csv/validate",
        headers=auth_headers(admin_token),
        data={"name": "手动预检失败", "owner_user_id": str(owner_user_id), "annotation_type": "manual"},
        files=csv_file(manual_invalid_csv),
    )
    assert manual_invalid.status_code == 200
    assert manual_invalid.json()["total_rows"] == 2
    assert manual_invalid.json()["failed_rows"] == 1

    manual_csv = "住院号,病历内容\nM001,病历一\nM002,病历二\n\n,\n"
    payload = create_plan_with_csv(client, admin_token, owner_user_id, manual_csv, name="手动导入测试", annotation_type="manual")
    plan = payload["plan"]
    assert plan["annotation_type"] == "manual"
    assert plan["total_cases"] == 2
    assert payload["import_summary"]["total_rows"] == 2
    assert payload["import_summary"]["success_rows"] == 2

    with api_context.session_factory() as db:
        cases = db.query(CaseRecord).filter(CaseRecord.plan_id == plan["id"]).order_by(CaseRecord.id.asc()).all()
        assert cases[0].agent_a_output is None
        assert cases[0].display_a_source is None

    immutable_type = client.patch(
        f"/api/admin/plans/{plan['id']}",
        headers=auth_headers(admin_token),
        json={"annotation_type": "comparison"},
    )
    assert immutable_type.status_code == 400
    assert immutable_type.json()["detail"] == "VALIDATION_ERROR"


def test_plan_import_preserves_multiline_case_and_agent_outputs(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        'M001,"入院记录\n主诉：腹痛\n现病史：持续 1 天","## A 结果\n|规则|扣分|\n|---|---|\n|主诉完整|0.5|","B 第一行\nB 第二行"\n'
    )

    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text, name="多行 CSV 保留测试")
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        case = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).one()
        assert case.record_text == "入院记录\n主诉：腹痛\n现病史：持续 1 天"
        assert case.agent_a_output == "## A 结果\n|规则|扣分|\n|---|---|\n|主诉完整|0.5|"
        assert case.agent_b_output == "B 第一行\nB 第二行"


def test_stats_annotations_consistency_and_shanghai_date_boundaries(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "B001,病例1,A1,B1\n"
        "B002,病例2,A2,B2\n"
        "B003,病例3,A3,B3\n"
        "B004,病例4,A4,B4\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text, name="统计边界测试计划")
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        cases = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).order_by(CaseRecord.hospitalization_no.asc()).all()
        for case in cases:
            case.display_a_source = "agent_a_output"
            case.display_b_source = "agent_b_output"
        annotations = [
            Annotation(
                plan_id=plan_id,
                case_id=cases[0].id,
                operator_user_id=owner_user_id,
                decision="A_BETTER",
                reason_codes=json.dumps(["NO_HIT_ERROR_RULE"]),
                created_at=datetime(2026, 5, 6, 15, 59, 59),
            ),
            Annotation(
                plan_id=plan_id,
                case_id=cases[1].id,
                operator_user_id=owner_user_id,
                decision="A_BETTER",
                reason_codes=json.dumps(["NO_HIT_ERROR_RULE", "OTHER"]),
                created_at=datetime(2026, 5, 6, 16, 0, 0),
            ),
            Annotation(
                plan_id=plan_id,
                case_id=cases[2].id,
                operator_user_id=owner_user_id,
                decision="B_BETTER",
                reason_codes=json.dumps(["NO_MISSING_RULE"]),
                created_at=datetime(2026, 5, 7, 15, 59, 59),
            ),
            Annotation(
                plan_id=plan_id,
                case_id=cases[3].id,
                operator_user_id=owner_user_id,
                decision="BOTH_GOOD",
                reason_codes=json.dumps(["NO_OVER_QC"]),
                created_at=datetime(2026, 5, 7, 16, 0, 0),
            ),
        ]
        db.add_all(annotations)
        db.commit()

    params = {"operator_user_id": owner_user_id, "start_date": "2026-05-07", "end_date": "2026-05-07"}
    stats_response = client.get(f"/api/admin/plans/{plan_id}/stats", headers=auth_headers(admin_token), params=params)
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["total_cases"] == 4
    assert stats["annotated_cases"] == 2
    assert stats["pending_cases"] == 2
    assert stats["completion_rate"] == 0.5
    assert stats["decision_distribution"]["A_BETTER"] == 1
    assert stats["decision_distribution"]["B_BETTER"] == 1
    assert stats["decision_distribution"]["BOTH_BAD"] == 0
    assert stats["decision_distribution"]["BOTH_GOOD"] == 0
    reason_counts = {item["key"]: item["count"] for item in stats["reason_distribution"]}
    assert reason_counts == {
        "NO_HIT_ERROR_RULE": 1,
        "NO_MISSING_RULE": 1,
        "NO_OVER_QC": 0,
        "OTHER": 1,
    }

    detail_response = client.get(
        f"/api/admin/plans/{plan_id}/annotations",
        headers=auth_headers(admin_token),
        params={**params, "page": 1, "page_size": 20},
    )
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["total"] == 2
    recomputed_decisions = {"A_BETTER": 0, "B_BETTER": 0, "BOTH_BAD": 0, "BOTH_GOOD": 0}
    recomputed_reasons = {"NO_HIT_ERROR_RULE": 0, "NO_MISSING_RULE": 0, "NO_OVER_QC": 0, "OTHER": 0}
    for item in detail["items"]:
        recomputed_decisions[item["decision"]] += 1
        for reason in item["reason_codes"]:
            recomputed_reasons[reason] += 1
    assert recomputed_decisions == stats["decision_distribution"]
    assert recomputed_reasons == reason_counts


def test_admin_reports_normalize_decisions_to_original_agent_sources(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    csv_text = (
        "住院号,病历内容,智能体A输出,智能体B输出\n"
        "M001,病例1,智能体A-1,智能体B-1\n"
        "M002,病例2,智能体A-2,智能体B-2\n"
        "M003,病例3,智能体A-3,智能体B-3\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, csv_text, name="原始归属统计测试计划")
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        cases = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).order_by(CaseRecord.hospitalization_no.asc()).all()
        cases[0].display_a_source = "agent_a_output"
        cases[0].display_b_source = "agent_b_output"
        cases[1].display_a_source = "agent_b_output"
        cases[1].display_b_source = "agent_a_output"
        cases[2].display_a_source = "agent_a_output"
        cases[2].display_b_source = "agent_b_output"
        db.add_all(
            [
                Annotation(
                    plan_id=plan_id,
                    case_id=cases[0].id,
                    operator_user_id=owner_user_id,
                    decision="A_BETTER",
                    reason_codes=json.dumps(["NO_HIT_ERROR_RULE"]),
                ),
                Annotation(
                    plan_id=plan_id,
                    case_id=cases[1].id,
                    operator_user_id=owner_user_id,
                    decision="B_BETTER",
                    reason_codes=json.dumps(["NO_MISSING_RULE"]),
                ),
                Annotation(
                    plan_id=plan_id,
                    case_id=cases[2].id,
                    operator_user_id=owner_user_id,
                    decision="A_BETTER",
                    reason_codes=json.dumps(["NO_OVER_QC"]),
                ),
            ]
        )
        db.commit()

    stats_response = client.get(f"/api/admin/plans/{plan_id}/stats", headers=auth_headers(admin_token))
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["decision_distribution"]["A_BETTER"] == 3
    assert stats["decision_distribution"]["B_BETTER"] == 0
    assert stats["decision_distribution"]["BOTH_BAD"] == 0
    assert stats["decision_distribution"]["BOTH_GOOD"] == 0

    detail_response = client.get(
        f"/api/admin/plans/{plan_id}/annotations",
        headers=auth_headers(admin_token),
        params={"page": 1, "page_size": 20},
    )
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["total"] == 3
    assert {item["decision"] for item in detail["items"]} == {"A_BETTER"}

    filtered_response = client.get(
        f"/api/admin/plans/{plan_id}/annotations",
        headers=auth_headers(admin_token),
        params={"decision": "B_BETTER", "page": 1, "page_size": 20},
    )
    assert filtered_response.status_code == 200
    assert filtered_response.json()["total"] == 0


def test_manual_admin_stats_summary_and_detail_views(api_context: ApiContext) -> None:
    client = api_context.client
    admin_token = login(client, "admin", "admin")["access_token"]
    owner_user_id = operator_id(client, admin_token)
    manual_csv = (
        "住院号,病历内容\n"
        'R001,"主诉：胸痛\n患者入院后未及时完善入院记录\n未见心电图完成时间记录"\n'
        "R002,主诉：胸闷，病历记录完整\n"
    )
    payload = create_plan_with_csv(client, admin_token, owner_user_id, manual_csv, name="手动报表测试", annotation_type="manual")
    plan_id = payload["plan"]["id"]

    with api_context.session_factory() as db:
        rule = QualityRule(category="admission_record", content="入院记录需及时完成", score="2", created_by=1)
        db.add(rule)
        db.flush()
        cases = db.query(CaseRecord).filter(CaseRecord.plan_id == plan_id).order_by(CaseRecord.id.asc()).all()
        first = ManualCaseAnnotation(plan_id=plan_id, case_id=cases[0].id, operator_user_id=owner_user_id, result="has_issues", created_at=datetime(2026, 5, 6, 16, 0, 0), submitted_at=datetime(2026, 5, 6, 16, 0, 0))
        second = ManualCaseAnnotation(plan_id=plan_id, case_id=cases[1].id, operator_user_id=owner_user_id, result="no_issue", created_at=datetime(2026, 5, 7, 16, 0, 0), submitted_at=datetime(2026, 5, 7, 16, 0, 0))
        db.add_all([first, second])
        db.flush()
        first_snippet = "患者入院后未及时完善入院记录"
        second_snippet = "未见心电图完成时间记录"
        first_start = cases[0].record_text.index(first_snippet)
        second_start = cases[0].record_text.index(second_snippet)
        db.add_all(
            [
                ManualAnnotationEntry(
                    manual_annotation_id=first.id,
                    plan_id=plan_id,
                    case_id=cases[0].id,
                    operator_user_id=owner_user_id,
                    source_text=first_snippet,
                    start_offset=first_start,
                    end_offset=first_start + len(first_snippet),
                    quality_rule_id=rule.id,
                    quality_rule_category_snapshot=rule.category,
                    quality_rule_content_snapshot=rule.content,
                    quality_rule_score_snapshot=rule.score,
                    suggestion="补充入院记录完成时间。",
                    created_at=datetime(2026, 5, 6, 16, 1, 0),
                ),
                ManualAnnotationEntry(
                    manual_annotation_id=first.id,
                    plan_id=plan_id,
                    case_id=cases[0].id,
                    operator_user_id=owner_user_id,
                    source_text=second_snippet,
                    start_offset=second_start,
                    end_offset=second_start + len(second_snippet),
                    quality_rule_id=rule.id,
                    quality_rule_category_snapshot=rule.category,
                    quality_rule_content_snapshot=rule.content,
                    quality_rule_score_snapshot=rule.score,
                    suggestion="补充心电图完成时间。",
                    created_at=datetime(2026, 5, 6, 16, 2, 0),
                ),
            ]
        )
        manual_annotation_id = first.id
        db.commit()

    stats_response = client.get(f"/api/admin/plans/{plan_id}/stats", headers=auth_headers(admin_token))
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["annotation_type"] == "manual"
    assert stats["total_cases"] == 2
    assert stats["annotated_cases"] == 2
    assert stats["has_issues_cases"] == 1
    assert stats["no_issue_cases"] == 1
    assert stats["decision_distribution"] is None

    detail_response = client.get(
        f"/api/admin/plans/{plan_id}/annotations",
        headers=auth_headers(admin_token),
        params={"operator_user_id": owner_user_id, "start_date": "2026-05-08", "end_date": "2026-05-08"},
    )
    assert detail_response.status_code == 200
    summary = detail_response.json()
    assert summary["total"] == 1
    assert summary["items"][0]["result"] == "no_issue"
    assert summary["items"][0]["problem_count"] == 0
    assert "source_text" not in summary["items"][0]
    assert "start_offset" not in summary["items"][0]

    all_details = client.get(f"/api/admin/plans/{plan_id}/annotations", headers=auth_headers(admin_token))
    assert all_details.status_code == 200
    rows = all_details.json()["items"]
    has_issue_row = next(item for item in rows if item["manual_annotation_id"] == manual_annotation_id)
    assert has_issue_row["problem_count"] == 2

    single_response = client.get(f"/api/admin/plans/{plan_id}/annotations/{manual_annotation_id}", headers=auth_headers(admin_token))
    assert single_response.status_code == 200
    single = single_response.json()
    assert single["manual_annotation_id"] == manual_annotation_id
    assert single["result"] == "has_issues"
    assert len(single["entries"]) == 2
    assert single["entries"][0]["quality_rule"]["content"] == "入院记录需及时完成"
    assert single["entries"][0]["start_offset"] >= 0
