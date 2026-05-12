## Admin Rules Validation Report

Date: 2026-05-12

### Scope

- Change: `admin-rules`
- Schema: `spec-driven`
- No branch merge or production push was performed.

### Design And Frontend Acceptance

- Reviewed `design/pages/admin-rules.pen`.
- Confirmed `/admin/rules` is admin-only in React route protection.
- Confirmed `frontend/src/pages/operator-annotate-page.tsx` and `design/pages/operator-annotate.pen` have no diff in this change.
- Updated batch import success and error states to match the Pencil panels: success has only the validation-passed panel and `导入`; error has only the error panel, row error list and `重新上传`.

### End-To-End Checks

Real API checks against local backend `http://127.0.0.1:8000/api` passed:

- Admin can create, list, edit and soft-delete rules.
- Deleted rules are hidden from subsequent list responses.
- Keyword search matches rule content and does not match score-only text.
- Category filter returns only the selected category.
- CSV template downloads with `规则分类,规则内容,分值`.
- Valid CSV import creates rules and allows duplicate rows.
- Invalid CSV with missing required fields or illegal categories returns row-level errors and imports no rows.
- Unauthenticated requests and operator requests are denied for admin rule APIs.

### Test And Build Checks

- Backend: `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m pytest` passed: `2 passed, 5 warnings`.
- Frontend lint: `npm run lint` passed with two existing `react-hooks/exhaustive-deps` warnings in plan pages.
- Frontend build: `npm run build` passed. Vite reported the existing large chunk warning.

### Deployment Checks

- Docker daemon was started and `docker compose -f docker/docker-compose.prod.yml build` was attempted.
- Docker build did not complete because the configured Docker registry mirror returned `403 Forbidden` while resolving `python:3.11-slim`; this is an environment/registry issue, not a project compile error.
- `docker compose -f docker/docker-compose.prod.yml config` passed with `SECRET_KEY=local-smoke-secret` and host port `2667`.
- Local backend health smoke passed: `GET /api/health` returned `{"status":"ok"}`.
- Local frontend smoke passed: `GET /login` returned the Vite HTML entry.

### Database Checks

- Fresh SQLite startup creates `quality_rules`.
- Fresh SQLite startup does not require or create legacy `rules`.
- SQLite containing a legacy `rules` table drops that table on startup and creates `quality_rules`.

### Release Notes

- CSV template format, allowed categories and import behavior are documented in `release-notes.md`.
