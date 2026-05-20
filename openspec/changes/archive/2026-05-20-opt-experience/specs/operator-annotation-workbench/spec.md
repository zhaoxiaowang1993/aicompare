## ADDED Requirements

### Requirement: Manual Unsubmitted Entry Leave Protection
The system MUST warn operators before discarding unsubmitted manual annotation entries for the current medical record. The warning SHALL apply after at least one annotation entry has been created and before the full medical record quality-control submission succeeds.

#### Scenario: Returning to list with unsubmitted entries
- **GIVEN** an operator is viewing a `manual` annotation task
- **AND** the operator has created one or more annotation entries
- **AND** the operator has not submitted the full medical record quality-control result
- **WHEN** the operator clicks `返回列表`
- **THEN** the page shows a system feedback Dialog confirmation with the message `未提交此病历质控，返回列表将不会保存已标注的条目`
- **AND** the dialog provides `仍要返回` and `取消` actions

#### Scenario: Confirm return discards local entries
- **GIVEN** the unsaved-entry return confirmation dialog is open
- **WHEN** the operator clicks `仍要返回`
- **THEN** the client navigates back to `/operator/plans`
- **AND** the unsubmitted local annotation entries are not persisted

#### Scenario: Cancel return keeps workbench state
- **GIVEN** the unsaved-entry return confirmation dialog is open
- **WHEN** the operator clicks `取消`
- **THEN** the dialog closes
- **AND** the operator remains on the current annotation task
- **AND** existing local annotation entries remain visible and editable

#### Scenario: Closing browser with unsubmitted entries
- **GIVEN** an operator is viewing a `manual` annotation task
- **AND** the operator has created one or more annotation entries
- **AND** the operator has not submitted the full medical record quality-control result
- **WHEN** the operator closes or reloads the browser tab
- **THEN** the page triggers the browser native unload confirmation
- **AND** the prompt communicates that there are unsaved changes according to browser-supported behavior

#### Scenario: No warning after successful submit
- **GIVEN** an operator successfully submits the full medical record quality-control result
- **WHEN** the page advances to another task, completion state, or plan list
- **THEN** the previous record's annotation entries are no longer considered unsaved
- **AND** no stale leave warning is shown for the submitted record
