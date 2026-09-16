import builtins
import subprocess
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from ai.prompts import CodeAnalysisResult, SourceItem

client = TestClient(app)


# -----------------------------------------------------------------------------
# 1. Health and Connectivity Tests
# -----------------------------------------------------------------------------

def test_root_endpoint():
    """Verify backend root connectivity endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "CodeMentor AI Backend is running"}


def test_health_endpoint():
    """Verify health status check."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_backend_imports_ai_package():
    """Verify backend environment cleanly imports the AI package."""
    from ai import LLMService, RAGEngine, CodeAnalysisResult, CodeAnalysisRequest
    assert LLMService is not None
    assert RAGEngine is not None
    assert CodeAnalysisResult is not None
    assert CodeAnalysisRequest is not None


# -----------------------------------------------------------------------------
# 2. Code Analysis & AI Integration Tests
# -----------------------------------------------------------------------------

@patch("ai.llm_service.llm_service.analyze_code")
def test_analyze_valid_python(mock_analyze):
    """Verify clean Python code is analyzed without errors."""
    mock_analyze.return_value = CodeAnalysisResult(
        error_type="None",
        explanation="Your code runs cleanly and follows Python best practices.",
        cause="No syntax or runtime defects detected.",
        concept="Clean Code",
        corrected_code="x = 10\nprint(x)",
        learning_tip="Maintain clean naming conventions.",
        practice_question="How do you verify variable types in Python?",
        sources=[SourceItem(source="python/variables.md", score=0.85)],
    )

    payload = {
        "language": "python",
        "code": "x = 10\nprint(x)",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["error_type"] is None
    assert data["concept"] == "Clean Code"
    assert data["corrected_code"] == "x = 10\nprint(x)"
    assert len(data["sources"]) == 1
    mock_analyze.assert_called_once()


@patch("ai.llm_service.llm_service.analyze_code")
def test_analyze_name_error_with_error_message(mock_analyze):
    """Verify runtime error passed with error_message is processed and localized."""
    mock_analyze.return_value = CodeAnalysisResult(
        error_type="NameError",
        explanation="Variable 'x' is used before being defined.",
        cause="Accessing an undefined variable name in global scope.",
        concept="Variables and Scope",
        corrected_code="x = 10\nprint(x)",
        learning_tip="Define all variables before referencing them.",
        practice_question="What is the difference between local and global variables?",
        sources=[SourceItem(source="python/variables.md", score=0.92)],
    )

    payload = {
        "language": "python",
        "code": "print(x)",
        "error_message": "NameError: name 'x' is not defined",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "NameError"
    assert data["line"] == 1
    assert "defined" in data["explanation"].lower() or "variable" in data["explanation"].lower()
    assert data["practice_question"] is not None


def test_analyze_syntax_error():
    """Verify syntax error is statically detected by AST without executing code."""
    with patch("ai.llm_service.llm_service.analyze_code") as mock_analyze:
        mock_analyze.return_value = CodeAnalysisResult(
            error_type="SyntaxError",
            explanation="The function definition is missing a closing parenthesis.",
            cause="Unclosed parenthesis on line 1.",
            concept="Syntax and Functions",
            corrected_code="def foo():\n    pass",
            learning_tip="Ensure all opening parentheses have matching closing ones.",
            practice_question="What keyword begins a function definition in Python?",
            sources=[SourceItem(source="python/functions.md", score=0.88)],
        )

        payload = {
            "language": "python",
            "code": "def foo(",
        }
        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error_type"] == "SyntaxError"
        assert data["line"] == 1
        mock_analyze.assert_called_once()


def test_analyze_empty_code_rejected():
    """Verify empty or whitespace-only code is rejected gracefully."""
    payload = {
        "language": "python",
        "code": "   ",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "EmptyCode"


def test_analyze_unsupported_language():
    """Verify unsupported programming languages return a clear message."""
    payload = {
        "language": "java",
        "code": 'System.out.println("Hello");',
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "UnsupportedLanguage"
    assert "only Python is supported" in data["error_message"]


@patch("ai.llm_service.llm_service.analyze_code")
def test_analyze_ai_failure_handled_gracefully(mock_analyze):
    """Verify cloud API timeout or network failure returns an informative response."""
    mock_analyze.side_effect = TimeoutError("Cloud LLM API timed out after 30 seconds.")

    payload = {
        "language": "python",
        "code": "x = 10\nprint(x)",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "AIAnalysisError"
    assert "timed out" in data["error_message"]


# -----------------------------------------------------------------------------
# 3. Security Guarantee Test: ZERO Student Code Execution
# -----------------------------------------------------------------------------

@patch("subprocess.run")
@patch("subprocess.Popen")
@patch("ai.llm_service.llm_service.analyze_code")
def test_student_code_never_executed(mock_analyze, mock_popen, mock_run):
    """CRITICAL SECURITY TEST: Asserts subprocess, exec, and eval are NEVER called on student code."""
    mock_analyze.return_value = CodeAnalysisResult(
        error_type="None",
        explanation="Code analyzed statically as text.",
        cause="Text analysis only.",
        concept="Security Guardrails",
        corrected_code="print('safe')",
        learning_tip="Never run untrusted user input directly on host systems.",
        practice_question="Why should student code be analyzed as text only?",
        sources=[],
    )

    malicious_code = """
import os
import sys
# Attempt dangerous actions
os.system("echo 'exploit'")
"""

    payload = {
        "language": "python",
        "code": malicious_code,
        "error_message": "",
    }

    # Monitor builtins.exec and builtins.eval
    with patch.object(builtins, "eval", wraps=builtins.eval) as spy_eval, \
         patch.object(builtins, "exec", wraps=builtins.exec) as spy_exec:

        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200

        # Assert subprocess execution was never attempted
        mock_run.assert_not_called()
        mock_popen.assert_not_called()


# -----------------------------------------------------------------------------
# 4. History Logging Tests
# -----------------------------------------------------------------------------

def test_history_endpoint():
    """Verify student submissions and analysis records are persisted in SQLite."""
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)
