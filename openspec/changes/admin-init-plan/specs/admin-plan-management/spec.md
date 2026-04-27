## ADDED Requirements

### Requirement: Admin Can Create Plan With Valid Owner
The system MUST allow admin users to create plans and SHALL require non-empty plan name and one valid active operator owner.

#### Scenario: Admin creates plan successfully
- **GIVEN** an authenticated admin and an active operator user id
- **WHEN** the client calls `POST /api/admin/plans` with `name`, optional `description`, and `owner_user_id`
- **THEN** the API returns `201` with created plan data and initial status `draft`

#### Scenario: Create fails with invalid owner
- **GIVEN** `owner_user_id` does not exist, is inactive, or is not an operator
- **WHEN** the client calls `POST /api/admin/plans`
- **THEN** the API returns `400 VALIDATION_ERROR`

### Requirement: Admin Can List and View Plan Details
The system SHALL provide plan list and plan detail endpoints for admin users, including progress metrics needed by list and detail pages.

#### Scenario: Query plan list with filters
- **GIVEN** an authenticated admin user
- **WHEN** the client calls `GET /api/admin/plans` with optional `status`, `owner_user_id`, `page`, and `page_size`
- **THEN** the API returns paginated items with plan basic fields and progress counters (`total_cases`, `annotated_cases`)

#### Scenario: Open plan detail from list
- **GIVEN** an authenticated admin user and an existing plan id
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}`
- **THEN** the API returns `200` with plan detail required by `/admin/plans/:id` page

#### Scenario: Plan detail not found
- **GIVEN** the plan id does not exist
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}`
- **THEN** the API returns `404 PLAN_NOT_FOUND`

### Requirement: Admin Can Update Plan and Status
The system MUST allow admin users to update plan fields and SHALL enforce plan status transition constraints with conflict response when invalid.

#### Scenario: Admin updates basic fields
- **GIVEN** an authenticated admin and an existing plan
- **WHEN** the client calls `PATCH /api/admin/plans/{plan_id}` with `name`, `description`, and/or `owner_user_id`
- **THEN** the API returns `200` with updated plan object

#### Scenario: Valid status transition
- **GIVEN** an existing plan currently in `draft` or `active`
- **WHEN** admin sets status forward (`draft -> active` or `active -> closed`)
- **THEN** the API returns `200` and persists the new status

#### Scenario: Invalid status transition
- **GIVEN** an existing plan status cannot transition to requested target
- **WHEN** admin calls `PATCH /api/admin/plans/{plan_id}` with invalid status change
- **THEN** the API returns `409 PLAN_STATUS_CONFLICT`

### Requirement: Closed Plan Editing and Execution Boundary
The system SHALL allow admin to edit `name` and `description` after plan is `closed`, and MUST keep execution closed by rejecting new imports and operator annotations.

#### Scenario: Edit metadata on closed plan
- **GIVEN** an authenticated admin and a plan in `closed`
- **WHEN** admin updates only `name` and/or `description`
- **THEN** the API accepts the change and returns updated plan

#### Scenario: Closed plan blocks operational writes
- **GIVEN** a plan in `closed`
- **WHEN** clients attempt CSV import or annotation submission under that plan
- **THEN** the API rejects write operations according to module-specific conflict errors
