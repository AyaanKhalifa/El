import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    EL_ENV: str = "development"
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    
    # AI Engine
    AI_PROVIDER: str = "ollama"  # "ollama" or "cloud"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    
    # Cloud AI fallback / primary
    CLOUD_API_KEY: str = ""
    CLOUD_BASE_URL: str = "https://api.openai.com/v1"
    CLOUD_MODEL: str = "gpt-4o-mini"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./el_database.sqlite"
    
    # Workspace & Security
    WORKSPACE_ROOT: str = str(Path("d:/El/workspace").resolve())
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    SAFE_COMMANDS_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure workspace root exists
Path(settings.WORKSPACE_ROOT).mkdir(parents=True, exist_ok=True)
