from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator

from app.models.entities import ManualAnnotationResult, PlanAnnotationType


class AnnotationDecision(str, Enum):
    A_BETTER = "A_BETTER"
    B_BETTER = "B_BETTER"
    BOTH_BAD = "BOTH_BAD"
    BOTH_GOOD = "BOTH_GOOD"


class AnnotationReason(str, Enum):
    NO_HIT_ERROR_RULE = "NO_HIT_ERROR_RULE"
    NO_MISSING_RULE = "NO_MISSING_RULE"
    NO_OVER_QC = "NO_OVER_QC"
    OTHER = "OTHER"


class OperatorPlanSummary(BaseModel):
    id: int
    name: str
    description: str | None = None
    annotation_type: PlanAnnotationType = PlanAnnotationType.COMPARISON
    status: str
    total_cases: int
    annotated_cases: int
    pending_cases: int
    completion_rate: float
    updated_at: datetime | None = None


class OperatorPlanListResponse(BaseModel):
    items: list[OperatorPlanSummary]
    total: int
    page: int
    page_size: int


class OperatorQualityRule(BaseModel):
    id: int
    category: str
    content: str
    score: str


class OperatorDisplayMapping(BaseModel):
    A: str
    B: str


class OperatorTaskPayload(BaseModel):
    case_id: int
    plan_id: int
    annotation_type: PlanAnnotationType = PlanAnnotationType.COMPARISON
    hospitalization_no: str
    record_text: str
    output_a: str | None = None
    output_b: str | None = None
    display_mapping: OperatorDisplayMapping | None = None
    quality_rules: list[OperatorQualityRule]


class AnnotationSubmitRequest(BaseModel):
    decision: AnnotationDecision
    reason_codes: list[AnnotationReason] = Field(min_length=1)
    other_reason_text: str | None = None
    notes: str | None = None

    @field_validator("other_reason_text", "notes")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AnnotationCreatedResponse(BaseModel):
    annotation_id: int
    case_id: int
    plan_id: int
    operator_user_id: int
    decision: AnnotationDecision
    reason_codes: list[AnnotationReason]
    other_reason_text: str | None = None
    notes: str | None = None
    created_at: datetime


class ManualAnnotationEntrySubmit(BaseModel):
    source_text: str = Field(min_length=1)
    start_offset: int = Field(ge=0)
    end_offset: int = Field(gt=0)
    quality_rule_id: int
    quality_rule_title: str | None = None
    quality_rule_content: str | None = None
    quality_rule_score: str | None = None
    suggestion: str = Field(min_length=1)
    notes: str | None = None

    @field_validator("source_text", "suggestion", "notes", "quality_rule_title", "quality_rule_content", "quality_rule_score")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.replace("\r\n", "\n").replace("\r", "\n").strip()
        return normalized or None


class ManualAnnotationSubmitRequest(BaseModel):
    result: ManualAnnotationResult
    entries: list[ManualAnnotationEntrySubmit] = Field(default_factory=list)


class ManualAnnotationCreatedResponse(BaseModel):
    manual_annotation_id: int
    case_id: int
    plan_id: int
    operator_user_id: int
    result: ManualAnnotationResult
    entry_count: int
    created_at: datetime
