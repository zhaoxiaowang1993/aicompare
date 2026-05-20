## Context

The current admin creation workflow calls the create-with-import API as soon as a CSV file is uploaded. The backend creates the plan and persists valid rows even when row-level parse errors are present, while the frontend still enables the final "创建计划" action. CSV parsing also treats fully empty rows from spreadsheet padding as missing-field errors.

The operator manual annotation workbench keeps unsubmitted problem entries only in React state until the full medical record is submitted. Leaving the page currently discards those entries without warning. Admin manual annotation detail pages are separate routes, but the parent plan detail page stores tab, filters, and pagination only in component state; returning from a detail route reloads the default overview tab. The affected UI surfaces are covered by `design/pages/oauth-login.pen`, `design/pages/operator.pen`, and `design/pages/admin-plan-detail.pen`.

## Goals / Non-Goals

**Goals:**

- Make plan creation atomic from the user's point of view: upload validates, final create persists.
- Prevent any plan or case-row persistence when the create-time CSV has row-level data errors.
- Ignore trailing empty CSV rows while preserving row-level errors for meaningful non-empty rows.
- Warn operators before discarding unsubmitted manual annotation entries.
- Render login feedback messages and operator timestamps according to design and local timezone expectations.
- Preserve admin annotation list state across detail drill-in and return.

**Non-Goals:**

- Changing the persisted database schema.
- Adding draft plans or server-side temporary upload storage.
- Changing existing completed annotation data semantics.
- Reworking comparison annotation modal draft persistence beyond the requested manual entry guard.
- Changing the visual design of the affected pages beyond the requested text weight, confirmation, and navigation behavior.

## Decisions

1. Add a non-persistent create-time CSV validation path instead of creating a draft plan on upload.
   - The frontend upload step will call a validation/preflight API with plan metadata and the CSV file.
   - The API will parse and validate using the same rules as final creation but will not add a plan or case records to the database.
   - The selected file remains in browser state for the final "创建计划" click; the final call revalidates and persists in one transaction.
   - Alternative considered: create a draft plan on upload and delete it if final creation is cancelled. That would require cleanup semantics and still risks exposing unintended plan records.

2. Treat create-time row errors as blocking while keeping duplicate/skipped rows visible in import summaries.
   - Missing required fields in non-empty rows are data errors and block creation.
   - Duplicate hospitalization numbers remain reported as skipped rows, but a create-time upload with zero importable rows is rejected.
   - Existing plan imports can continue returning mixed summaries unless explicitly tightened later.
   - Alternative considered: silently discard bad rows. That conflicts with the requirement that bad CSV data must not support creation.

3. Skip trailing empty rows at parse time.
   - A row is empty when every expected column value is blank after BOM removal and whitespace trimming.
   - Empty rows at the end of the file are ignored and excluded from totals/errors.
   - Non-empty rows with missing required values remain errors.
   - Alternative considered: frontend-only CSV cleanup before upload. Backend cleanup is required so API callers share the same contract.

4. Use in-app confirmation for route navigation and browser-native `beforeunload` for tab/window closing.
   - The manual workbench will consider `entries.length > 0` and not submitting/submitted as unsaved.
   - Clicking "返回列表" opens the existing `ModalDialog` dialog with "仍要返回" and "取消".
   - Browser close/reload registers a `beforeunload` handler only while unsaved entries exist.
   - Alternative considered: persist local drafts. Draft persistence is larger than the requested warning behavior.

5. Store admin detail list state in URL query state.
   - The plan detail page will read/write active tab, annotation filters, page, and page size from the URL.
   - Manual detail links will carry a return target, and "返回明细" will navigate back to that target.
   - Alternative considered: pass `location.state` only. Query state is more robust across refresh and direct links.

6. Keep visual tweaks scoped to existing components and CSS variables.
   - Login feedback typography will be fixed using existing Alert/message slot styling and `design/pages/oauth-login.pen` as the visual reference.
   - Operator timestamps will use `Intl.DateTimeFormat` with `Asia/Shanghai`.

## Risks / Trade-offs

- [Risk] Upload validation and final creation could diverge if they use separate code paths. -> Mitigation: share backend parsing/summary helpers and revalidate on final create.
- [Risk] Keeping the selected file only in browser memory means refresh loses the validated upload. -> Mitigation: this matches the current non-draft flow; the UI will require re-upload after refresh.
- [Risk] Query-string state can become verbose. -> Mitigation: keep only the active tab and annotation list controls needed to restore the user's visible state.
- [Risk] Browser `beforeunload` custom text is ignored by modern browsers. -> Mitigation: rely on native generic prompt for close/reload and use exact custom text only in the in-app confirmation.
