import os
import sys
import tempfile
import subprocess
from typing import Dict, Any
from app.config import settings

class ExecutionService:
    """
    Subprocess sandbox service for executing user Python code in an isolated temporary environment.
    This service is modularized so that it can easily be swapped with Docker or containerized execution in production.
    """
    def __init__(self, timeout: int = None):
        self.timeout = timeout or settings.EXECUTION_TIMEOUT

    def execute_python(self, code: str) -> Dict[str, Any]:
        """
        Executes Python code in a temporary file and returns stdout, stderr, returncode, and timed_out flag.
        """
        # Create a temporary file to hold user code safely
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name

        try:
            # Run using the current python executable with subprocess
            process = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            return {
                "stdout": process.stdout,
                "stderr": process.stderr,
                "returncode": process.returncode,
                "timed_out": False
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"ExecutionTimedOut: Code execution exceeded maximum threshold of {self.timeout} seconds.",
                "returncode": -1,
                "timed_out": True
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"ExecutionError: {str(e)}",
                "returncode": -1,
                "timed_out": False
            }
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

execution_service = ExecutionService()
