from app.models.schemas import AnalyzeResponse
from app.services.execution_service import execution_service
from app.utils.error_parser import error_parser
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

class CodeAnalyzerService:
    """
    Core Code Mentor Analyzer Orchestrator.
    Combines code validation, subprocess sandbox execution, error parsing, RAG concept retrieval,
    and LLM explanation generation.
    """

    async def analyze(self, language: str, code: str) -> AnalyzeResponse:
        lang_normalized = (language or "").strip().lower()

        # Enforce Python support requirement
        if lang_normalized != "python":
            return AnalyzeResponse(
                success=False,
                error_type="UnsupportedLanguage",
                error_message="Currently only Python is supported.",
                line=None,
                explanation="CodeMentor AI currently supports Python code analysis.",
                concept="Supported Languages",
                corrected_code=None,
                learning_tip="Select Python as your target programming language."
            )

        # 1. AST Syntax Check
        syntax_err = error_parser.check_syntax(code)
        if syntax_err:
            query = f"{syntax_err['error_type']}: {syntax_err['error_message']}"
            rag_concept = rag_service.retrieve_concept(query=query, error_type=syntax_err['error_type'])
            
            llm_result = await llm_service.generate_explanation(
                code=code,
                language="python",
                success=False,
                error_type=syntax_err["error_type"],
                error_message=syntax_err["error_message"],
                line=syntax_err["line"],
                rag_concept=rag_concept
            )

            return AnalyzeResponse(
                success=False,
                error_type=syntax_err["error_type"],
                error_message=syntax_err["error_message"],
                line=syntax_err["line"],
                explanation=llm_result["explanation"],
                concept=llm_result["concept"],
                corrected_code=llm_result["corrected_code"],
                learning_tip=llm_result["learning_tip"],
                stdout="",
                stderr=f"SyntaxError: {syntax_err['error_message']}"
            )

        # 2. Execution Analysis
        exec_res = execution_service.execute_python(code)

        if exec_res["returncode"] != 0 or exec_res["timed_out"]:
            parsed_err = error_parser.parse_traceback(exec_res["stderr"])
            query = f"{parsed_err['error_type']}: {parsed_err['error_message']}"
            rag_concept = rag_service.retrieve_concept(query=query, error_type=parsed_err['error_type'])

            llm_result = await llm_service.generate_explanation(
                code=code,
                language="python",
                success=False,
                error_type=parsed_err["error_type"],
                error_message=parsed_err["error_message"],
                line=parsed_err["line"],
                rag_concept=rag_concept
            )

            return AnalyzeResponse(
                success=False,
                error_type=parsed_err["error_type"],
                error_message=parsed_err["error_message"],
                line=parsed_err["line"],
                explanation=llm_result["explanation"],
                concept=llm_result["concept"],
                corrected_code=llm_result["corrected_code"],
                learning_tip=llm_result["learning_tip"],
                stdout=exec_res["stdout"],
                stderr=exec_res["stderr"]
            )

        # 3. Successful Code Execution
        llm_result = await llm_service.generate_explanation(
            code=code,
            language="python",
            success=True,
            rag_concept={"name": "Clean Code", "learning_tip": "Keep variable names clear and maintain clean formatting."}
        )

        return AnalyzeResponse(
            success=True,
            error_type=None,
            error_message=None,
            line=None,
            explanation=llm_result["explanation"],
            concept=llm_result["concept"],
            corrected_code=code,
            learning_tip=llm_result["learning_tip"],
            stdout=exec_res["stdout"],
            stderr=""
        )

analyzer_service = CodeAnalyzerService()
