## ADDED Requirements

### Requirement: Admin Can Access Quality Rule Management Page
The system SHALL provide an admin-only quality rule management page at `/admin/rules`. The page MUST use existing UI components from `frontend/src/components/` first, and MUST match `design/pages/admin-rules.pen` during frontend acceptance.

#### Scenario: Admin opens rule management page
- **GIVEN** an authenticated admin user
- **WHEN** the admin navigates to `/admin/rules`
- **THEN** the system SHALL render the quality rule management page with list, filter, create, edit, soft delete, and batch import controls

#### Scenario: Non-admin cannot access rule management page
- **GIVEN** an authenticated operator or unauthenticated user
- **WHEN** the user navigates to `/admin/rules`
- **THEN** the system MUST deny access according to the existing route protection behavior

### Requirement: Rule Data Model Uses Category Content And Text Score
The system MUST store each quality rule with rule category, rule content, text score, created metadata, updated metadata, and soft delete metadata. The system SHALL NOT expose rule code, rule name, rule description, enabled state, disabled state, or version-freeze fields in this capability.

#### Scenario: Create rule with required fields
- **GIVEN** an authenticated admin and valid rule category, rule content, and text score
- **WHEN** the admin submits a create rule request
- **THEN** the system SHALL persist the rule and return the created rule with category, content, score, created time, and updated time

#### Scenario: Reject missing required fields
- **GIVEN** an authenticated admin and a rule payload missing category, content, or score
- **WHEN** the admin submits a create or update rule request
- **THEN** the system MUST reject the request with validation error semantics and MUST NOT persist invalid data

#### Scenario: Reject category outside allowed range
- **GIVEN** an authenticated admin and a rule category outside 入院病历, 首次病程记录, 上级医师查房记录, 日常病程, 出院记录
- **WHEN** the admin submits a create or update rule request
- **THEN** the system MUST reject the request with validation error semantics

### Requirement: Admin Can List Search Filter And Page Rules
The system SHALL provide an admin-only paginated rule list. The list MUST include only non-deleted rules, MUST support fuzzy search by rule content, MUST support filtering by rule category, and MUST NOT search or filter by score.

#### Scenario: List rules with pagination
- **GIVEN** an authenticated admin and existing non-deleted rules
- **WHEN** the admin requests the rule list with page and page size
- **THEN** the system SHALL return paginated non-deleted rules and total count

#### Scenario: Search rules by content
- **GIVEN** existing non-deleted rules with different content values
- **WHEN** the admin searches with a keyword matching part of rule content
- **THEN** the system SHALL return only non-deleted rules whose content matches the keyword

#### Scenario: Filter rules by category
- **GIVEN** existing non-deleted rules across multiple categories
- **WHEN** the admin filters by one rule category
- **THEN** the system SHALL return only non-deleted rules in the selected category

#### Scenario: Score is not searchable
- **GIVEN** existing non-deleted rules with score values
- **WHEN** the admin enters a keyword that only matches score text
- **THEN** the system SHALL NOT match rules by score text

### Requirement: Admin Can Update And Soft Delete Rules
The system MUST allow admins to update category, content, and score for an existing non-deleted rule. The system MUST implement delete as soft delete by setting delete metadata, and soft-deleted rules SHALL be immediately hidden from admin list results.

#### Scenario: Update rule fields
- **GIVEN** an authenticated admin and an existing non-deleted rule
- **WHEN** the admin updates category, content, and/or score
- **THEN** the system SHALL persist the updated values and return the updated rule

#### Scenario: Soft delete rule
- **GIVEN** an authenticated admin and an existing non-deleted rule
- **WHEN** the admin deletes the rule
- **THEN** the system MUST mark the rule as deleted and MUST hide it from subsequent admin list responses

#### Scenario: Deleted rule cannot be updated as active data
- **GIVEN** a soft-deleted rule
- **WHEN** the admin attempts to update that rule through the normal update endpoint
- **THEN** the system MUST reject the operation as not found or no longer available

### Requirement: Admin Can Download CSV Template And Batch Import Rules
The system SHALL provide batch import from CSV through the admin rule management page. The batch import panel MUST include CSV template download and file upload controls in the same flow.

#### Scenario: Download CSV template
- **GIVEN** an authenticated admin on the rule management page
- **WHEN** the admin requests the CSV template
- **THEN** the system SHALL download a CSV template containing headers for rule category, rule content, and score

#### Scenario: Import valid CSV rows
- **GIVEN** an authenticated admin and a CSV file with valid headers and valid rows
- **WHEN** the admin uploads the CSV file through the batch import panel
- **THEN** the system SHALL create rules for valid rows and SHALL return an import summary with total rows, success rows, failed rows, and row-level errors

#### Scenario: Report row errors for missing values
- **GIVEN** a CSV file containing rows missing rule category, rule content, or score
- **WHEN** the admin uploads the CSV file
- **THEN** the system MUST treat those rows as failed items and MUST include row-level error details

#### Scenario: Report row errors for invalid category
- **GIVEN** a CSV file containing a row whose rule category is outside 入院病历, 首次病程记录, 上级医师查房记录, 日常病程, 出院记录
- **WHEN** the admin uploads the CSV file
- **THEN** the system MUST treat that row as a failed item and MUST include row-level error details

#### Scenario: Duplicate rows are allowed
- **GIVEN** a CSV file containing duplicate rule content or duplicate category-content combinations
- **WHEN** the admin uploads the CSV file
- **THEN** the system SHALL import each valid row independently and SHALL NOT reject duplicates

### Requirement: Rule Implementation Replaces Legacy Rule Storage
The system MUST abandon the legacy rule structure based on code, name, description, score number, and active state. The system SHALL clear historical legacy rule data and use the new `quality_rules` storage structure for this capability.

#### Scenario: Legacy rule data is not migrated
- **GIVEN** an environment containing legacy `rules` data
- **WHEN** this change is applied
- **THEN** the system MUST remove or ignore legacy rule data and MUST initialize the new quality rule storage without preserving historical rule records

#### Scenario: No enabled or disabled state exists
- **GIVEN** the admin creates, lists, updates, imports, or deletes rules
- **WHEN** the system processes rule data
- **THEN** the system SHALL NOT require, return, or persist enabled or disabled state fields

### Requirement: Operator Rule Display Is Owned By Operator Capability
The admin rule management capability SHALL provide non-deleted rule data for downstream display. Operator annotation UI behavior and `design/pages/operator.pen` changes SHALL be owned by the operator annotation capability, not by admin rule management.

#### Scenario: Operator annotation reads active rules without owning admin behavior
- **GIVEN** active non-deleted quality rules
- **WHEN** the operator annotation capability needs rule context
- **THEN** it MAY query those active rules without changing admin create, update, import, or soft-delete semantics
