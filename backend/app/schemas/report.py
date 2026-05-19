from datetime import datetime

from pydantic import BaseModel

from app.models.entities import ManualAnnotationResult, PlanAnnotationType


class DistributionItem(BaseModel):
    key: str
    count: int


class PlanStatsResponse(BaseModel):
    plan_id: int
    annotation_type: PlanAnnotationType = PlanAnnotationType.COMPARISON
    total_cases: int
    annotated_cases: int
    pending_cases: int
    completion_rate: float
    decision_distribution: dict[str, int] | None = None
    reason_distribution: list[DistributionItem] | None = None
    has_issues_cases: int | None = None
    no_issue_cases: int | None = None


class AnnotationDetailItem(BaseModel):
    id: int
    case_id: int
    hospitalization_no: str
    operator_user_id: int
    operator_username: str | None = None
    decision: str
    reason_codes: list[str]
    other_reason_text: str | None = None
    notes: str | None = None
    record_text: str
    agent_a_output: str
    agent_b_output: str
    display_a_source: str
    display_b_source: str
    created_at: datetime


class AnnotationListResponse(BaseModel):
    items: list[AnnotationDetailItem]
    total: int
    page: int
    page_size: int


class ManualAnnotationSummaryItem(BaseModel):
    manual_annotation_id: int
    case_id: int
    hospitalization_no: str
    operator_user_id: int
    operator_username: str | None = None
    result: ManualAnnotationResult
    problem_count: int
    submitted_at: datetime


class ManualAnnotationListResponse(BaseModel):
    items: list[ManualAnnotationSummaryItem]
    total: int
    page: int
    page_size: int


class ManualAnnotationEntryDetail(BaseModel):
    entry_id: int
    source_text: str
    start_offset: int
    end_offset: int
    quality_rule: dict[str, int | str]
    suggestion: str
    notes: str | None = None
    created_at: datetime


class ManualAnnotationDetailResponse(BaseModel):
    manual_annotation_id: int
    case_id: int
    hospitalization_no: str
    operator: str
    result: ManualAnnotationResult
    record_text: str
    submitted_at: datetime
    entries: list[ManualAnnotationEntryDetail]
