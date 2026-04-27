## ADDED Requirements

### Requirement: CSV File Type and Template Validation
The system MUST accept only `.csv` uploads and SHALL validate the fixed 4-column template: `住院号`、`病历内容`、`智能体A输出`、`智能体B输出`.

#### Scenario: Upload valid csv template
- **GIVEN** an authenticated admin and a valid CSV file with required headers
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API starts import processing and returns import summary payload

#### Scenario: Reject non-csv or unparseable file
- **GIVEN** uploaded file is not `.csv`, empty, or cannot be parsed
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API returns `400 CSV_INVALID_TEMPLATE` or `400 CSV_PARSE_ERROR`

### Requirement: Data Cleaning and Persistence
The system MUST clean imported text fields before persistence and SHALL store only cleaned content in case records.

#### Scenario: Persist cleaned row content
- **GIVEN** a valid source row passes template and row-level validation
- **WHEN** the row is imported
- **THEN** `record_text`, `agent_a_output`, and `agent_b_output` are stored as cleaned values in `CaseRecord`

### Requirement: Intra-plan Deduplication by Hospitalization Number
The system SHALL deduplicate by `(plan_id, hospitalization_no)` and MUST skip duplicate rows in the same plan while recording skipped count.

#### Scenario: Duplicate hospitalization number in same plan
- **GIVEN** the target plan already contains a case with the same `hospitalization_no`
- **WHEN** the duplicate row is processed during import
- **THEN** the row is skipped and contributes to `skipped_rows`

### Requirement: Stable A/B Display Mapping
The system MUST generate and persist A/B display mapping for each successfully imported case and SHALL keep mapping stable across repeated reads.

#### Scenario: Mapping stays unchanged after refresh
- **GIVEN** a case was imported successfully with generated `display_a_source` and `display_b_source`
- **WHEN** the same case is fetched multiple times for display
- **THEN** A/B mapping remains identical and does not reshuffle

### Requirement: Import Summary and Error Reporting
The system SHALL return import result summary including totals and row-level error reasons, and MUST not enforce a fixed upper limit on returned `errors` entries in this phase.

#### Scenario: Import returns complete summary
- **GIVEN** a mixed-quality CSV with successful, skipped, and failed rows
- **WHEN** import finishes
- **THEN** response includes `total_rows`, `success_rows`, `skipped_rows`, `failed_rows`, `import_batch_id`, and error detail list

### Requirement: Plan State Guard for Import
The system MUST reject CSV import for non-existent plans and closed plans.

#### Scenario: Import to closed plan is rejected
- **GIVEN** an authenticated admin and a target plan in `closed`
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API returns `409 PLAN_CLOSED`

#### Scenario: Import to missing plan is rejected
- **GIVEN** `plan_id` does not exist
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API returns `404 PLAN_NOT_FOUND`
