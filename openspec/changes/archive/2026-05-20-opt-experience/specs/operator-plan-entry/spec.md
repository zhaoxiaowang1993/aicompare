## ADDED Requirements

### Requirement: Operator Plan Updated Time Uses Beijing Time
The operator plan entry page SHALL render each plan's latest update time in local Beijing time (`Asia/Shanghai`) so operators see the same calendar time used by the product workflow.

#### Scenario: Display updated time in Beijing timezone
- **GIVEN** the operator plan list API returns a plan `updated_at` timestamp with UTC or ISO timezone semantics
- **WHEN** the operator views `/operator/plans`
- **THEN** the plan card displays `更新于` using `Asia/Shanghai` timezone
- **AND** the displayed value is not the raw UTC clock time

#### Scenario: Missing updated time
- **GIVEN** the operator plan list API returns a plan without `updated_at`
- **WHEN** the operator views `/operator/plans`
- **THEN** the plan card displays `更新于 -`
