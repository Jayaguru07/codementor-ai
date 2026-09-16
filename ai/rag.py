"""RAG Retrieval Engine for CodeMentor AI.

This module implements the retrieval phase of Retrieval-Augmented Generation (RAG):
1. Lazy-loads the embedding model and vector index on demand.
2. Synchronizes and validates vector index size against metadata.json.
3. Synthesizes compact, high-signal search queries across 5 code/error scenarios
   (preventing large source files from exceeding embedding token limits or diluting semantics).
4. Computes cosine similarity via inner products on L2-normalized vectors (using FAISS
   or native NumPy cosine matrix multiplication).
5. Returns ranked top-k chunks with real similarity scores.

EDUCATIONAL NOTE FOR VIVA:
- Mathematical Equivalence of FAISS IndexFlatIP and NumPy Inner Product:
  When vectors u and v are L2-normalized (||u|| = 1, ||v|| = 1):
    cos_sim(u, v) = dot(u, v) / (||u|| * ||v||) = dot(u, v)
  FAISS IndexFlatIP computes this exact matrix multiplication in C++.
  In pure NumPy, this is computed as: scores = np.dot(embeddings, query_vec.T).
  Both engines produce the exact same mathematical similarity scores!
"""

import json
import math
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

# -----------------------------------------------------------------------------
# Path Configurations
# -----------------------------------------------------------------------------
AI_DIR = Path(__file__).resolve().parent
VECTOR_STORE_DIR = AI_DIR / "vector_store"
INDEX_FILE = VECTOR_STORE_DIR / "index.faiss"
EMBEDDINGS_FILE = VECTOR_STORE_DIR / "embeddings.npy"
METADATA_FILE = VECTOR_STORE_DIR / "metadata.json"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
VECTOR_DIMENSION = 384


