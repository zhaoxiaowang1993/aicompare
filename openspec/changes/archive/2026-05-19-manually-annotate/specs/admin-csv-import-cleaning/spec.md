## MODIFIED Requirements

### Requirement: CSV File Type and Template Validation
The system MUST accept only `.csv` uploads and SHALL validate the CSV template according to the target plan annotation type. `comparison` plans MUST use the fixed 4-column template: `住院号`、`病历内容`、`智能体A输出`、`智能体B输出`. `manual` plans MUST use the fixed 2-column template: `住院号`、`病历内容`.

#### Scenario: Upload valid comparison csv template
- **GIVEN** an authenticated admin, a `comparison` plan, and a valid CSV file with comparison required headers
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API starts import processing and returns import summary payload

#### Scenario: Upload valid manual csv template
- **GIVEN** an authenticated admin, a `manual` plan, and a valid CSV file with manual required headers
- **WHEN** the client calls `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API starts import processing and returns import summary payload

#### Scenario: Create comparison plan with valid csv template
- **GIVEN** an authenticated admin, valid plan basic fields, an active operator owner, `annotation_type=comparison`, and a valid comparison CSV file with required headers
- **WHEN** the client calls `POST /api/admin/plans/import-csv`
- **THEN** the API creates an `active` comparison plan, imports valid rows, and returns created plan data plus import summary payload

#### Scenario: Create manual plan with valid csv template
- **GIVEN** an authenticated admin, valid plan basic fields, an active operator owner, `annotation_type=manual`, and a valid manual CSV file with required headers
- **WHEN** the client calls `POST /api/admin/plans/import-csv`
- **THEN** the API creates an `active` manual plan, imports valid rows, and returns created plan data plus import summary payload

#### Scenario: Reject template that does not match annotation type
- **GIVEN** the uploaded CSV headers do not match the selected or target plan annotation type
- **WHEN** the client calls `POST /api/admin/plans/import-csv` or `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API returns `400 CSV_INVALID_TEMPLATE`

#### Scenario: Reject non-csv or unparseable file
- **GIVEN** uploaded file is not `.csv`, empty, or cannot be parsed
- **WHEN** the client calls `POST /api/admin/plans/import-csv` or `POST /api/admin/plans/{plan_id}/import-csv`
- **THEN** the API returns `400 CSV_INVALID_TEMPLATE` or `400 CSV_PARSE_ERROR`

### Requirement: Data Cleaning and Persistence
The system MUST clean imported text fields before persistence and SHALL store only cleaned content in case records according to plan annotation type.

#### Scenario: Persist cleaned comparison row content
- **GIVEN** a valid comparison source row passes template and row-level validation
- **WHEN** the row is imported
- **THEN** `record_text`, `agent_a_output`, and `agent_b_output` are stored as cleaned values in `CaseRecord`

#### Scenario: Persist cleaned manual row content
- **GIVEN** a valid manual source row passes template and row-level validation
- **WHEN** the row is imported
- **THEN** `record_text` is stored as a cleaned value in `CaseRecord`
- **AND** AI output fields are not required for the manual case

### Requirement: Stable A/B Display Mapping
The system MUST generate and persist A/B display mapping for each successfully imported `comparison` case and SHALL keep mapping stable across repeated reads. The system MUST NOT require or generate A/B display mapping for `manual` cases.

#### Scenario: Mapping stays unchanged after refresh
- **GIVEN** a comparison case was imported successfully with generated `display_a_source` and `display_b_source`
- **WHEN** the same case is fetched multiple times for display
- **THEN** A/B mapping remains identical and does not reshuffle

#### Scenario: Manual import does not generate mapping
- **GIVEN** a manual case was imported successfully
- **WHEN** the same case is fetched for a manual task
- **THEN** the task payload does not include output A, output B, or A/B display mapping
