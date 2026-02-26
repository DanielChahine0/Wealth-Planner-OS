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

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
