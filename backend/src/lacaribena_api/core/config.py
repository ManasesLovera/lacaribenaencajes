from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "La Caribeña Encajes API"
    app_version: str = "0.2.0"
    environment: str = "development"
    database_url: str = "sqlite:///./lacaribena.db"
    cors_origins: str = "http://localhost:5173"

    secret_key: str = "lacaribena-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    seed_email: str = "yesenia@lacaribenaencajes.com"
    seed_password: str = "lacaribenaencajes"

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
