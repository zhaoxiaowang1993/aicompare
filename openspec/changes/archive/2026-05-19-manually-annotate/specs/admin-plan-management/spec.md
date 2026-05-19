## MODIFIED Requirements

### Requirement: Admin Can Create Plan With Valid Owner And Data
The system MUST treat plan creation as successful only after admin submits non-empty plan name, one valid active operator owner, a supported annotation type, and a valid CSV import file matching that annotation type. The system SHALL NOT create standalone plans without imported data. When `annotation_type` is omitted for compatibility, the system SHALL treat the plan as `comparison`.

#### Scenario: Admin creates comparison plan successfully with imported data
- **GIVEN** an authenticated admin, an active operator user id, `annotation_type=comparison`, and a valid comparison CSV file with at least one importable row
- **WHEN** the client calls `POST /api/admin/plans/import-csv` with `name`, optional `description`, `owner_user_id`, `annotation_type`, and `file`
- **THEN** the API returns `201` with created plan data, `annotation_type=comparison`, initial status `active`, and import summary payload

#### Scenario: Admin creates manual plan successfully with imported data
- **GIVEN** an authenticated admin, an active operator user id, `annotation_type=manual`, and a valid manual CSV file with at least one importable row
- **WHEN** the client calls `POST /api/admin/plans/import-csv` with `name`, optional `description`, `owner_user_id`, `annotation_type`, and `file`
- **THEN** the API returns `201` with created plan data, `annotation_type=manual`, initial status `active`, and import summary payload

#### Scenario: Create defaults to comparison type
- **GIVEN** an authenticated admin, an active operator user id, and a valid comparison CSV file with at least one importable row
- **WHEN** the client calls `POST /api/admin/plans/import-csv` without `annotation_type`
- **THEN** the API creates a `comparison` plan and returns `annotation_type=comparison`

#### Scenario: Create fails with invalid annotation type
- **GIVEN** `annotation_type` is not `comparison` or `manual`
- **WHEN** the client calls `POST /api/admin/plans/import-csv`
- **THEN** the API returns `400 VALIDATION_ERROR` and no plan is created

#### Scenario: Create fails with invalid owner
- **GIVEN** `owner_user_id` does not exist, is inactive, or is not an operator
- **WHEN** the client calls `POST /api/admin/plans/import-csv`
- **THEN** the API returns `400 VALIDATION_ERROR`

#### Scenario: Create without import is rejected
- **GIVEN** an authenticated admin and valid plan basic fields
- **WHEN** the client calls `POST /api/admin/plans` without a CSV import file
- **THEN** the API returns `400 PLAN_IMPORT_REQUIRED` and no plan is created

### Requirement: Admin Can List and View Plan Details
The system SHALL provide plan list and plan detail endpoints for admin users, including annotation type and progress metrics needed by list and detail pages.

#### Scenario: Query plan list with filters
- **GIVEN** an authenticated admin user
- **WHEN** the client calls `GET /api/admin/plans` with optional `status`, `owner_user_id`, `page`, and `page_size`
- **THEN** the API returns paginated items with plan basic fields, `annotation_type`, and progress counters (`total_cases`, `annotated_cases`)

#### Scenario: Open plan detail from list
- **GIVEN** an authenticated admin user and an existing plan id
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}`
- **THEN** the API returns `200` with plan detail required by `/admin/plans/:id` page
- **AND** the response includes `annotation_type`

#### Scenario: Plan detail not found
- **GIVEN** the plan id does not exist
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}`
- **THEN** the API returns `404 PLAN_NOT_FOUND`

## ADDED Requirements

### Requirement: Plan Annotation Type Is Immutable
The system MUST persist each plan's annotation type at creation time and SHALL NOT allow changing `annotation_type` after the plan is created.

#### Scenario: Admin attempts to change annotation type
- **GIVEN** an authenticated admin and an existing plan
- **WHEN** admin calls `PATCH /api/admin/plans/{plan_id}` with `annotation_type`
- **THEN** the API rejects the change with validation or conflict semantics
- **AND** the plan's persisted annotation type remains unchanged
