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
    def check_static_analysis(code: str) -> Optional[Dict[str, Any]]:
        """
        Statically inspects AST for obvious runtime errors (undefined names, division by zero)
        without executing student code.
        """
        try:
            tree = ast.parse(code)
        except Exception:
            return None

        # Check for division by zero: e.g. 10 / 0
        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)):
                if isinstance(node.right, ast.Constant) and node.right.value == 0:
                    return {
                        "error_type": "ZeroDivisionError",
                        "error_message": "division by zero",
                        "line": getattr(node, "lineno", 1),
                    }
        # Check for obvious out-of-range indexing on literal collections.
        # Example:
        # numbers = [10, 20, 30]
        # print(numbers[5])
        #
        # This is static analysis only; student code is never executed.
        literal_lengths = {}

        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                value = node.value

                length = None

                if isinstance(value, (ast.List, ast.Tuple)):
                    length = len(value.elts)

                elif isinstance(value, ast.Constant) and isinstance(
                    value.value, (str, bytes)
                ):
                    length = len(value.value)

                if length is not None:
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            literal_lengths[target.id] = length

        for node in ast.walk(tree):
            if not isinstance(node, ast.Subscript):
                continue

            index = node.slice

            # Python 3.9+: the index is directly in node.slice.
            if isinstance(index, ast.Constant) and isinstance(index.value, int):
                index_value = index.value

                collection_length = None

                if isinstance(node.value, ast.Name):
                    collection_length = literal_lengths.get(node.value.id)

                elif isinstance(node.value, (ast.List, ast.Tuple)):
                    collection_length = len(node.value.elts)

                elif isinstance(node.value, ast.Constant) and isinstance(
                    node.value.value, (str, bytes)
                ):
                    collection_length = len(node.value.value)

                if collection_length is not None:
                    valid = (
                        -collection_length
                        <= index_value
                        < collection_length
                    )

                    if not valid:
                        return {
                            "error_type": "IndexError",
                            "error_message": "list index out of range",
                            "line": getattr(node, "lineno", 1),
                        }

        # Check for undefined names in top-level script
        import builtins as _py_builtins
        defined_names = set(dir(_py_builtins))
        defined_names.update({"__name__", "__doc__", "__package__", "__file__"})

        # Collect definitions
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                defined_names.add(node.id)
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                defined_names.add(node.name)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    defined_names.add(alias.asname or alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    defined_names.add(alias.asname or alias.name)

        # Check loaded names
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                if node.id not in defined_names:
                    return {
                        "error_type": "NameError",
                        "error_message": f"name '{node.id}' is not defined",
                        "line": getattr(node, "lineno", 1),
                    }

        return None

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
