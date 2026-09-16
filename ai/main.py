"""Standalone Demonstration Runner for CodeMentor AI.

This CLI script demonstrates the entire LLM + RAG pipeline end-to-end:
1. Validates that the FAISS vector database exists.
2. Formats a demo student debugging scenario (IndexError on a 3-item list).
3. Executes RAG similarity search to retrieve top knowledge chunks.
4. Checks for LLM_API_KEY configuration:
   - If missing: Displays retrieved RAG context and instructions on setting up .env without crashing.
   - If present: Calls the Cloud LLM API, validates structured output, and prints the complete analysis.

Usage:
  python ai/main.py
or from the repository root:
  python ai/main.py
"""

import json
import os
import sys
from pathlib import Path

# Ensure the 'ai' directory is in Python's module search path
AI_DIR = Path(__file__).resolve().parent
if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

from prompts import CodeAnalysisResult
from rag import INDEX_FILE, METADATA_FILE, RAGEngine
from llm_service import LLMService


def print_banner(title: str) -> None:
    """Prints a styled visual section banner."""
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)


def run_demo() -> None:
    """Executes the test scenario and prints readable progress to terminal."""
    print_banner("CodeMentor AI — Pipeline Demonstration")

    # 1. Verify Vector Database Existence
    if not INDEX_FILE.exists() or not METADATA_FILE.exists():
        print("\n[!] Vector Database Not Found!")
        print(f"    Expected: {INDEX_FILE}")
        print(f"              {METADATA_FILE}")
        print("\n    Please build the knowledge base index first by running:")
        print("      python ai/ingest.py\n")
        return

    # 2. Define Demo Scenario
    language = "Python"
    code = "numbers = [10, 20, 30]\nprint(numbers[5])"
    error_message = "IndexError: list index out of range"

    print("\n[+] Student Problem Submission:")
    print(f"    Language: {language}")
    print("    Code:")
    for line in code.splitlines():
        print(f"      {line}")
    print(f"    Error:    {error_message}")

    # 3. Perform RAG Retrieval
    print_banner("Step 1: RAG Knowledge Retrieval")
    engine = RAGEngine()
    try:
        retrieved_chunks = engine.retrieve_for_error(
            language=language,
            code=code,
            error_message=error_message,
            top_k=3,
        )
        print(f"Successfully retrieved {len(retrieved_chunks)} relevant chunk(s):\n")
        for i, chunk in enumerate(retrieved_chunks, 1):
            score_str = f"{chunk['score']:.4f}"
            print(f"  [{i}] Source: {chunk['source']} | Cosine Similarity Score: {score_str}")
            first_line = chunk["text"].split("\n")[0][:80]
            print(f"      Preview: {first_line}...\n")
    except Exception as exc:
        print(f"[-] RAG Retrieval failed: {exc}")
        return

    # 4. Perform LLM Generation
    print_banner("Step 2: Cloud LLM Analysis")
    api_key = os.getenv("LLM_API_KEY", "").strip()

    if not api_key or api_key.lower() == "your_cloud_llm_api_key_here":
        print("[i] LLM_API_KEY is not configured.")
        print("    RAG retrieval succeeded completely above!")
        print("\n    To run the Cloud LLM generation step:")
        print("    1. Copy ai/.env.example to ai/.env:")
        print("         copy ai\\.env.example ai\\.env   (Windows)")
        print("         cp ai/.env.example ai/.env     (Linux/Mac)")
        print("    2. Open ai/.env and set your LLM_API_KEY.")
        print("    3. Re-run: python ai/main.py\n")
        return

    print("Sending prompt with retrieved RAG context to Cloud LLM API...")
    service = LLMService(rag_engine=engine)

    try:
        result: CodeAnalysisResult = service.analyze_code(
            language=language,
            code=code,
            error_message=error_message,
            top_k=3,
        )

        print_banner("Step 3: Structured AI Mentor Response")
        print(f"• Concept:           {result.concept}")
        print(f"• Error Type:        {result.error_type}")
        print(f"\n• Explanation:\n  {result.explanation}")
        print(f"\n• Root Cause:\n  {result.cause}")
        print("\n• Corrected Code:")
        for line in result.corrected_code.splitlines():
            print(f"    {line}")
        print(f"\n• Learning Tip:\n  {result.learning_tip}")
        print(f"\n• Practice Question:\n  {result.practice_question}")

        print("\n• Attributed Sources:")
        for src in result.sources:
            print(f"  - {src.source} (score: {src.score:.4f})")

        print("\n" + "=" * 65)
        print("  Demo completed successfully!")
        print("=" * 65 + "\n")

    except Exception as exc:
        print(f"[-] LLM Analysis failed: {exc}")


if __name__ == "__main__":
    run_demo()
