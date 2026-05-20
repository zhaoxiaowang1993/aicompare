## Why

Several current annotation workflows commit data too early, mis-handle edge CSV input, or lose user context during navigation. These issues can create unintended plans, confuse operators reviewing pending work, and make admin review flows feel unreliable.

## What Changes

- Make CSV upload during plan creation a validation step until the admin explicitly clicks "创建计划"; rows MUST NOT be persisted and plans MUST NOT be created before that final action.
- Block plan creation when the uploaded CSV has any row-level data errors in either comparison or manual mode, requiring the admin to upload a corrected file.
- Ignore trailing empty CSV rows that contain no data, so spreadsheet padding is not reported as invalid content.
- Add unsaved-change protection for manual annotation entries before a full medical record is submitted, including an in-app confirmation when returning to the list and a browser unload prompt.
- Align login loading and invalid-credential feedback typography with `design/pages/oauth-login.pen` by keeping those messages normal weight.
- Display operator plan "最近更新时间" in Beijing time.
- Preserve admin annotation-detail tab, pagination, and filter state when opening a detail record and returning to the detail list.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-plan-management`: Plan creation must remain pending until final confirmation after a clean CSV validation result.
- `admin-csv-import-cleaning`: CSV validation must reject creation when any non-empty row has data errors and must ignore trailing empty spreadsheet rows.
- `operator-annotation-workbench`: Manual annotation workbench must warn when leaving with unsubmitted entries.
- `operator-plan-entry`: Operator plan list timestamps must be rendered in Beijing time.
- `admin-results-reporting`: Admin annotation detail navigation must preserve the originating annotations tab and list state.
- `auth-login`: Login loading and error feedback messages must use the design-specified normal font weight.

## Impact

- Frontend admin plan creation flow, upload step state, API wrapper types, and mock admin plan APIs.
- Backend admin CSV import endpoints, CSV parser, import summary semantics, and related tests.
- Operator manual annotation workbench navigation and browser unload handling.
- Operator plan list timestamp formatting.
- Admin plan detail route/query state and manual detail back navigation.
- Login page feedback styling.
