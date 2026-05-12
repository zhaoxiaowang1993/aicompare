from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.entities import RuleCategory


class RuleBase(BaseModel):
    category: RuleCategory
    content: str = Field(min_length=1)
    score: str = Field(min_length=1, max_length=64)

    @field_validator("content", "score")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("REQUIRED_FIELD_EMPTY")
        return cleaned


class RuleCreateRequest(RuleBase):
    pass


class RulePatchRequest(BaseModel):
    category: RuleCategory | None = None
    content: str | None = None
    score: str | None = Field(default=None, max_length=64)

    @field_validator("content", "score")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("REQUIRED_FIELD_EMPTY")
        return cleaned


class RuleItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: RuleCategory
    content: str
    score: str
    created_by: int | None = None
    created_at: datetime
    updated_at: datetime


class RuleListResponse(BaseModel):
    items: list[RuleItem]
    total: int
    page: int
    page_size: int


class RuleImportRowError(BaseModel):
    row_number: int
    field: str
    reason: str
    raw_value: str | None = None


class RuleImportSummary(BaseModel):
    total_rows: int
    success_rows: int
    failed_rows: int
    errors: list[RuleImportRowError]
