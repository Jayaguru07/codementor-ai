"""Unit Tests for Knowledge Ingestion Pipeline (ai/ingest.py).

Tests verify:
1. Text cleaning normalizes consecutive whitespaces and newlines.
2. Word-based chunking respects chunk sizes and sliding overlap boundaries.
3. Edge cases: empty text, text smaller than chunk size, invalid overlap parameters.
4. Document discovery finds markdown knowledge files in ai/knowledge/.
"""

from pathlib import Path
import pytest

from ingest import (
    KNOWLEDGE_DIR,
    clean_text,
    chunk_text_by_words,
    load_and_chunk_documents,
)


def test_clean_text_normalizes_whitespace():
    """Verify clean_text removes carriage returns and excessive empty lines."""
    raw = "Line 1\r\n\r\n\r\n\r\nLine 2   with   extra   spaces\r\n"
    cleaned = clean_text(raw)
    assert "\r" not in cleaned
    assert "\n\n\n" not in cleaned
    assert "Line 1" in cleaned
    assert "Line 2" in cleaned


def test_chunk_text_small_document():
    """Verify a document smaller than chunk_size produces exactly one chunk."""
    text = "Python is an easy to learn programming language."
    chunks = chunk_text_by_words(text, chunk_size=50, overlap=10)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_empty_input():
    """Verify empty text produces no chunks."""
    assert chunk_text_by_words("", chunk_size=50, overlap=10) == []
    assert chunk_text_by_words("   ", chunk_size=50, overlap=10) == []


def test_chunk_text_overlap_continuity():
    """Verify overlap preserves context across adjacent chunks."""
    words = [f"word_{i}" for i in range(100)]
    text = " ".join(words)
    chunk_size = 30
    overlap = 10

    chunks = chunk_text_by_words(text, chunk_size=chunk_size, overlap=overlap)

    # There should be multiple chunks
    assert len(chunks) > 1

    # Check that chunk 0's end words overlap with chunk 1's beginning words
    chunk_0_words = chunks[0].split()
    chunk_1_words = chunks[1].split()

    overlap_from_0 = chunk_0_words[-overlap:]
    overlap_from_1 = chunk_1_words[:overlap]

    assert overlap_from_0 == overlap_from_1, (
        f"Expected overlapping words to match.\nChunk 0 end: {overlap_from_0}\nChunk 1 start: {overlap_from_1}"
    )


def test_chunk_text_invalid_overlap():
    """Verify overlap greater than or equal to chunk_size raises ValueError."""
    with pytest.raises(ValueError, match="Chunk overlap must be strictly smaller"):
        chunk_text_by_words("sample text", chunk_size=20, overlap=20)


def test_knowledge_base_documents_exist():
    """Verify that required knowledge base markdown files are present in ai/knowledge/python/."""
    expected_files = [
        "indexing.md",
        "loops.md",
        "exceptions.md",
        "functions.md",
        "variables.md",
    ]
    python_dir = KNOWLEDGE_DIR / "python"
    assert python_dir.exists(), f"Directory does not exist: {python_dir}"

    for filename in expected_files:
        filepath = python_dir / filename
        assert filepath.exists(), f"Missing required knowledge file: {filepath}"
        assert filepath.stat().st_size > 0, f"Knowledge file is empty: {filepath}"


def test_load_and_chunk_documents_returns_chunks():
    """Verify load_and_chunk_documents successfully reads and processes knowledge files."""
    chunks = load_and_chunk_documents()
    assert len(chunks) > 0, "Expected chunks to be extracted from knowledge documents."

    first_chunk = chunks[0]
    required_keys = {"id", "source", "category", "chunk_number", "text"}
    assert required_keys.issubset(first_chunk.keys())
    assert first_chunk["category"] == "python"
    assert len(first_chunk["text"].strip()) > 0
