from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


def _sqlalchemy_url(url: str) -> str:
    """Return a SQLAlchemy URL using the installed psycopg v3 driver."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "La Caribeña Encajes API"
    app_version: str = "0.2.0"
    environment: str = "development"

    local_database_url: str = "sqlite:///./lacaribena.db"
    database_url: str = ""
    database_url_unpooled: str = ""

    cors_origins: str = "http://localhost:5173"

    secret_key: str = "lacaribena-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    seed_email: str = "yesenia@lacaribenaencajes.com"
    seed_password: str = "lacaribenaencajes"

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() in {"prod", "production"}

    @property
    def sqlalchemy_url(self) -> str:
        if self.is_production:
            if not self.database_url:
                raise RuntimeError(
                    "DATABASE_URL is required when ENVIRONMENT=production"
                )
            return _sqlalchemy_url(self.database_url)
        return _sqlalchemy_url(self.local_database_url)

    @property
    def migration_url(self) -> str:
        if not self.is_production:
            return self.sqlalchemy_url
        return _sqlalchemy_url(
            self.database_url_unpooled or self.database_url
        )

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]
        if self.is_production:
            if not origins:
                raise RuntimeError(
                    "CORS_ORIGINS must list at least one HTTPS origin "
                    "when ENVIRONMENT=production"
                )
            invalid = [
                origin
                for origin in origins
                if origin == "*" or not origin.startswith("https://")
            ]
            if invalid:
                raise RuntimeError(
                    "CORS_ORIGINS must contain only explicit HTTPS origins "
                    f"when ENVIRONMENT=production: {invalid}"
                )
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
