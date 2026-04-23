from pydantic import BaseModel


class RuleCreateRequest(BaseModel):
    code: str
    name: str
    description: str | None = None
    score: int = 0
    is_active: bool = True


class RulePatchRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    score: int | None = None
    is_active: bool | None = None


class RuleItem(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    score: int
    is_active: bool


class RuleListResponse(BaseModel):
    items: list[RuleItem]
    total: int
    page: int
    page_size: int
