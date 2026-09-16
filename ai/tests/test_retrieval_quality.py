"""RAG Retrieval Quality Sanity Evaluation Suite.

NOTE FOR VIVA & EVALUATION:
This test suite performs a lightweight retrieval sanity check across five fundamental
programming error categories to ensure that our FAISS vector database retrieves relevant
knowledge chunks.

This is NOT an exhaustive benchmark or accuracy percentage claim; it is a sanity check
to verify that:
1. Retrieval returns non-empty results from the knowledge base.
2. Returned sources exist and text content is meaningful.
3. Top-ranked chunks contain relevant conceptual keywords.
4. Chunks are strictly sorted descending by similarity score.
"""

from pathlib import Path
import pytest

from rag import INDEX_FILE, METADATA_FILE, RAGEngine

# Skip entire suite if vector store has not been generated yet
pytestmark = pytest.mark.skipif(
    not INDEX_FILE.exists() or not METADATA_FILE.exists(),
    reason="Vector store not built yet. Run 'python ai/ingest.py' to generate.",
)


@pytest.fixture(scope="module")
def rag_engine_instance():
    """Shared RAGEngine instance for retrieval evaluation."""
    return RAGEngine()


@pytest.mark.parametrize(
    "query_name, language, code, error_message, expected_keywords",
    [
        (
            "1. List Indexing / IndexError",
            "Python",
            "numbers = [10, 20, 30]\nprint(numbers[5])",
            "IndexError: list index out of range",
            ["index", "list", "indexing", "range", "out of range"],
        ),
        (
            "2. Undefined Variable / NameError",
            "Python",
            "x = 10\nprint(y)",
            "NameError: name 'y' is not defined",
            ["nameerror", "variable", "defined", "scope", "assign"],
        ),
        (
            "3. Zero Division / Exceptions",
            "Python",
            "result = 10 / 0",
            "ZeroDivisionError: division by zero",
            ["zerodivisionerror", "division", "zero", "exception", "try"],
        ),
        (
            "4. Loops / Off-by-one errors",
            "Python",
            "for i in range(len(items) + 1):\n    print(items[i])",
            "IndexError: list index out of range",
            ["loop", "range", "off-by-one", "index", "iteration"],
        ),
        (
            "5. Functions / Parameters and Scope",
            "Python",
            "def calculate(a, b):\n    total = a + b\nprint(total)",
            "NameError: name 'total' is not defined",
            ["function", "scope", "parameter", "return", "local"],
        ),
    ],
)
def test_retrieval_quality_sanity_check(
    rag_engine_instance: RAGEngine,
    query_name: str,
    language: str,
    code: str,
    error_message: str,
    expected_keywords: list,
):
    """Verifies that retrieval returns valid, sorted, and semantically relevant chunks."""
    results = rag_engine_instance.retrieve_for_error(
        language=language,
        code=code,
        error_message=error_message,
        top_k=3,
    )

    # 1. Verify results are returned
    assert len(results) > 0, f"[{query_name}] Expected at least 1 retrieved chunk, got 0."

    # 2. Verify results are sorted descending by similarity score
    scores = [r["score"] for r in results]
    assert scores == sorted(scores, reverse=True), f"[{query_name}] Scores are not sorted descending: {scores}"

    # 3. Verify sources exist and text is non-empty
    for item in results:
        assert item["source"], f"[{query_name}] Missing source field in chunk."
        assert len(item["text"].strip()) > 0, f"[{query_name}] Retrieved chunk text is empty."

    # 4. Check for keyword presence in top retrieved chunks
    combined_top_text = " ".join([r["text"].lower() for r in results[:2]])
    matched_keywords = [kw for kw in expected_keywords if kw in combined_top_text]

    assert len(matched_keywords) > 0, (
        f"[{query_name}] None of the expected conceptual keywords {expected_keywords} "
        f"were found in the top retrieved text snippet:\n'{combined_top_text[:200]}...'"
    )
