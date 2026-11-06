from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server
    ai_server_port: int = 8000
    ai_allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    ai_service_token: str = ""

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"

    # Local LLM (LM Studio / vLLM / Ollama)
    chat_llm_base_url: str = "http://127.0.0.1:1234/v1"
    chat_llm_model: str = "qwen/qwen2.5-vl-7b"
    chat_llm_temperature: float = 0.3
    chat_llm_timeout_ms: int = 20000

    # LLM Provider: "local" or "gemini"
    llm_provider: str = "local"

    # Cache configuration (L1 in-memory + optional L2 Redis)
    redis_url: str = ""
    chat_cache_ttl_seconds: int = 300
    chat_cache_max_entries: int = 512

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
