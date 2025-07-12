from functools import lru_cache
from pydantic_settings import BaseSettings
from dotenv import find_dotenv


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:manish@localhost:5432/stackit"
    SECRET_KEY: str = "please-change-me-with-env-var"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = find_dotenv(".env")
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
