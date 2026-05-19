## MODIFIED Requirements

### Requirement: Plan-level Progress Statistics
The system MUST provide plan-level aggregate metrics for admin users, including total, annotated/completed, pending, and completion rate. For `comparison` plans, annotated count SHALL use comparison annotation records. For `manual` plans, completed count SHALL use manual case completion records, including both `has_issues` and `no_issue`.

#### Scenario: Read comparison plan stats
- **GIVEN** an authenticated admin and an existing `comparison` plan
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/stats`
- **THEN** the API returns `total_cases`, `annotated_cases`, `pending_cases`, and `completion_rate`
- **AND** `annotated_cases` counts distinct cases with comparison annotation records

#### Scenario: Read manual plan stats
- **GIVEN** an authenticated admin and an existing `manual` plan
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/stats`
- **THEN** the API returns `total_cases`, `annotated_cases`, `pending_cases`, and `completion_rate`
- **AND** `annotated_cases` counts distinct cases with manual completion records
- **AND** both `has_issues` and `no_issue` manual completions count as annotated cases

### Requirement: Decision and Reason Distributions
The system SHALL provide decision and reason distributions using fixed enum/domain definitions from annotation data for `comparison` plans. The system SHALL NOT require decision, reason, problem type, or rule distributions for `manual` plans in the first manual-mode release.

#### Scenario: Comparison decision distribution is returned with fixed keys
- **GIVEN** a `comparison` plan with submitted annotations
- **WHEN** admin requests plan stats
- **THEN** response includes counts for `A_BETTER`, `B_BETTER`, `BOTH_BAD`, and `BOTH_GOOD`

#### Scenario: Comparison reason distribution uses fixed reason codes
- **GIVEN** a `comparison` plan with submitted annotations containing reason codes
- **WHEN** admin requests plan stats
- **THEN** response includes reason distribution for `NO_HIT_ERROR_RULE`, `NO_MISSING_RULE`, `NO_OVER_QC`, and `OTHER`

#### Scenario: Manual stats omit comparison distributions
- **GIVEN** a `manual` plan with submitted manual completions
- **WHEN** admin requests plan stats
- **THEN** response does not require A/B decision distribution or comparison reason distribution
- **AND** response does not require problem type completion, rule distribution, or issue-category dashboard data

### Requirement: Annotation Detail Query With Filters
The system MUST provide paginated annotation detail query and SHALL support filters according to plan annotation type. `comparison` details SHALL support filters by operator, decision, and date range. `manual` details SHALL support filters by operator and annotation date range.

#### Scenario: Query comparison details with combined filters
- **GIVEN** an authenticated admin and existing comparison plan annotations
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/annotations` with `operator_user_id`, `decision`, `start_date`, `end_date`, `page`, and `page_size`
- **THEN** the API returns filtered paginated comparison detail records and total count

#### Scenario: Query manual completion summaries by operator and date range
- **GIVEN** an authenticated admin and existing manual plan completions
- **WHEN** the client calls `GET /api/admin/plans/{plan_id}/annotations` with `operator_user_id`, `start_date`, `end_date`, `page`, and `page_size`
- **THEN** the API returns filtered paginated manual completion summary records and total count
- **AND** each manual summary record represents one completed hospitalization/case under the plan
- **AND** filtering by `start_date` and `end_date` uses the case completion submission time

#### Scenario: Manual completion summary with multiple problem entries
- **GIVEN** a manual completion with `result=has_issues` and one or more problem entries
- **WHEN** admin queries annotation details
- **THEN** the annotation detail list returns exactly one visible row for that completed case
- **AND** the row includes hospitalization number, operator, result, problem entry count, and case completion submission time
- **AND** the case completion submission time is the time when the full manual case annotation was submitted, not the creation time of an individual problem entry
- **AND** the row includes an identifier or action target for viewing the completed case detail
- **AND** the annotation detail list does not display source text, selected quality rule, correction suggestion, notes, start offset, or end offset values

#### Scenario: Manual completion summary with no issue result
- **GIVEN** a manual completion with `result=no_issue`
- **WHEN** admin queries annotation details
- **THEN** the response includes a visible completion detail row for that case
- **AND** the row indicates `result=no_issue`
- **AND** the row indicates problem entry count `0`
- **AND** the annotation detail list does not display source text, selected quality rule, correction suggestion, notes, start offset, or end offset values

### Requirement: Manual Annotation Completion Detail Views
The system MUST provide manual completion detail data so admin users can inspect each completed manual case in read-only mode. The default admin detail presentation SHALL be a workbench view, and the admin SHALL be able to switch to a list view.

#### Scenario: Open manual completion detail in read-only workbench view
- **GIVEN** an authenticated admin and a manual completion with one or more problem entries
- **WHEN** the admin opens the completion detail from the manual annotation detail list
- **THEN** the default view is a read-only workbench view
- **AND** the left side displays the full medical record text
- **AND** each problem entry source span is highlighted in yellow using saved `start_offset` and `end_offset`
- **AND** the right side displays read-only annotation cards containing the selected quality rule snapshot, correction suggestion, and notes when present
- **AND** annotation cards are vertically aligned with their corresponding highlighted source spans when possible
- **AND** when source spans are too close and cards would overlap, cards are displayed in non-overlapping order with earlier source positions above later source positions
- **AND** the view does not provide create, edit, delete, or submit controls

#### Scenario: Switch manual completion detail to list view
- **GIVEN** an authenticated admin is viewing a manual completion detail
- **WHEN** the admin switches to the list view tab
- **THEN** the list displays one row per problem entry
- **AND** the list columns are source text, selected quality rule snapshot, correction suggestion, and annotation time
- **AND** annotation time is the creation time of that problem entry card
- **AND** the list view does not display start offset or end offset values
- **AND** search and filter controls are not required in the first manual-mode release

#### Scenario: Open no issue manual completion detail
- **GIVEN** an authenticated admin and a manual completion with `result=no_issue`
- **WHEN** the admin opens the completion detail
- **THEN** the workbench view displays the medical record text without problem highlights or annotation cards
- **AND** the list view displays an empty state for problem entries

### Requirement: Local Timezone Semantics for Date Filtering
The system SHALL interpret `start_date` and `end_date` using local timezone `Asia/Shanghai` for filtering annotations and manual completions.

#### Scenario: Date boundary filtering in local timezone
- **GIVEN** annotations or manual completions created around local day boundaries
- **WHEN** admin filters by `start_date` and `end_date`
- **THEN** inclusion/exclusion is computed by `Asia/Shanghai` calendar boundaries

### Requirement: Statistics-Detail Consistency
The system MUST keep statistics and detail results consistent for the same filter scope so aggregates can be recomputed from details at the same query time.

#### Scenario: Recompute comparison aggregates from detail set
- **GIVEN** a fixed query scope and stable comparison dataset at query time
- **WHEN** admin compares stats endpoint results with detail endpoint recomputation
- **THEN** totals and distribution counts are consistent

#### Scenario: Recompute manual progress from detail set
- **GIVEN** a fixed query scope and stable manual dataset at query time
- **WHEN** admin compares manual stats endpoint results with manual completion summary records
- **THEN** total, completed, pending, and completion rate counts are consistent
