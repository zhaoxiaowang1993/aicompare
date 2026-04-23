from datetime import datetime

from pydantic import BaseModel, field_validator

REASON_CODES = {"NO_HIT_ERROR_RULE", "NO_MISSING_RULE", "NO_OVER_QC", "OTHER"}


class SubmitAnnotationRequest(BaseModel):
    decision: str
    reason_codes: list[str]
    other_reason_text: str | None = None
    notes: str | None = None

    @field_validator("reason_codes")
    @classmethod
    def validate_reason_codes(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("reason_codes must not be empty")
        invalid_codes = [code for code in value if code not in REASON_CODES]
        if invalid_codes:
            raise ValueError(f"invalid reason_codes: {invalid_codes}")
        return value


class TaskResponse(BaseModel):
    case_id: int
    plan_id: int
    hospitalization_no: str
    record_text: str
    output_a: str
    output_b: str
    quality_rules: list[dict]
    display_mapping: dict[str, str]


class AnnotationCreatedResponse(BaseModel):
    annotation_id: int
    case_id: int
    operator_user_id: int
    decision: str
    reason_codes: list[str]
    other_reason_text: str | None = None
    notes: str | None = None
    created_at: datetime
