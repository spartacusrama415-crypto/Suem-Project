from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    app_env: str = "development"
    frontend_url: str = "http://localhost:5173"
    api_secret_key: str = "dev-secret"
    esp32_ip: str = ""
    poll_interval_seconds: int = 5

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
