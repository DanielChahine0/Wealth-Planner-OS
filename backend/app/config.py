from __future__ import annotations
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    anthropic_api_key: str = Field(default="", env="ANTHROPIC_API_KEY")
    environment: str = Field(default="development", env="ENVIRONMENT")
    cors_origins: str = Field(
        default="http://localhost:3000", env="CORS_ORIGINS"
    )
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    n_simulations: int = Field(default=10000, env="N_SIMULATIONS")
    max_simulations: int = Field(default=50000, env="MAX_SIMULATIONS")
    claude_timeout: float = Field(default=45.0, env="CLAUDE_TIMEOUT")
    claude_max_retries: int = Field(default=3, env="CLAUDE_MAX_RETRIES")
    max_chat_history: int = Field(default=20, env="MAX_CHAT_HISTORY")
    rate_limit_per_minute: int = Field(default=30, env="RATE_LIMIT_PER_MINUTE")
    sentry_dsn: str = Field(default="", env="SENTRY_DSN")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
