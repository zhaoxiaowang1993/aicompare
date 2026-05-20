## MODIFIED Requirements

### Requirement: Admin Can Create Plan With Valid Owner And Data
The system MUST treat plan creation as successful only after admin submits non-empty plan name, one valid active operator owner, a supported annotation type, and a CSV import file matching that annotation type with at least one importable row and no row-level data errors. The system SHALL NOT create standalone plans without imported data, and SHALL NOT persist a plan or case records before the admin explicitly confirms creation. When `annotation_type` is omitted for compatibility, the system SHALL treat the plan as `comparison`.

#### Scenario: Admin creates comparison plan successfully with imported data
- **GIVEN** an authenticated admin, an active operator user id, `annotation_type=comparison`, and a valid comparison CSV file with at least one importable row and no row-level data errors
- **WHEN** the client submits the final create request with `name`, optional `description`, `owner_user_id`, `annotation_type`, and `file`
- **THEN** the API returns `201` with created plan data, `annotation_type=comparison`, initial status `active`, and import summary payload
- **AND** the plan and imported case records are persisted only as part of that final create request

#### Scenario: Admin creates manual plan successfully with imported data
- **GIVEN** an authenticated admin, an active operator user id, `annotation_type=manual`, and a valid manual CSV file with at least one importable row and no row-level data errors
- **WHEN** the client submits the final create request with `name`, optional `description`, `owner_user_id`, `annotation_type`, and `file`
- **THEN** the API returns `201` with created plan data, `annotation_type=manual`, initial status `active`, and import summary payload
- **AND** the plan and imported case records are persisted only as part of that final create request

#### Scenario: Upload validation does not create plan
- **GIVEN** an authenticated admin has entered valid plan basic fields and selected a CSV file
- **WHEN** the client validates or uploads the CSV before the admin clicks `创建计划`
- **THEN** the system returns validation feedback without creating a plan
- **AND** no case records from that CSV are persisted

#### Scenario: Create defaults to comparison type
- **GIVEN** an authenticated admin, an active operator user id, and a valid comparison CSV file with at least one importable row and no row-level data errors
- **WHEN** the client submits the final create request without `annotation_type`
- **THEN** the API creates a `comparison` plan and returns `annotation_type=comparison`

#### Scenario: Create fails with invalid annotation type
- **GIVEN** `annotation_type` is not `comparison` or `manual`
- **WHEN** the client submits the final create request
- **THEN** the API returns `400 VALIDATION_ERROR` and no plan is created

#### Scenario: Create fails with invalid owner
- **GIVEN** `owner_user_id` does not exist, is inactive, or is not an operator
- **WHEN** the client submits the final create request
- **THEN** the API returns `400 VALIDATION_ERROR`
- **AND** no plan is created

#### Scenario: Create without import is rejected
- **GIVEN** an authenticated admin and valid plan basic fields
- **WHEN** the client calls `POST /api/admin/plans` without a CSV import file
- **THEN** the API returns `400 PLAN_IMPORT_REQUIRED` and no plan is created

#### Scenario: Create fails when CSV has data errors
- **GIVEN** an authenticated admin, valid plan basic fields, and a CSV file for either `comparison` or `manual` mode
- **AND** at least one non-empty row has missing required data or another row-level data error
- **WHEN** the client validates the CSV or submits the final create request
- **THEN** the response includes row-level error feedback
- **AND** the client disables `创建计划` until a corrected file is uploaded
- **AND** the API does not create a plan or persist any rows from the file
