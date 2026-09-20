import re
from typing import Optional

from app.models.schemas import AnalyzeResponse, SourceItemSchema
from app.utils.error_parser import error_parser
from ai.llm_service import llm_service
from ai.prompts import CodeAnalysisResult


class CodeAnalyzerService:
    """Core CodeMentor AI Analyzer Orchestrator.

    Coordinates:
    - Input validation
    - Python syntax checking
    - Static analysis
    - RAG retrieval
    - Cloud LLM analysis
    - Structured response mapping

    SECURITY:
    Student code is analyzed only as text.
    This service NEVER executes untrusted student code.
    """

    async def analyze(
        self,
        language: str,
        code: str,
        error_message: Optional[str] = None,
    ) -> AnalyzeResponse:

        lang_normalized = (language or "").strip().lower()

        # ---------------------------------------------------------
        # 1. Language validation
        # ---------------------------------------------------------
        if lang_normalized != "python":
            return AnalyzeResponse(
                success=False,
                error_type="UnsupportedLanguage",
                error_message="Currently only Python is supported.",
                line=None,
                explanation=(
                    "CodeMentor AI currently supports Python code analysis."
                ),
                concept="Supported Languages",
                corrected_code=None,
                learning_tip=(
                    "Select Python as your target programming language."
                ),
                practice_question=None,
                sources=[],
                stdout="",
                stderr="",
            )

        # ---------------------------------------------------------
        # 2. Empty code validation
        # ---------------------------------------------------------
        if not code or not code.strip():
            return AnalyzeResponse(
                success=False,
                error_type="EmptyCode",
                error_message="Code snippet must not be empty.",
                line=None,
                explanation=(
                    "Please provide a valid Python code snippet to analyze."
                ),
                concept="Input Validation",
                corrected_code=None,
                learning_tip=(
                    "Paste or write Python code before requesting analysis."
                ),
                practice_question=None,
                sources=[],
                stdout="",
                stderr="",
            )

        # ---------------------------------------------------------
        # 3. Static syntax analysis
        # ---------------------------------------------------------
        syntax_err = error_parser.check_syntax(code)

        # Static analysis is performed only when syntax is valid.
        static_err = None

        if syntax_err is None:
            try:
                static_err = error_parser.check_static_analysis(code)
            except AttributeError:
                # If check_static_analysis is not implemented,
                # continue with syntax + supplied error information.
                static_err = None
            except Exception:
                static_err = None

        detected_line: Optional[int] = None
        effective_error = (error_message or "").strip()
        has_error = False

        # ---------------------------------------------------------
        # 4. Syntax error detected
        # ---------------------------------------------------------
        if syntax_err:
            has_error = True

            detected_line = syntax_err.get("line")

            syntax_desc = (
                f"{syntax_err['error_type']}: "
                f"{syntax_err['error_message']}"
            )

            if effective_error:
                effective_error = (
                    f"{syntax_desc}\n{effective_error}"
                )
            else:
                effective_error = syntax_desc

        # ---------------------------------------------------------
        # 5. Static error detected
        # ---------------------------------------------------------
        elif static_err and not effective_error:
            has_error = True

            detected_line = static_err.get("line")

            effective_error = (
                f"{static_err['error_type']}: "
                f"{static_err['error_message']}"
            )

        # ---------------------------------------------------------
        # 6. User supplied an error message
        # ---------------------------------------------------------
        elif effective_error:
            has_error = True

            # Try to extract line number.
            line_match = re.search(
                r"(?:line|Line)\s+(\d+)",
                effective_error,
            )

            if line_match:
                detected_line = int(line_match.group(1))

            # Try to identify a variable from NameError.
            if detected_line is None:
                var_match = re.search(
                    r"name\s+['\"]([^'\"]+)['\"]",
                    effective_error,
                    re.IGNORECASE,
                )

                if var_match:
                    var_name = var_match.group(1)

                    for i, source_line in enumerate(
                        code.splitlines(),
                        start=1,
                    ):
                        if var_name in source_line:
                            detected_line = i
                            break

        # ---------------------------------------------------------
        # 7. Determine whether code is valid BEFORE calling LLM
        # ---------------------------------------------------------
        code_is_valid = not has_error

        # ---------------------------------------------------------
        # 8. AI / RAG analysis
        # ---------------------------------------------------------
        try:
            ai_result: CodeAnalysisResult = llm_service.analyze_code(
                language="Python",
                code=code,
                error_message=effective_error,
                top_k=3,
            )

        except Exception as exc:
            return AnalyzeResponse(
                success=False,
                error_type="AIAnalysisError",
                error_message=str(exc),
                line=detected_line,
                explanation=(
                    f"Could not complete AI analysis: {str(exc)}"
                ),
                concept="Error Handling",
                corrected_code=code,
                learning_tip=(
                    "Check that your cloud LLM credentials are configured "
                    "correctly and that your internet connection is active."
                ),
                practice_question=None,
                sources=[],
                stdout="",
                stderr="",
            )

        # ---------------------------------------------------------
        # 9. Convert RAG sources
        # ---------------------------------------------------------
        sources_schemas = [
            SourceItemSchema(
                source=source.source,
                score=source.score,
            )
            for source in getattr(ai_result, "sources", [])
        ]

        # ---------------------------------------------------------
        # 10. SUCCESS RESPONSE
        #
        # IMPORTANT:
        # The backend decides whether the code is valid.
        # We do NOT depend on ai_result.error_type.
        # ---------------------------------------------------------
        if code_is_valid:
            return AnalyzeResponse(
                success=True,
                error_type=None,
                error_message=None,
                line=None,
                explanation=ai_result.explanation,
                concept=ai_result.concept,
                corrected_code=ai_result.corrected_code or code,
                learning_tip=ai_result.learning_tip,
                practice_question=ai_result.practice_question,
                sources=sources_schemas,
                stdout="",
                stderr="",
            )

        # ---------------------------------------------------------
        # 11. ERROR RESPONSE
        # ---------------------------------------------------------
        return AnalyzeResponse(
            success=False,
            error_type=ai_result.error_type,
            error_message=effective_error or ai_result.error_type,
            line=detected_line,
            explanation=ai_result.explanation,
            cause=ai_result.cause,
            concept=ai_result.concept,
            corrected_code=ai_result.corrected_code,
            learning_tip=ai_result.learning_tip,
            practice_question=ai_result.practice_question,
            sources=sources_schemas,
            stdout="",
            stderr=effective_error,
        )


# Singleton instance
analyzer_service = CodeAnalyzerService()