class RAGEngine:
    """Retrieval Engine that queries the vector database for relevant programming knowledge."""

    def __init__(
        self,
        index_path: Path = INDEX_FILE,
        metadata_path: Path = METADATA_FILE,
        embeddings_path: Path = EMBEDDINGS_FILE,
        model_name: str = EMBEDDING_MODEL_NAME,
    ):
        """Initializes RAGEngine with LAZY loading."""
        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)
        self.embeddings_path = Path(embeddings_path)
        self.model_name = model_name

        # Lazy references
        self._model: Optional[Any] = None
        self._faiss_index: Optional[Any] = None
        self._embeddings_matrix: Optional[np.ndarray] = None
        self._metadata: Optional[List[Dict[str, Any]]] = None

    def _ensure_loaded(self) -> None:
        """Lazily loads the embedding model, vector index, and metadata on demand."""
        if (
            self._model is not None
            and (self._faiss_index is not None or self._embeddings_matrix is not None)
            and self._metadata is not None
        ):
            return

        # 1. Verify existence of vector store files
        has_index = self.index_path.exists()
        has_embeddings = self.embeddings_path.exists()

        if not has_index and not has_embeddings:
            raise FileNotFoundError(
                f"Vector store not found at '{self.index_path}'. "
                f"Please build the vector database first by running:\n"
                f"  python ai/ingest.py"
            )

        if not self.metadata_path.exists():
            raise FileNotFoundError(
                f"Metadata file not found at '{self.metadata_path}'. "
                f"Please build the vector database first by running:\n"
                f"  python ai/ingest.py"
            )

        # 2. Load metadata
        try:
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self._metadata = json.load(f)
        except Exception as exc:
            raise RuntimeError(f"Failed to read metadata from {self.metadata_path}: {exc}") from exc

        # 3. Load Vector Store (Try FAISS first, fall back to NumPy matrix)
        num_vectors = 0
        if has_index:
            try:
                import faiss
                self._faiss_index = faiss.read_index(str(self.index_path))
                num_vectors = self._faiss_index.ntotal
            except Exception:
                self._faiss_index = None

        if self._faiss_index is None and has_embeddings:
            try:
                self._embeddings_matrix = np.load(str(self.embeddings_path))
                num_vectors = self._embeddings_matrix.shape[0]
            except Exception as exc:
                raise RuntimeError(f"Failed to load vector embeddings from {self.embeddings_path}: {exc}") from exc

        # 4. Strict Synchronization Check
        if len(self._metadata) != num_vectors:
            raise RuntimeError(
                f"Synchronization mismatch: Metadata contains {len(self._metadata)} records, "
                f"but vector store contains {num_vectors} vectors. "
                f"Please rebuild the vector store cleanly using:\n"
                f"  python ai/ingest.py"
            )

        # 5. Load Embedding Model
        if self._model is None:
            from ingest import get_embedding_generator
            model, _ = get_embedding_generator()
            self._model = model

    def _synthesize_query(
        self,
        language: str,
        code: str,
        error_message: str = "",
    ) -> str:
        """Synthesizes a high-signal search query from student input across 5 operational cases."""
        code_lines = [line for line in code.splitlines() if line.strip()]
        num_lines = len(code_lines)
        num_words = len(code.split())

        is_large = num_lines > 25 or num_words > 120
        relevant_code = ""

        # Case C: Check for traceback line numbers
        line_match = None
        if error_message:
            line_match = re.search(r"line\s+(\d+)", error_message, re.IGNORECASE)

        if is_large and line_match:
            err_line_no = int(line_match.group(1))
            target_idx = max(0, err_line_no - 1)
            start_idx = max(0, target_idx - 3)
            end_idx = min(len(code_lines), target_idx + 4)
            localized_lines = code_lines[start_idx:end_idx]
            relevant_code = " ".join(localized_lines)

        elif is_large and error_message:
            error_keywords = [w.lower() for w in re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", error_message)]
            matching_lines = [
                line for line in code_lines
                if any(kw in line.lower() for kw in error_keywords if len(kw) > 3)
            ]
            if matching_lines:
                relevant_code = " ".join(matching_lines[:5])
            else:
                relevant_code = " ".join(code_lines[:8])

        elif is_large and not error_message:
            def_lines = [line for line in code_lines if line.strip().startswith(("def ", "class ", "for ", "while "))]
            if def_lines:
                relevant_code = " ".join(def_lines[:5])
            else:
                relevant_code = " ".join(code_lines[:8])

        else:
            relevant_code = " ".join(code_lines)

        words = relevant_code.split()
        if len(words) > 40:
            relevant_code = " ".join(words[:40])

        query_parts = [language.strip()]
        if error_message.strip():
            query_parts.append(error_message.strip())
        if relevant_code.strip():
            query_parts.append(relevant_code.strip())

        return " ".join(query_parts)

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Performs similarity search against the vector index."""
        self._ensure_loaded()
        assert self._model is not None
        assert self._metadata is not None

        total_vectors = (
            self._faiss_index.ntotal
            if self._faiss_index is not None
            else (self._embeddings_matrix.shape[0] if self._embeddings_matrix is not None else 0)
        )

        if total_vectors == 0:
            return []

        # 1. Encode query
        query_vec = self._model.encode([query], convert_to_numpy=True)
        query_vec = np.array(query_vec, dtype=np.float32)

        # 2. Normalize query vector for Cosine Similarity
        norm = np.linalg.norm(query_vec)
        if norm > 0:
            query_vec = query_vec / norm

        k = min(top_k, total_vectors)

        # 3. Search using FAISS if available, else NumPy dot product
        if self._faiss_index is not None:
            scores_raw, indices_raw = self._faiss_index.search(query_vec, k)
            scores = scores_raw[0]
            indices = indices_raw[0]
        else:
            assert self._embeddings_matrix is not None
            # Normalized Inner Product = Cosine Similarity
            dot_products = np.dot(self._embeddings_matrix, query_vec.T).flatten()
            indices = np.argsort(-dot_products)[:k]
            scores = dot_products[indices]

        # 4. Construct sorted results
        results: List[Dict[str, Any]] = []
        for score, idx in zip(scores, indices):
            if idx < 0 or idx >= len(self._metadata):
                continue
            meta = self._metadata[idx]
            s_val = float(score)
            if not math.isfinite(s_val):
                s_val = 0.0
            results.append(
                {
                    "id": meta["id"],
                    "source": meta["source"],
                    "category": meta["category"],
                    "chunk_number": meta["chunk_number"],
                    "score": s_val,
                    "text": meta["text"],
                }
            )

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def retrieve_for_error(
        self,
        language: str,
        code: str,
        error_message: str = "",
        top_k: int = 4,
    ) -> List[Dict[str, Any]]:
        """Synthesizes a query for the student's submission and retrieves relevant knowledge."""
        query = self._synthesize_query(language, code, error_message)
        return self.retrieve(query, top_k=top_k)


rag_engine = RAGEngine()


if __name__ == "__main__":
    print("=" * 60)
    print("CodeMentor AI — RAG Engine Standalone Test")
    print("=" * 60)

    demo_language = "Python"
    demo_code = "numbers = [10, 20, 30]\nprint(numbers[5])"
    demo_error = "IndexError: list index out of range"

    print(f"Language: {demo_language}")
    print(f"Code:\n{demo_code}")
    print(f"Error:    {demo_error}\n")

    try:
        engine = RAGEngine()
        retrieved_chunks = engine.retrieve_for_error(
            language=demo_language,
            code=demo_code,
            error_message=demo_error,
            top_k=3,
        )

        print(f"Successfully retrieved {len(retrieved_chunks)} relevant chunk(s):\n")
        for i, chunk in enumerate(retrieved_chunks, 1):
            print(f"[{i}] Source: {chunk['source']} | Cosine Similarity Score: {chunk['score']:.4f}")
            snippet = chunk["text"][:140].replace("\n", " ")
            print(f"    Snippet: {snippet}...\n")

    except FileNotFoundError as fnf_err:
        print(f"Setup Required: {fnf_err}")
    except Exception as err:
        print(f"Error during retrieval: {err}")
