"""Cloud LLM Service for CodeMentor AI.

This module is responsible for:
1. Managing provider-independent cloud LLM communication via an OpenAI-compatible HTTP endpoint.
2. Lazily coordinating RAG retrieval and prompt assembly.
3. Parsing, cleaning, and validating structured JSON responses using Pydantic.
4. Attaching retrieved knowledge sources to the final analysis result.
5. Providing resilient error handling for missing keys, network timeouts, and malformed outputs.

EDUCATIONAL NOTE FOR VIVA:
- Provider-Independent Architecture:
  Instead of hardcoding a specific SDK (e.g. openai vs groq vs anthropic), we communicate
  over standard HTTP with the industry-standard `/chat/completions` API schema.
  By changing `LLM_BASE_URL` in `.env`, the same code can talk to OpenAI, Groq, OpenRouter,
  Together AI, or any cloud API without modifying a single line of Python.
- Why Lazy Initialization?
  Instantiating `LLMService()` is instantaneous because neither the embedding model nor
  FAISS is loaded until `analyze_code()` is called. This prevents heavy startup overhead
  during imports, unit testing, or FastAPI application bootstrapping.
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

from prompts import (
    SYSTEM_PROMPT,
    CodeAnalysisRequest,
    CodeAnalysisResult,
    SourceItem,
    build_analysis_prompt,
)
from rag import RAGEngine

# Load environment variables from ai/.env or root .env
AI_DIR = Path(__file__).resolve().parent
ENV_FILE = AI_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
else:
    load_dotenv()


class LLMService:
    """Service to coordinate RAG retrieval, prompt construction, and cloud LLM analysis."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        rag_engine: Optional[RAGEngine] = None,
    ):
        """Initializes LLMService with lazy RAG and cloud configuration."""
        self._api_key = (api_key if api_key is not None else os.getenv("LLM_API_KEY", "")).strip()
        self._model = (model if model is not None else os.getenv("LLM_MODEL", "gpt-4o-mini")).strip()
        self._base_url = (base_url if base_url is not None else os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")).strip().rstrip("/")

        # Lazy RAG Engine reference
        self._rag_engine = rag_engine

    @property
    def rag_engine(self) -> RAGEngine:
        """Lazily initializes and returns the RAGEngine instance."""
        if self._rag_engine is None:
            self._rag_engine = RAGEngine()
        return self._rag_engine

    def _call_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        timeout: int = 30,
    ) -> str:
        """Executes a cloud HTTP request to the OpenAI-compatible chat completions endpoint.

        All provider-specific HTTP details are isolated in this method.
        """
        api_key = self._api_key or os.getenv("LLM_API_KEY", "").strip()
        if not api_key:
            raise ValueError(
                "LLM API key is not configured. Please set LLM_API_KEY in ai/.env "
                "or export it as an environment variable."
            )

        url = f"{self._base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=timeout)
        except requests.exceptions.Timeout as exc:
            raise TimeoutError(f"Cloud LLM API request timed out after {timeout} seconds.") from exc
        except requests.exceptions.ConnectionError as exc:
            raise ConnectionError(
                f"Failed to connect to cloud LLM endpoint ({self._base_url}). "
                f"Please check your internet connection or URL configuration: {exc}"
            ) from exc
        except Exception as exc:
            raise RuntimeError(f"Unexpected error communicating with LLM API: {exc}") from exc

        if response.status_code != 200:
            error_details = response.text
            try:
                error_json = response.json()
                error_details = error_json.get("error", {}).get("message", response.text)
            except Exception:
                pass

            if response.status_code == 401:
                raise PermissionError(f"LLM API Authentication failed (401): {error_details}")
            elif response.status_code == 429:
                raise RuntimeError(f"LLM API Rate limit exceeded (429): {error_details}")
            else:
                raise RuntimeError(
                    f"LLM API request failed with status {response.status_code}: {error_details}"
                )

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
            return content
        except (KeyError, IndexError) as exc:
            raise ValueError(f"Malformed response received from cloud LLM API: {data}") from exc

    @staticmethod
    def _extract_json_from_text(raw_text: str) -> Dict[str, Any]:
        """Cleans and extracts valid JSON from LLM output, stripping markdown fences if present."""
        cleaned = raw_text.strip()

        # Remove markdown code fences ```json ... ``` or ``` ... ```
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
            if match:
                cleaned = match.group(1).strip()

        # If text still contains non-JSON preambles, find the outer curly braces
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx : end_idx + 1]

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"LLM output could not be parsed as valid JSON.\nRaw output:\n{raw_text}\nError: {exc}"
            ) from exc

    def analyze_code(
        self,
        language: str,
        code: str,
        error_message: str = "",
        top_k: int = 4,
    ) -> CodeAnalysisResult:
        """Main entry point for analyzing student code using RAG and Cloud LLM.

        Flow:
        1. Validate inputs (reject empty language or code).
        2. Perform RAG retrieval via lazy RAGEngine.
        3. Format retrieved context into user prompt.
        4. Dispatch completion call to Cloud LLM API.
        5. Extract and parse structured JSON.
        6. Validate schema with Pydantic (CodeAnalysisResult).
        7. Attach retrieved sources with similarity scores.
        8. Return validated result.
        """
        # 1. Input Validation using Pydantic request model
        request = CodeAnalysisRequest(
            language=language,
            code=code,
            error_message=error_message or "",
        )

        # 2. RAG Retrieval
        retrieved_chunks = self.rag_engine.retrieve_for_error(
            language=request.language,
            code=request.code,
            error_message=request.error_message,
            top_k=top_k,
        )

        # 3. Assemble Prompt
        user_prompt = build_analysis_prompt(
            language=request.language,
            code=request.code,
            error_message=request.error_message,
            retrieved_chunks=retrieved_chunks,
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        # 4. Cloud LLM Call
        raw_response = self._call_chat_completion(messages=messages)

        # 5. Extract JSON
        parsed_json = self._extract_json_from_text(raw_response)

        # 6. Pydantic Validation
        analysis_result = CodeAnalysisResult.model_validate(parsed_json)

        # 7. Attach Sources with similarity scores
        sources_list = [
            SourceItem(source=chunk["source"], score=chunk["score"])
            for chunk in retrieved_chunks
        ]
        analysis_result.sources = sources_list

        return analysis_result


# Singleton instance for downstream backend integration
llm_service = LLMService()
