"""CodeMentor AI - Core LLM + RAG Intelligence Module.

This package exposes the unified RAG engine, Cloud LLM service,
and structured Pydantic data schemas.
"""

from ai.prompts import (
    CodeAnalysisRequest,
    CodeAnalysisResult,
    SourceItem,
    SYSTEM_PROMPT,
)
from ai.rag import RAGEngine
from ai.llm_service import LLMService, llm_service

__all__ = [
    "CodeAnalysisRequest",
    "CodeAnalysisResult",
    "SourceItem",
    "SYSTEM_PROMPT",
    "RAGEngine",
    "LLMService",
    "llm_service",
]
