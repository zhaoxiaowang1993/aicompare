## ADDED Requirements

### Requirement: Create-Time CSV Validation Blocks Row Errors
The system MUST treat create-time CSV validation as an all-or-nothing gate for both `comparison` and `manual` plan creation. Any non-empty row-level data error SHALL block creation and SHALL prevent persistence of the plan and all rows from that CSV.

#### Scenario: Comparison create validation blocks missing agent output
- **GIVEN** an authenticated admin is creating a `comparison` plan
- **AND** the CSV includes a non-empty row missing `智能体A输出` or `智能体B输出`
- **WHEN** the client validates the CSV or submits final creation
- **THEN** the system reports the row-level error
- **AND** `创建计划` remains disabled after validation
- **AND** no plan or case rows from the CSV are persisted

#### Scenario: Manual create validation blocks missing record text
- **GIVEN** an authenticated admin is creating a `manual` plan
- **AND** the CSV includes a non-empty row missing `住院号` or `病历内容`
- **WHEN** the client validates the CSV or submits final creation
- **THEN** the system reports the row-level error
- **AND** `创建计划` remains disabled after validation
- **AND** no plan or case rows from the CSV are persisted

#### Scenario: Corrected re-upload enables creation
- **GIVEN** the previous create-time CSV validation returned row-level errors
- **WHEN** the admin uploads a corrected CSV with at least one importable row and no row-level data errors
- **THEN** validation returns a clean import summary
- **AND** the client enables `创建计划`

### Requirement: Trailing Empty CSV Rows Are Ignored
The system MUST ignore trailing CSV rows that contain no data in any expected column after trimming whitespace and BOM characters. Ignored trailing empty rows SHALL NOT count toward total rows and SHALL NOT be reported as row-level errors.

#### Scenario: Comparison csv has trailing empty rows
- **GIVEN** a `comparison` CSV has valid headers, valid data rows, and one or more empty rows at the end
- **WHEN** the CSV is validated or imported
- **THEN** the empty trailing rows are ignored
- **AND** the import summary total reflects only meaningful rows
- **AND** no missing-field errors are reported for the ignored rows

#### Scenario: Manual csv has trailing empty rows
- **GIVEN** a `manual` CSV has valid headers, valid data rows, and one or more empty rows at the end
- **WHEN** the CSV is validated or imported
- **THEN** the empty trailing rows are ignored
- **AND** the import summary total reflects only meaningful rows
- **AND** no missing-field errors are reported for the ignored rows

#### Scenario: Non-empty row with missing required data remains invalid
- **GIVEN** a CSV row contains data in at least one expected column
- **AND** one or more required columns for the selected annotation type are empty
- **WHEN** the CSV is validated or imported
- **THEN** the row is not treated as an ignorable empty row
- **AND** the system reports the appropriate row-level data error
