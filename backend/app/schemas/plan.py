from datetime import datetime

from pydantic import BaseModel, Field


class PlanCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None
    owner_user_id: int


class PlanPatchRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    owner_user_id: int | None = None
    status: str | None = None


class PlanItem(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str
    owner_user_id: int
    owner_username: str | None = None
    total_cases: int = 0
    annotated_cases: int = 0


class PlanListResponse(BaseModel):
    items: list[PlanItem]
    total: int
    page: int
    page_size: int


class PlanDetail(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_user_id: int
    owner_username: str | None = None
    status: str
    total_cases: int = 0
    annotated_cases: int = 0
    pending_cases: int = 0
    completion_rate: float = 0
    created_at: datetime
    updated_at: datetime | None = None


class OperatorOption(BaseModel):
    id: int
    username: str
