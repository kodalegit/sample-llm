from typing import Optional, List
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Elelem"

    # Database settings
    DATABASE_URL: Optional[PostgresDsn]

    # Security settings
    SECRET_KEY: str = "your-secret-key-for-development-only"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # LLM settings
    LLM_PROVIDER: str = "gemini"  # openai, deepseek, gemini, or claude
    LLM_API_KEY: Optional[str]
    LLM_MODEL: str = "gemini-2.0-flash"

    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
