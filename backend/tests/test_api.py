import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "CodeMentor AI Backend is running"}

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_analyze_valid_python():
    payload = {
        "language": "python",
        "code": "x = 10\nprint(x)"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["error_type"] is None
    assert "10" in data["stdout"]

def test_analyze_name_error():
    payload = {
        "language": "python",
        "code": "print(x)"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "NameError"
    assert data["line"] == 1
    assert "defined" in data["explanation"].lower() or "variable" in data["explanation"].lower()

def test_analyze_syntax_error():
    payload = {
        "language": "python",
        "code": "def foo("
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "SyntaxError"
    assert data["line"] is not None

def test_analyze_unsupported_language():
    payload = {
        "language": "java",
        "code": "System.out.println(\"Hello\");"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "UnsupportedLanguage"
    assert "only Python is supported" in data["error_message"]

def test_history_endpoint():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)
