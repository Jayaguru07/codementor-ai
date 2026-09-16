import ast
import re
from typing import Dict, Any, Optional

class ErrorParser:
    """
    Parses Python source code syntax and execution tracebacks.
    Extracts error type, error message, and line number when possible.
    """
    
    @staticmethod
    def check_syntax(code: str) -> Optional[Dict[str, Any]]:
        """
        Statically checks Python syntax using AST.
        Returns error dict if syntax error exists, or None if syntax is valid.
        """
        try:
            ast.parse(code)
            return None
        except SyntaxError as e:
            error_type = e.__class__.__name__
            msg = e.msg or str(e)
            line = e.lineno or 1
            return {
                "error_type": error_type,
                "error_message": msg,
                "line": line
            }

    @staticmethod
    def parse_traceback(stderr: str) -> Dict[str, Any]:
        """
        Parses Python error traceback from subprocess stderr.
        Extracts error_type, error_message, and line number.
        """
        if not stderr or not stderr.strip():
            return {
                "error_type": "UnknownError",
                "error_message": "An unspecified error occurred during code execution.",
                "line": 1
            }

        lines = [line.strip() for line in stderr.strip().splitlines() if line.strip()]
        last_line = lines[-1]

        # Extract ErrorType and ErrorMessage from last line (e.g., "NameError: name 'x' is not defined")
        if ":" in last_line:
            parts = last_line.split(":", 1)
            error_type = parts[0].strip()
            error_message = parts[1].strip()
        else:
            error_type = last_line
            error_message = last_line

        # Extract line number from traceback (e.g., File "...", line 3, in <module>)
        line_num = 1
        for line in reversed(lines[:-1]):
            match = re.search(r'File ".*?", line (\d+)', line)
            if match:
                line_num = int(match.group(1))
                break

        return {
            "error_type": error_type,
            "error_message": error_message,
            "line": line_num
        }

error_parser = ErrorParser()
