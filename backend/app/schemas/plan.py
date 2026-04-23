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
    status: str
    owner_user_id: int
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
    status: str
    created_at: datetime
