from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AICompare API"
    api_prefix: str = "/api"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    app_timezone: str = "Asia/Shanghai"
    sqlite_path: str = "./backend/data/aicompare.db"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    @property
    def sqlite_url(self) -> str:
        db_path = Path(self.sqlite_path)
        if not db_path.is_absolute():
            db_path = Path(__file__).resolve().parents[3] / db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"


settings = Settings()
