"""Unit Tests for Cloud LLM Service (ai/llm_service.py).

Tests verify:
1. Input validation rejects empty language and empty code, but accepts empty error_message.
2. Pydantic schemas validate correctly using Field(default_factory=list) for sources.
3. JSON extraction handles markdown fences, preamble text, and raw JSON strings.
4. Provider HTTP call is isolated and mocked (no internet or real API key required).
5. Missing API key raises clear ValueError without crashing.
6. Complete analyze_code() workflow succeeds with mocked responses.
"""

import json
from unittest.mock import MagicMock, patch
import pytest

from prompts import CodeAnalysisRequest, CodeAnalysisResult, SourceItem
from llm_service import LLMService


# -----------------------------------------------------------------------------
# 1. Input Validation Tests
# -----------------------------------------------------------------------------

def test_request_validation_valid():
    """Verify valid request constructs without errors."""
    req = CodeAnalysisRequest(
        language="Python",
        code="x = 10",
        error_message="NameError: name 'y' is not defined",
    )
    assert req.language == "Python"
    assert req.code == "x = 10"
    assert req.error_message == "NameError: name 'y' is not defined"


def test_request_validation_empty_error_allowed():
    """Verify empty error_message is permitted (e.g. for code review/explanation)."""
    req = CodeAnalysisRequest(language="Python", code="print('hello')", error_message="")
    assert req.error_message == ""


def test_request_validation_empty_language_rejected():
    """Verify empty or whitespace-only language raises ValidationError."""
    with pytest.raises(ValueError, match="Programming language must not be empty"):
        CodeAnalysisRequest(language="   ", code="print(1)")


def test_request_validation_empty_code_rejected():
    """Verify empty or whitespace-only code raises ValidationError."""
    with pytest.raises(ValueError, match="Code snippet must not be empty"):
        CodeAnalysisRequest(language="Python", code="   ")


# -----------------------------------------------------------------------------
# 2. Schema and JSON Extraction Tests
# -----------------------------------------------------------------------------

def test_code_analysis_result_default_sources_is_independent_list():
    """Verify sources uses Field(default_factory=list) and is not a shared mutable default."""
    res1 = CodeAnalysisResult(
        error_type="IndexError",
        explanation="Index exceeds length",
        cause="Accessed index 5",
        concept="List Indexing",
        corrected_code="print(numbers[2])",
        learning_tip="Use len() - 1",
        practice_question="What is the index of the first element?",
    )
    res2 = CodeAnalysisResult(
        error_type="NameError",
        explanation="Variable not defined",
        cause="Missing y",
        concept="Variable Scope",
        corrected_code="y = 5\nprint(y)",
        learning_tip="Define before using",
        practice_question="What is a variable?",
    )
    assert res1.sources == []
    assert res2.sources == []
    assert res1.sources is not res2.sources  # Must be distinct list instances!


def test_extract_json_from_markdown_fences():
    """Verify JSON wrapped inside ```json ... ``` markdown fences is parsed cleanly."""
    raw_llm_output = (
        "Here is your analysis:\n\n"
        "```json\n"
        "{\n"
        '  "error_type": "IndexError",\n'
        '  "explanation": "Out of range",\n'
        '  "cause": "Index 5 exceeds length 3",\n'
        '  "concept": "List Indexing",\n'
        '  "corrected_code": "print(numbers[2])",\n'
        '  "learning_tip": "Remember zero-based indexing",\n'
        '  "practice_question": "What is numbers[-1]?"\n'
        "}\n"
        "```\n\n"
        "Hope this helps!"
    )
    parsed = LLMService._extract_json_from_text(raw_llm_output)
    assert isinstance(parsed, dict)
    assert parsed["error_type"] == "IndexError"
    assert parsed["concept"] == "List Indexing"


def test_extract_json_malformed_raises_value_error():
    """Verify unparseable text raises a clear ValueError."""
    bad_output = "I cannot fulfill this request as JSON: {broken json..."
    with pytest.raises(ValueError, match="LLM output could not be parsed as valid JSON"):
        LLMService._extract_json_from_text(bad_output)


# -----------------------------------------------------------------------------
# 3. Provider Call and Mocked Analysis Tests
# -----------------------------------------------------------------------------

def test_missing_api_key_raises_error():
    """Verify calling _call_chat_completion with no API key raises clear ValueError."""
    service = LLMService(api_key="", base_url="https://api.openai.com/v1")
    with patch.dict("os.environ", {"LLM_API_KEY": ""}, clear=True):
        with pytest.raises(ValueError, match="LLM API key is not configured"):
            service._call_chat_completion([{"role": "user", "content": "hi"}])


@patch("requests.post")
def test_call_chat_completion_success(mock_post):
    """Verify _call_chat_completion issues expected HTTP POST request."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"status": "ok"}'}}]
    }
    mock_post.return_value = mock_response

    service = LLMService(api_key="test_mock_key", model="test-model", base_url="https://mock.api/v1")
    messages = [{"role": "user", "content": "hello"}]
    content = service._call_chat_completion(messages)

    assert content == '{"status": "ok"}'
    mock_post.assert_called_once()
    args, kwargs = mock_post.call_args
    assert args[0] == "https://mock.api/v1/chat/completions"
    assert kwargs["headers"]["Authorization"] == "Bearer test_mock_key"
    assert kwargs["json"]["model"] == "test-model"


@patch.object(LLMService, "_call_chat_completion")
def test_analyze_code_end_to_end_mocked(mock_llm_call):
    """Verify analyze_code() coordinates RAG, prompt assembly, parsing, and source attribution."""
    # 1. Setup mock LLM response
    fake_json = {
        "error_type": "IndexError",
        "explanation": "List index out of bounds",
        "cause": "List contains 3 items, but index 5 was queried.",
        "concept": "Zero-Based List Indexing",
        "corrected_code": "numbers = [10, 20, 30]\nprint(numbers[2])",
        "learning_tip": "The highest valid index in a list of length N is N - 1.",
        "practice_question": "What does numbers[-1] return?",
    }
    mock_llm_call.return_value = json.dumps(fake_json)

    # 2. Setup mock RAG engine
    mock_rag = MagicMock()
    mock_rag.retrieve_for_error.return_value = [
        {
            "id": 1,
            "source": "python/indexing.md",
            "category": "python",
            "chunk_number": 0,
            "score": 0.885,
            "text": "Indexing begins at zero in Python...",
        }
    ]

    # 3. Instantiate service with mock RAG and run analysis
    service = LLMService(api_key="mock_key", rag_engine=mock_rag)
    result = service.analyze_code(
        language="Python",
        code="numbers = [10, 20, 30]\nprint(numbers[5])",
        error_message="IndexError: list index out of range",
    )

    # 4. Assert schema and content
    assert isinstance(result, CodeAnalysisResult)
    assert result.error_type == "IndexError"
    assert result.concept == "Zero-Based List Indexing"
    assert len(result.sources) == 1
    assert result.sources[0].source == "python/indexing.md"
    assert result.sources[0].score == 0.885
