import json
import httpx
from typing import Dict, Any, Optional
from app.config import settings

class LLMService:
    """
    LLM Integration Service for generating code explanations, corrections, and learning tips.
    Supports external LLM API endpoints and includes an intelligent local fallback generator
    when no API key is provided.
    """

    async def generate_explanation(
        self,
        code: str,
        language: str,
        success: bool,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None,
        line: Optional[int] = None,
        rag_concept: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Generates explanation, concept, corrected_code, and learning_tip using LLM or fallback engine.
        """
        concept_name = rag_concept.get("name", "Programming Logic") if rag_concept else "Programming Logic"
        default_tip = rag_concept.get("learning_tip", "Review code logic and syntax carefully.") if rag_concept else "Review code logic."

        # Check if external LLM API key is configured
        if settings.LLM_API_KEY and settings.LLM_API_KEY.strip() != "":
            try:
                external_result = await self._call_external_llm(
                    code=code,
                    language=language,
                    success=success,
                    error_type=error_type,
                    error_message=error_message,
                    line=line,
                    concept_name=concept_name
                )
                if external_result:
                    return external_result
            except Exception:
                pass  # Fall back to local mock engine if external API fails

        # Local Intelligent Fallback Generator
        return self._generate_fallback_response(
            code=code,
            success=success,
            error_type=error_type,
            error_message=error_message,
            line=line,
            concept_name=concept_name,
            default_tip=default_tip
        )

    async def _call_external_llm(
        self,
        code: str,
        language: str,
        success: bool,
        error_type: Optional[str],
        error_message: Optional[str],
        line: Optional[int],
        concept_name: str
    ) -> Optional[Dict[str, str]]:
        """Calls external OpenAI-compatible Chat Completions API."""
        prompt = f"""
You are CodeMentor AI, an expert programming tutor.
Language: {language}
Code:
```
{code}
```
Success: {success}
Error Type: {error_type}
Error Message: {error_message}
Line: {line}
RAG Concept: {concept_name}

Return a valid JSON object with the following keys:
- "explanation": student-friendly explanation (2-3 sentences)
- "concept": concept name
- "corrected_code": corrected runnable snippet
- "learning_tip": practical actionable tip
        """
        headers = {
            "Authorization": f"Bearer {settings.LLM_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are a helpful programming tutor. Respond in valid JSON format only."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(settings.LLM_API_URL, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return {
                    "explanation": parsed.get("explanation", ""),
                    "concept": parsed.get("concept", concept_name),
                    "corrected_code": parsed.get("corrected_code", code),
                    "learning_tip": parsed.get("learning_tip", "")
                }
        return None

    def _generate_fallback_response(
        self,
        code: str,
        success: bool,
        error_type: Optional[str],
        error_message: Optional[str],
        line: Optional[int],
        concept_name: str,
        default_tip: str
    ) -> Dict[str, str]:
        """Local intelligent fallback explanation generator."""
        if success:
            return {
                "explanation": "Your Python code executed successfully with clean output and no runtime errors!",
                "concept": "Clean Code",
                "corrected_code": code,
                "learning_tip": "Great job! Keep writing clean, modular code with clear variable names and comments."
            }

        err = (error_type or "").strip()
        msg = (error_message or "").strip()
        line_info = f" on line {line}" if line else ""

        if err == "NameError":
            var_name = "x"
            if "'" in msg:
                parts = msg.split("'")
                if len(parts) >= 2:
                    var_name = parts[1]
            return {
                "explanation": f"The variable '{var_name}' is referenced{line_info} before it has been defined in your code.",
                "concept": "Variables",
                "corrected_code": f"{var_name} = 10\n" + code,
                "learning_tip": f"Always define and assign a value to variable '{var_name}' before using it."
            }

        elif err in ["SyntaxError", "IndentationError"]:
            return {
                "explanation": f"A syntax or structural formatting error occurred{line_info}: {msg}.",
                "concept": "If/Else" if "if" in code.lower() else "Syntax & Structure",
                "corrected_code": self._auto_fix_syntax(code),
                "learning_tip": "Check that all statement blocks end with a colon (:) and indentation is consistent (4 spaces)."
            }

        elif err == "ZeroDivisionError":
            return {
                "explanation": f"Your code attempted to divide a number by zero{line_info}, which is mathematically undefined.",
                "concept": "Exceptions",
                "corrected_code": "num = 10\ndenominator = 2\nresult = num / denominator\nprint(result)",
                "learning_tip": "Always check that your divisor is not zero before performing division operations."
            }

        elif err == "TypeError":
            return {
                "explanation": f"An operation was performed on incompatible data types{line_info}: {msg}.",
                "concept": "Data Types",
                "corrected_code": self._auto_fix_type_error(code),
                "learning_tip": "Use explicit type conversion functions like str(), int(), or float() when combining variables."
            }

        elif err == "IndexError":
            return {
                "explanation": f"Your code tried to access a list index that does not exist{line_info}.",
                "concept": "Lists",
                "corrected_code": "items = [1, 2, 3]\nif len(items) > 0:\n    print(items[0])",
                "learning_tip": "Check the length of a list with len(my_list) before accessing element indices."
            }

        elif err == "KeyError":
            return {
                "explanation": f"The requested dictionary key does not exist{line_info}: {msg}.",
                "concept": "Dictionaries",
                "corrected_code": "data = {'name': 'Alice'}\nprint(data.get('name', 'Default'))",
                "learning_tip": "Use dict.get(key, default) for safe key retrieval without triggering KeyError."
            }

        # General Fallback
        return {
            "explanation": f"An error of type '{err}' occurred{line_info}: {msg}.",
            "concept": concept_name,
            "corrected_code": f"# Corrected code proposal\n# Ensure all variables and functions are initialized\n{code}",
            "learning_tip": default_tip
        }

    def _auto_fix_syntax(self, code: str) -> str:
        lines = code.splitlines()
        fixed = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(("if ", "elif ", "else", "for ", "while ", "def ", "class ")) and not stripped.endswith(":"):
                line = line + ":"
            fixed.append(line)
        return "\n".join(fixed)

    def _auto_fix_type_error(self, code: str) -> str:
        if "+" in code:
            return code.replace("+", "+ str(") + ")" if ")" in code else code + " # use str() conversion"
        return code

llm_service = LLMService()
