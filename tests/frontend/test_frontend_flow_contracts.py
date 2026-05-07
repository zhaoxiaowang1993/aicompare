from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read_repo_file(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_frontend_auth_routes_and_refresh_flow_are_wired() -> None:
    app_tsx = read_repo_file("frontend/src/app/App.tsx")
    api_ts = read_repo_file("frontend/src/lib/api.ts")
    login_page = read_repo_file("frontend/src/pages/auth/login-page.tsx")

    assert '<Route path="/login"' in app_tsx
    assert '<Route path="/admin/plans"' in app_tsx
    assert '<Route path="/admin/plans/:id"' in app_tsx
    assert 'role="admin"' in app_tsx
    assert 'getAccessToken()' in app_tsx
    assert "headers.Authorization = `Bearer ${token}`" in api_ts
    assert "/auth/refresh" in api_ts
    assert "refreshRequest" in api_ts
    assert "window.location.assign('/login')" in api_ts
    assert "login(values.username, values.password)" in login_page
    assert "'账号或密码错误，请重新输入。'" in login_page


def test_frontend_plan_create_import_and_reporting_endpoints_are_wired() -> None:
    admin_api = read_repo_file("frontend/src/api/admin-plans.ts")
    plans_page = read_repo_file("frontend/src/pages/admin/admin-plans-page.tsx")
    detail_page = read_repo_file("frontend/src/pages/admin/admin-plan-detail-page.tsx")
    upload_step = read_repo_file("frontend/src/pages/admin/components/upload-data-step.tsx")
    annotation_section = read_repo_file("frontend/src/pages/admin/components/annotation-detail-section.tsx")

    assert "createPlanWithImport" in admin_api
    assert "'/admin/plans/import-csv'" in admin_api
    assert "`/admin/plans/${planId}/import-csv`" in admin_api
    assert "`/admin/plans/${planId}/stats`" in admin_api
    assert "`/admin/plans/${planId}/annotations`" in admin_api
    assert "createPlanWithImport(basicValues as CreatePlanPayload, file)" in plans_page
    assert "importPlanCsv(createdPlan.id, file)" in plans_page
    assert "fetchPlanStats(planId, params)" in detail_page
    assert "fetchPlanAnnotations(planId" in detail_page
    assert "start_date" in detail_page
    assert "end_date" in detail_page
    assert "downloadCsvTemplate" in upload_step
    assert "URL.createObjectURL(blob)" in upload_step
    assert "标注计划数据模板.csv" in upload_step
    assert "住院号" in upload_step
    assert "智能体A输出" in upload_step
    assert "智能体B输出" in upload_step
    assert "timeZone: 'Asia/Shanghai'" in annotation_section
