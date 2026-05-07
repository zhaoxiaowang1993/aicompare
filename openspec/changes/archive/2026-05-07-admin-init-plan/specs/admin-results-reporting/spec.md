## ADDED Requirements

### Requirement: Plan-level Progress Statistics
The system MUST provide plan-level aggregate metrics for admin users, including total, annotated, pending, and completion rate.

#### Scenario: Read plan stats
- **GIVEN** an authenticated admin and an existing plan
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/stats`
- **THEN** the API returns `total_cases`, `annotated_cases`, `pending_cases`, and `completion_rate`

### Requirement: Decision and Reason Distributions
The system SHALL provide decision and reason distributions using fixed enum/domain definitions from annotation data.

#### Scenario: Decision distribution is returned with fixed keys
- **GIVEN** a plan with submitted annotations
- **WHEN** admin requests plan stats
- **THEN** response includes counts for `A_BETTER`, `B_BETTER`, `BOTH_BAD`, and `BOTH_GOOD`

#### Scenario: Reason distribution uses fixed reason codes
- **GIVEN** a plan with submitted annotations containing reason codes
- **WHEN** admin requests plan stats
- **THEN** response includes reason distribution for `NO_HIT_ERROR_RULE`, `NO_MISSING_RULE`, `NO_OVER_QC`, and `OTHER`

### Requirement: Annotation Detail Query With Filters
The system MUST provide paginated annotation detail query and SHALL support filters by operator, decision, and date range.

#### Scenario: Query details with combined filters
- **GIVEN** an authenticated admin and existing plan annotations
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/annotations` with `operator_user_id`, `decision`, `start_date`, `end_date`, `page`, and `page_size`
- **THEN** the API returns filtered paginated detail records and total count

### Requirement: Local Timezone Semantics for Date Filtering
The system SHALL interpret `start_date` and `end_date` using local timezone `Asia/Shanghai` for filtering annotations.

#### Scenario: Date boundary filtering in local timezone
- **GIVEN** annotations created around local day boundaries
- **WHEN** admin filters by `start_date` and `end_date`
- **THEN** inclusion/exclusion is computed by `Asia/Shanghai` calendar boundaries

### Requirement: Statistics-Detail Consistency
The system MUST keep statistics and detail results consistent for the same filter scope so aggregates can be recomputed from details at the same query time.

#### Scenario: Recompute aggregates from detail set
- **GIVEN** a fixed query scope and stable dataset at query time
- **WHEN** admin compares stats endpoint results with detail endpoint recomputation
- **THEN** totals and distribution counts are consistent
