"""Application configuration.

Settings are loaded from environment variables (and an optional local ``.env``
file). Nothing here is hardcoded to a secret value; production values must be
supplied through the environment.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---------------------------------------------------------
    app_name: str = "Zimal Dental Clinic API"
    environment: str = "development"
    api_prefix: str = "/api"

    # --- Database ------------------------------------------------------------
    # The connection string is read from the environment. It is never committed.
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "zimal_dental"

    # --- CORS ----------------------------------------------------------------
    # Comma-separated list of allowed origins (the Next.js frontend).
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Auth (used from Phase 3 onward) -------------------------------------
    jwt_secret: str = "insecure-development-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # --- Default doctor/admin account (created by `python -m app.seed_admin`) -
    # If admin_password is unset, the seed script generates a strong one and
    # prints it once.
    admin_email: str = "doctor@zimaldental.com"
    admin_name: str = "Zimal Dental Admin"
    admin_password: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a clean list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance so the ``.env`` file is read once."""
    return Settings()
