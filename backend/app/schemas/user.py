from pydantic import BaseModel


class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str


class UserPatchRequest(BaseModel):
    is_active: bool | None = None
    password: str | None = None


class UserItem(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool


class UserListResponse(BaseModel):
    items: list[UserItem]
