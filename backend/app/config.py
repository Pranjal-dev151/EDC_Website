from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/edc"
    JWT_SECRET: str = "change-me-to-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ADMIN_EMAIL: str = "techhead@edc.sirt"
    ADMIN_PASSWORD: str = "change-me"
    ADMIN_NAME: str = "Tech Head"
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def sqlalchemy_url(self) -> str:
        url = self.DATABASE_URL.strip()
        # Render / Heroku style URLs use postgres:// — SQLAlchemy needs postgresql://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
