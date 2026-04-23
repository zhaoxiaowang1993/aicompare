from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenUser(BaseModel):
    id: int
    username: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    refresh_token: str
    refresh_expires_in: int = 604800
    user: TokenUser


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    refresh_token: str
    refresh_expires_in: int = 604800


class MeResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
