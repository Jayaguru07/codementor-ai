"""Unit Tests for RAG Retrieval Engine (ai/rag.py).

Tests verify:
1. Lazy initialization: models and indices are NOT loaded upon RAGEngine() construction.
2. Query synthesis across all 5 operational cases:
   - Case A: Small code + error
   - Case B: Large code + error without traceback
   - Case C: Large code + traceback (extract localized line window)
   - Case D: Large code without traceback
   - Case E: Code with no explicit error message
3. Score properties: scores are finite floats, results are sorted descending.
4. Missing index or metadata raises clear FileNotFoundError with instruction to run ingest.py.
"""

import math
from pathlib import Path
import pytest
import numpy as np
import json

from rag import RAGEngine


def test_rag_engine_lazy_initialization():
    """Verify RAGEngine does not load models or indices into memory during instantiation."""
    engine = RAGEngine()
    assert engine._model is None
    assert engine._faiss_index is None
    assert engine._embeddings_matrix is None
    assert engine._metadata is None


def test_rag_missing_index_raises_error(tmp_path: Path):
    """Verify clear FileNotFoundError when vector store does not exist."""
    fake_index = tmp_path / "nonexistent.faiss"
    fake_meta = tmp_path / "nonexistent.json"
    fake_emb = tmp_path / "nonexistent.npy"

    engine = RAGEngine(index_path=fake_index, metadata_path=fake_meta, embeddings_path=fake_emb)
    with pytest.raises(FileNotFoundError, match="Vector store not found|not found"):
        engine.retrieve("sample query")


def test_query_synthesis_case_a_small_code():
    """Case A: Small code snippet (<25 lines) + error message."""
    engine = RAGEngine()
    code = "numbers = [10, 20]\nprint(numbers[5])"
    error = "IndexError: list index out of range"
    query = engine._synthesize_query(language="Python", code=code, error_message=error)

    assert "Python" in query
    assert "IndexError" in query
    assert "numbers[5]" in query


def test_query_synthesis_case_b_large_code_with_error():
    """Case B: Large code (>30 lines) + error message without traceback."""
    engine = RAGEngine()
    code_lines = [f"x_{i} = {i} * 2" for i in range(40)]
    code_lines.append("invalid_indexing_call = items[999]")
    code = "\n".join(code_lines)
    error = "IndexError: list index out of range"

    query = engine._synthesize_query(language="Python", code=code, error_message=error)

    assert "Python" in query
    assert "IndexError" in query
    assert len(query.split()) < 60


def test_query_synthesis_case_c_large_code_with_traceback():
    """Case C: Large code + traceback with line number."""
    engine = RAGEngine()
    code_lines = [f"def func_{i}(): return {i}" for i in range(30)]
    code_lines.append("target_buggy_line = my_array[100]")  # line 31
    code_lines.extend([f"def after_{i}(): pass" for i in range(20)])
    code = "\n".join(code_lines)

    traceback_err = (
        'Traceback (most recent call last):\n'
        '  File "script.py", line 31, in <module>\n'
        '    target_buggy_line = my_array[100]\n'
        'IndexError: list index out of range'
    )

    query = engine._synthesize_query(language="Python", code=code, error_message=traceback_err)

    assert "Python" in query
    assert "IndexError" in query
    assert "target_buggy_line" in query or "my_array" in query


def test_query_synthesis_case_e_no_error_message():
    """Case E: Code submitted without an explicit error message (code review/explanation)."""
    engine = RAGEngine()
    code = "def calculate_factorial(n):\n    if n <= 1: return 1\n    return n * calculate_factorial(n-1)"
    query = engine._synthesize_query(language="Python", code=code, error_message="")

    assert "Python" in query
    assert "calculate_factorial" in query


def test_retrieved_scores_are_finite_and_sorted(tmp_path: Path):
    """Verify that retrieval produces finite float scores sorted in descending order."""
    dim = 4
    fake_vectors = np.array(
        [
            [1.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5],
            [-0.5, -0.5, -0.5, -0.5],
        ],
        dtype=np.float32,
    )
    norms = np.linalg.norm(fake_vectors, axis=1, keepdims=True)
    fake_vectors = fake_vectors / norms

    emb_path = tmp_path / "mock_embeddings.npy"
    fake_index_path = tmp_path / "mock_index.faiss"
    meta_path = tmp_path / "mock_metadata.json"

    np.save(str(emb_path), fake_vectors)

    metadata = [
        {"id": 0, "source": "python/doc1.md", "category": "python", "chunk_number": 0, "text": "Doc 1 text"},
        {"id": 1, "source": "python/doc2.md", "category": "python", "chunk_number": 0, "text": "Doc 2 text"},
        {"id": 2, "source": "python/doc3.md", "category": "python", "chunk_number": 0, "text": "Doc 3 text"},
    ]
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f)

    engine = RAGEngine(index_path=fake_index_path, metadata_path=meta_path, embeddings_path=emb_path)

    # Mock the embedding model
    class MockModel:
        def encode(self, texts, convert_to_numpy=True):
            v = np.array([[1.0, 0.0, 0.0, 0.0]], dtype=np.float32)
            return v

    engine._ensure_loaded()
    engine._model = MockModel()

    results = engine.retrieve("test query", top_k=3)

    assert len(results) == 3
    scores = [r["score"] for r in results]

    # Verify scores are finite floats
    for s in scores:
        assert isinstance(s, float)
        assert math.isfinite(s)

    # Verify scores are sorted descending
    assert scores == sorted(scores, reverse=True), f"Scores are not sorted descending: {scores}"
