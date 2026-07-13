from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    app_name: str = "SignBridge AI"
    environment: str = "development"
    debug: bool = True

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000

    # --- CORS ---
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- ML (wired up in Step 4) ---
    model_checkpoint_path: str = "../models/sign_recognition/checkpoints/latest.pt"
    sequence_length: int = 45
    confidence_threshold: float = 0.75

    # --- Speech (wired up in Step 7) ---
    whisper_model_size: str = "base"
    tts_engine: str = "piper"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """CORS_ORIGINS as a clean list, splitting on commas and trimming whitespace."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings accessor. Using a function (rather than a bare module-level
    instance) makes it easy to override settings in tests via dependency
    injection / cache clearing later.
    """
    return Settings()


settings = get_settings()
