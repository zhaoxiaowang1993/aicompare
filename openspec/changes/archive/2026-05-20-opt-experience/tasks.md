## 1. Backend CSV Validation and Persistence

- [x] 1.1 Add shared CSV parsing behavior that ignores trailing fully empty rows for both comparison and manual templates.
- [x] 1.2 Add create-time CSV validation/preflight response that returns an import summary without creating plans or case records.
- [x] 1.3 Update final create-with-import behavior to reject any non-empty row-level data errors and roll back all plan/case persistence on failure.
- [x] 1.4 Keep valid create behavior for comparison and manual plans, including duplicate/skipped row summary semantics and `CSV_NO_VALID_ROWS` handling.
- [x] 1.5 Add backend tests covering invalid mixed CSV creation, no persistence before final create, corrected re-upload behavior, and trailing empty row cleanup.

## 2. Admin Create Plan Flow

- [x] 2.1 Update admin plan API wrappers and mock APIs for CSV validation/preflight and final create submission.
- [x] 2.2 Store the selected CSV file and validation summary in the create workflow without creating a plan during upload.
- [x] 2.3 Disable `创建计划` when validation has row-level errors, while allowing re-upload to replace the invalid summary.
- [x] 2.4 Submit the stored file only when the admin clicks `创建计划`, then return to the list and refresh plans after success.
- [x] 2.5 Add frontend contract tests for disabled create on failed validation and no create API call before final confirmation.

## 3. Operator Experience Fixes

- [x] 3.1 Add manual workbench unsaved-entry state detection for entries created before full record submission.
- [x] 3.2 Intercept `返回列表` with a `ModalDialog` confirmation using `未提交此病历质控，返回列表将不会保存已标注的条目`, `仍要返回`, and `取消`.
- [x] 3.3 Register browser `beforeunload` protection only while unsaved manual entries exist and clear it after successful submission.
- [x] 3.4 Format operator plan list `updated_at` values with `Asia/Shanghai` timezone and retain `-` for missing values.
- [x] 3.5 Add frontend tests or contract checks for the return confirmation and Beijing-time rendering.

## 4. Admin Annotation Detail Navigation

- [x] 4.1 Move plan detail active tab, annotation filters, page, and page size into URL query state.
- [x] 4.2 Open manual annotation details with a return target that preserves the originating `标注明细` state.
- [x] 4.3 Update `返回明细` and breadcrumb plan-detail links to restore the preserved annotations tab state.
- [x] 4.4 Ensure direct `/admin/plans/{plan_id}` navigation still defaults to `统计概览`.
- [x] 4.5 Add frontend tests for returning from detail after pagination/filter changes.

## 5. Login Feedback Typography

- [x] 5.1 Update login loading and invalid-credential feedback rendering so message text is normal weight per `design/pages/oauth-login.pen`.
- [x] 5.2 Verify the change is scoped to the login feedback messages and does not regress shared Alert usage.

## 6. Verification

- [x] 6.1 Run backend tests for admin plan creation/import and operator APIs.
- [x] 6.2 Run frontend contract tests and TypeScript/build checks.
- [x] 6.3 Smoke test the admin create flow, manual workbench leave guard, operator plan list, and admin detail return flow in the browser.
