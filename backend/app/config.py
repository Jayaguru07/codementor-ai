import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CodeMentor AI Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    DATABASE_URL: str = "sqlite:///./codementor.db"
    EXECUTION_TIMEOUT: int = 5
    
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_API_URL: str = "https://api.openai.com/v1/chat/completions"

    class Config:
        env_file = [".env", "ai/.env", "backend/.env"]
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
