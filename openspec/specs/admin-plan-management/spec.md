## Purpose

Define the admin plan management lifecycle, including creation with imported data, listing, detail viewing, metadata editing, and `active`/`closed` status behavior.

## Requirements

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
- **WHEN** the client calls `GET /api/admin/plans` with optional `status`, `owner_user_id`, `annotation_type`, `page`, and `page_size`
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

### Requirement: Admin Can Update Plan and Toggle Status
The system MUST allow admin users to update plan fields and SHALL support the two plan statuses `active` and `closed`. Admins MAY toggle status between `active` and `closed`.

#### Scenario: Admin updates basic fields
- **GIVEN** an authenticated admin and an existing plan
- **WHEN** the client calls `PATCH /api/admin/plans/{plan_id}` with `name`, `description`, and/or `owner_user_id`
- **THEN** the API returns `200` with updated plan object

#### Scenario: Valid status toggle
- **GIVEN** an existing plan currently in `active` or `closed`
- **WHEN** admin sets status to the other supported value (`active -> closed` or `closed -> active`)
- **THEN** the API returns `200` and persists the new status

#### Scenario: Invalid status value
- **GIVEN** an existing plan
- **WHEN** admin calls `PATCH /api/admin/plans/{plan_id}` with any status other than `active` or `closed`
- **THEN** the API returns validation or conflict error semantics and does not persist the invalid status

### Requirement: Closed Plan Editing and Execution Boundary
The system SHALL allow admin to edit `name` and `description` after plan is `closed`, and MUST keep execution closed by rejecting new imports and preventing operators from viewing or operating plan tasks.

#### Scenario: Edit metadata on closed plan
- **GIVEN** an authenticated admin and a plan in `closed`
- **WHEN** admin updates only `name` and/or `description`
- **THEN** the API accepts the change and returns updated plan

#### Scenario: Closed plan blocks operational writes
- **GIVEN** a plan in `closed`
- **WHEN** clients attempt CSV import, operator task access, or annotation submission under that plan
- **THEN** the API rejects task access and write operations according to module-specific conflict errors

### Requirement: Plan Annotation Type Is Immutable
The system MUST persist each plan's annotation type at creation time and SHALL NOT allow changing `annotation_type` after the plan is created.

#### Scenario: Admin attempts to change annotation type
- **GIVEN** an authenticated admin and an existing plan
- **WHEN** admin calls `PATCH /api/admin/plans/{plan_id}` with `annotation_type`
- **THEN** the API rejects the change with validation or conflict semantics
- **AND** the plan's persisted annotation type remains unchanged
