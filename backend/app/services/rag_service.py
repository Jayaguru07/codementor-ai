import json
import os
from typing import Dict, Any, List, Optional
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class RAGService:
    """
    RAG Concept Retrieval Service.
    Loads programming concepts and uses vector similarity search (TF-IDF + Cosine Similarity)
    or keyword matching to find relevant concepts for detected errors.
    """
    def __init__(self, concepts_path: str = None):
        if concepts_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            concepts_path = os.path.join(base_dir, "data", "programming_concepts", "concepts.json")

        self.concepts_path = concepts_path
        self.concepts: List[Dict[str, Any]] = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self._load_concepts()

    def _load_concepts(self):
        if os.path.exists(self.concepts_path):
            with open(self.concepts_path, "r", encoding="utf-8") as f:
                self.concepts = json.load(f)
            
            if SKLEARN_AVAILABLE and self.concepts:
                documents = [
                    f"{c.get('name', '')} {c.get('description', '')} {' '.join(c.get('keywords', []))}"
                    for c in self.concepts
                ]
                self.vectorizer = TfidfVectorizer(stop_words="english")
                self.tfidf_matrix = self.vectorizer.fit_transform(documents)

    def retrieve_concept(self, query: str, error_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieves the best matching concept based on error query text and error type.
        """
        if not self.concepts:
            return {
                "name": "General Programming",
                "description": "General programming logic and structure.",
                "learning_tip": "Review syntax and variable definitions carefully."
            }

        # 1. Exact match by error_type keyword
        if error_type:
            for concept in self.concepts:
                keywords = concept.get("keywords", [])
                if any(error_type.lower() == k.lower() for k in keywords):
                    return concept

        # 2. Vector similarity search if scikit-learn is available
        if SKLEARN_AVAILABLE and self.vectorizer and self.tfidf_matrix is not None:
            try:
                query_vec = self.vectorizer.transform([query])
                sims = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
                best_idx = int(sims.argmax())
                if sims[best_idx] > 0.05:
                    return self.concepts[best_idx]
            except Exception:
                pass

        # 3. Keyword occurrence fallback search
        best_concept = self.concepts[0]
        max_score = -1
        query_lower = query.lower()

        for concept in self.concepts:
            score = 0
            for kw in concept.get("keywords", []):
                if kw.lower() in query_lower:
                    score += 2
            if concept.get("name", "").lower() in query_lower:
                score += 3
            if score > max_score:
                max_score = score
                best_concept = concept

        return best_concept

rag_service = RAGService()
