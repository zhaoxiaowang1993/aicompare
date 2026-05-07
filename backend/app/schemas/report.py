from datetime import datetime

from pydantic import BaseModel


class DistributionItem(BaseModel):
    key: str
    count: int


class PlanStatsResponse(BaseModel):
    plan_id: int
    total_cases: int
    annotated_cases: int
    pending_cases: int
    completion_rate: float
    decision_distribution: dict[str, int]
    reason_distribution: list[DistributionItem]


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
