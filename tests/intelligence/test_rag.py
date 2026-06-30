"""Tests for RAG foundation components."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


@pytest.fixture(autouse=True)
def reset_rag_state():
    from backend.intelligence.rag.vector_store import reset_collection
    reset_collection()
    yield
    reset_collection()


class TestDocumentLoader:
    def test_load_all_documents_returns_list(self):
        from backend.intelligence.rag.document_loader import load_all_documents
        docs = load_all_documents()
        assert isinstance(docs, list)

    def test_knowledge_document_has_required_fields(self):
        from backend.intelligence.rag.document_loader import KnowledgeDocument
        doc = KnowledgeDocument(id="test", content="test content", metadata={}, source="test.csv")
        assert doc.id == "test"
        assert doc.content == "test content"
        assert doc.metadata == {}
        assert doc.source == "test.csv"


class TestEmbeddingService:
    def test_embed_text_returns_float_list(self):
        from backend.intelligence.rag.embedding_service import embed_text
        vec = embed_text("test strategy")
        assert isinstance(vec, list)
        assert len(vec) > 0
        assert all(isinstance(v, float) for v in vec)

    def test_embed_batch_returns_matching_count(self):
        from backend.intelligence.rag.embedding_service import embed_batch
        texts = ["strategy one", "strategy two"]
        vecs = embed_batch(texts)
        assert len(vecs) == 2

    def test_similar_texts_have_similar_embeddings(self):
        from backend.intelligence.rag.embedding_service import embed_text
        import math
        v1 = embed_text("aggressive two-stop strategy for Monaco")
        v2 = embed_text("conservative one-stop strategy at Monaco")
        dot = sum(a * b for a, b in zip(v1, v2))
        mag = math.sqrt(sum(a * a for a in v1)) * math.sqrt(sum(b * b for b in v2))
        similarity = dot / mag if mag > 0 else 0
        v3 = embed_text("weather forecast for London tomorrow")
        dot3 = sum(a * b for a, b in zip(v1, v3))
        mag3 = math.sqrt(sum(a * a for a in v1)) * math.sqrt(sum(b * b for b in v3))
        similarity_unrelated = dot3 / mag3 if mag3 > 0 else 0
        assert similarity > 0.6, f"Similar texts should have high similarity, got {similarity}"
        assert similarity > similarity_unrelated, f"Related texts ({similarity}) should be more similar than unrelated ({similarity_unrelated})"


class TestVectorStore:
    def test_index_and_query_returns_results(self):
        from backend.intelligence.rag.document_loader import KnowledgeDocument
        from backend.intelligence.rag.vector_store import index_documents, query_similar
        docs = [
            KnowledgeDocument(id="t1", content="Monaco is a street circuit with tight corners", metadata={"type": "test"}, source="test"),
            KnowledgeDocument(id="t2", content="Silverstone has high speed corners", metadata={"type": "test"}, source="test"),
        ]
        count = index_documents(docs)
        assert count == 2
        results = query_similar("street circuit", n_results=2)
        assert len(results) > 0
        assert "id" in results[0]
        assert "document" in results[0]
        assert "score" in results[0]

    def test_query_on_empty_store_handled_gracefully(self):
        from backend.intelligence.rag.vector_store import query_similar
        results = query_similar("anything", n_results=1)
        assert isinstance(results, list)

    def test_reset_collection_works(self):
        from backend.intelligence.rag.document_loader import KnowledgeDocument
        from backend.intelligence.rag.vector_store import index_documents, reset_collection, collection_size
        index_documents([KnowledgeDocument(id="r", content="reset test", metadata={}, source="test")])
        assert collection_size() > 0
        reset_collection()
        assert collection_size() == 0


class TestReranker:
    def test_rerank_returns_ordered_results(self):
        from backend.intelligence.rag.reranker import rerank_results
        results = [
            {"id": "a", "document": "Monaco race strategy", "score": 0.5, "metadata": {"circuit": "Monaco"}},
            {"id": "b", "document": "Silverstone weather", "score": 0.8, "metadata": {"circuit": "Silverstone"}},
        ]
        reranked = rerank_results("Monaco strategy", results, top_k=2)
        assert len(reranked) == 2
        assert reranked[0]["id"] == "a"

    def test_rerank_empty_input(self):
        from backend.intelligence.rag.reranker import rerank_results
        assert rerank_results("query", []) == []


class TestContextBuilder:
    def test_build_context_with_results(self):
        from backend.intelligence.rag.context_builder import build_context
        retrieved = [
            {"document": "Monaco 2023 race", "metadata": {"circuit": "Monaco", "strategy": "one stop", "season": "2023", "source": "data.csv", "type": "historical_race"}},
        ]
        ctx = build_context(retrieved, "Monaco")
        assert ctx["document_count"] == 1
        assert "Monaco" in ctx["summary"]

    def test_build_context_empty(self):
        from backend.intelligence.rag.context_builder import build_context
        ctx = build_context([], "query")
        assert ctx["document_count"] == 0
        assert ctx["summary"] == ""


class TestRetriever:
    def test_ensure_indexed_does_not_crash(self):
        from backend.intelligence.rag.retriever import ensure_indexed
        ensure_indexed()

    def test_retrieve_context_returns_list(self):
        from backend.intelligence.rag.retriever import retrieve_context
        results = retrieve_context("test query", n_results=2)
        assert isinstance(results, list)
