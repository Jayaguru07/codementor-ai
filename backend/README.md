# CodeMentor AI Backend 🚀

CodeMentor AI is an AI-powered programming learning and debugging assistant designed for AIML and Computer Science students. It accepts student code, detects syntax and runtime errors, retrieves relevant core programming concepts via RAG (Retrieval-Augmented Generation), generates structured AI explanations & learning tips, logs student analysis history, and exposes RESTful endpoints for frontend integration.

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Installation](#5-installation)
6. [Virtual Environment Setup](#6-virtual-environment-setup)
7. [Installing Requirements](#7-installing-requirements)
8. [Environment Variables](#8-environment-variables)
9. [Running the Server](#9-running-the-server)
10. [API Endpoints](#10-api-endpoints)
11. [Example API Requests](#11-example-api-requests)
12. [Example Responses](#12-example-responses)
13. [How Frontend Connects](#13-how-frontend-connects)
14. [Security Limitations](#14-security-limitations)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview
CodeMentor AI acts as an intelligent coding tutor. When a student submits code with errors (such as `NameError`, `SyntaxError`, `ZeroDivisionError`, `TypeError`, or `IndexError`), the backend:
- Statically checks for syntax errors using Python's `ast.parse`.
- Executes the code inside a temporary isolated subprocess sandbox.
- Parses execution tracebacks to pinpoint error type, message, and line number.
- Queries a vector-ready RAG knowledge base of programming concepts.
- Synthesizes student-friendly explanations, corrected runnable code, and learning tips via LLM (with zero-config local fallback support).
- Logs analysis history to SQLite using SQLAlchemy.

---

## 2. Features
- **FastAPI REST API**: High-performance asynchronous API endpoints with automatically generated Swagger docs (`/docs`) and ReDoc (`/redoc`).
- **AST & Subprocess Execution Sandbox**: Isolated Python execution with timeout thresholds (5s) and stdout/stderr capture.
- **RAG Knowledge Retriever**: TF-IDF & cosine vector similarity engine over curated Python concepts (`Variables`, `Data Types`, `If/Else`, `Loops`, `Functions`, `Lists`, `Dictionaries`, `Classes`, `Exceptions`, `Scope`, `Imports`, `File Handling`).
- **LLM Integration + Local Fallback**: OpenAI/Gemini API integration with local mock fallback so the backend works out-of-the-box without needing API keys.
- **SQLite History Log**: Persistent database storing student submission history and AI feedback.
- **CORS Support**: Pre-configured CORS allowing `http://localhost:3000` (Next.js / React frontend).
- **Automated Pytest Suite**: Complete unit tests covering all endpoints and edge cases.

---

## 3. Tech Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.110.0
- **ASGI Server**: Uvicorn 0.28.0
- **Data Validation**: Pydantic v2
- **Database & ORM**: SQLite & SQLAlchemy 2.0
- **RAG & Vector Matching**: scikit-learn (TF-IDF & Cosine Similarity)
- **HTTP Client**: HTTPX
- **Testing**: Pytest & FastAPI TestClient

---

## 4. Folder Structure
```
backend/
│
├── app/
│   ├── main.py                # FastAPI entry point, middleware, routes
│   ├── config.py              # Environment configuration loader
│   │
│   ├── routes/
│   │   ├── analyze.py         # POST /api/analyze route
│   │   ├── history.py         # GET /api/history route
│   │   └── health.py          # GET /health route
│   │
│   ├── services/
│   │   ├── analyzer.py        # Central code analysis orchestrator
│   │   ├── llm_service.py     # LLM API integration & fallback generator
│   │   ├── rag_service.py     # Concept vector similarity retriever
│   │   └── execution_service.py # Subprocess code execution sandbox
│   │
│   ├── models/
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   └── database_models.py # SQLAlchemy ORM models
│   │
│   ├── database/
│   │   ├── database.py        # DB engine & session dependency
│   │   └── crud.py            # SQLite database operations
│   │
│   └── utils/
│       └── error_parser.py    # AST & traceback error parser
│
├── data/
│   └── programming_concepts/
│       └── concepts.json      # Structured programming concepts knowledge base
│
├── tests/
│   └── test_api.py            # Pytest automated test suite
│
├── .env                       # Local environment secrets
├── .env.example               # Example configuration template
├── requirements.txt           # Python dependency requirements
├── README.md                  # Project documentation
└── Dockerfile                 # Docker container deployment setup
```

---

## 5. Installation
Clone or navigate to the repository directory:
```bash
cd codementor-ai/backend
```

---

## 6. Virtual Environment Setup
### On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 7. Installing Requirements
```bash
pip install -r requirements.txt
```

---

## 8. Environment Variables
Create a `.env` file in `backend/`:
```env
APP_NAME="CodeMentor AI Backend"
APP_ENV="development"
DEBUG=True

HOST="0.0.0.0"
PORT=8000
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

DATABASE_URL="sqlite:///./codementor.db"
EXECUTION_TIMEOUT=5

# Optional: Set external LLM API key (if blank, local fallback engine is used)
LLM_API_KEY=""
LLM_MODEL="gpt-3.5-turbo"
LLM_API_URL="https://api.openai.com/v1/chat/completions"
```

---

## 9. Running the Server

### Development Mode:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Open Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Open ReDoc Documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Running Automated Tests:
```bash
pytest
```

---

## 10. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root connectivity check |
| `GET` | `/health` | Health status check |
| `POST` | `/api/analyze` | Analyzes code, detects errors, queries RAG & LLM, logs history |
| `GET` | `/api/history` | Retrieves stored analysis history |

---

## 11. Example API Requests

### 1. Root Check (`GET /`)
```bash
curl -X GET "http://127.0.0.1:8000/"
```

### 2. Health Check (`GET /health`)
```bash
curl -X GET "http://127.0.0.1:8000/health"
```

### 3. Analyze Error Code (`POST /api/analyze`)
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "language": "python",
       "code": "print(x)"
     }'
```

### 4. Analyze Success Code (`POST /api/analyze`)
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "language": "python",
       "code": "x = 10\nprint(x)"
     }'
```

---

## 12. Example Responses

### Error Analysis Response:
```json
{
  "success": false,
  "error_type": "NameError",
  "error_message": "name 'x' is not defined",
  "line": 1,
  "explanation": "The variable 'x' is referenced on line 1 before it has been defined in your code.",
  "concept": "Variables",
  "corrected_code": "x = 10\nprint(x)",
  "learning_tip": "Always define and assign a value to variable 'x' before using it.",
  "stdout": "",
  "stderr": "NameError: name 'x' is not defined"
}
```

### Successful Execution Response:
```json
{
  "success": true,
  "error_type": null,
  "error_message": null,
  "line": null,
  "explanation": "Your Python code executed successfully with clean output and no runtime errors!",
  "concept": "Clean Code",
  "corrected_code": "x = 10\nprint(x)",
  "learning_tip": "Great job! Keep writing clean, modular code with clear variable names and comments.",
  "stdout": "10\n",
  "stderr": ""
}
```

---

## 13. How Frontend Connects
The frontend (React / Next.js) running on `http://localhost:3000` connects via HTTP POST requests:

```javascript
const response = await fetch('http://localhost:8000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    language: 'python',
    code: codeInput,
  }),
});
const data = await response.json();
console.log(data.explanation, data.corrected_code);
```

---

## 14. Security Limitations
- **Local Prototype Execution**: Code execution uses temporary files with subprocess execution guarded by a 5-second timeout and isolated environment.
- **Production Guardrails**: In production, execution should be routed through a Docker sandbox (`docker run --network none --memory 128m`) to prevent file system or network access.

---

## 15. Future Improvements
- Multi-language support (JavaScript, Java, C++ sandbox containers).
- Full ChromaDB vector database integration for larger dataset scaling.
- User authentication and student progress analytics dashboard.
