## ADDED Requirements

### Requirement: Annotation Detail Navigation Preserves List State
The admin plan detail experience MUST preserve the annotation detail tab and visible list state when an admin opens a record detail and returns. Preserved state SHALL include the active `标注明细` tab, pagination, and applied filters that existed before opening the record detail.

#### Scenario: Return from manual detail to annotations tab
- **GIVEN** an admin is viewing a manual plan detail on the `标注明细` tab
- **WHEN** the admin opens a row with `查看详情`
- **AND** the admin clicks `返回明细`
- **THEN** the client returns to the same plan detail page with `标注明细` active
- **AND** the page does not switch to `统计概览`

#### Scenario: Return preserves pagination and filters
- **GIVEN** an admin is viewing the `标注明细` tab with filters or a non-default page applied
- **WHEN** the admin opens a row with `查看详情`
- **AND** the admin clicks `返回明细`
- **THEN** the client restores the annotation list page, page size, and applied filters from before opening the detail
- **AND** the visible list state matches the state used to open the detail

#### Scenario: Direct plan detail navigation remains overview by default
- **GIVEN** an admin opens `/admin/plans/{plan_id}` without annotation list state in the URL
- **WHEN** the plan detail page renders
- **THEN** the default active tab remains `统计概览`
