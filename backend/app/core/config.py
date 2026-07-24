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
    # Public base URL of THIS API, used to build absolute URLs for uploaded
    # images so the frontend (a different origin) can load them.
    public_api_url: str = "http://127.0.0.1:8000"

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

    # --- Email (SMTP) — patient appointment-confirmation emails --------------
    # Leave SMTP_HOST/USER/PASSWORD unset to disable sending (the app logs the
    # email instead of sending it — nothing breaks). Set all three to enable.
    # Port 587 → STARTTLS (default). Port 465 → set SMTP_SSL=true.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_ssl: bool = False
    smtp_starttls: bool = True
    smtp_from_email: str | None = None  # defaults to smtp_user
    smtp_from_name: str = "Zimal Dental Clinic"

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a clean list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def emails_enabled(self) -> bool:
        """True only when SMTP is fully configured."""
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    @property
    def email_from(self) -> str:
        """The From address for outgoing mail."""
        return self.smtp_from_email or self.smtp_user or "no-reply@zimaldental.com"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance so the ``.env`` file is read once."""
    return Settings()
