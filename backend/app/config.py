"""
Configuration management for CollegeGPT backend.
Uses pydantic-settings for type-safe environment variable parsing.
"""

import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App metadata
    app_name: str = Field(default="CollegeGPT", env="APP_NAME")
    debug: bool = Field(default=False, env="DEBUG")
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    version: str = "1.0.0"

    # CORS
    allowed_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        env="ALLOWED_ORIGINS"
    )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    # Google Gemini
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", env="GEMINI_MODEL")
    max_tokens: int = Field(default=2048, env="MAX_TOKENS")
    temperature: float = Field(default=0.1, env="TEMPERATURE")

    # Embedding
    embedding_model: str = Field(default="models/gemini-embedding-001", env="EMBEDDING_MODEL")

    # ChromaDB
    chroma_persist_directory: str = Field(default="./chroma_db", env="CHROMA_PERSIST_DIRECTORY")
    chroma_collection_name: str = Field(default="collegegpt_documents", env="CHROMA_COLLECTION_NAME")

    # File Upload
    upload_directory: str = Field(default="./uploads", env="UPLOAD_DIRECTORY")
    max_upload_size_mb: int = Field(default=50, env="MAX_UPLOAD_SIZE_MB")

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    # RAG Parameters
    chunk_size: int = Field(default=1000, env="CHUNK_SIZE")
    chunk_overlap: int = Field(default=200, env="CHUNK_OVERLAP")
    top_k_results: int = Field(default=5, env="TOP_K_RESULTS")

    # MongoDB (Optional)
    mongodb_url: Optional[str] = Field(default=None, env="MONGODB_URL")
    mongodb_db_name: str = Field(default="collegegpt", env="MONGODB_DB_NAME")

    # Security
    secret_key: str = Field(default="changeme-in-production-secret-key", env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


# Ensure required directories exist
def ensure_directories():
    """Create necessary directories if they don't exist."""
    settings = get_settings()
    os.makedirs(settings.upload_directory, exist_ok=True)
    os.makedirs(settings.chroma_persist_directory, exist_ok=True)
