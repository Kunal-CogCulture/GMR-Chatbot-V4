-- Run this SQL in your Supabase SQL Editor to set up the vector store
-- ⚠️ If you previously ran this, drop the old table first:
-- DROP TABLE IF EXISTS embeddings;
-- DROP FUNCTION IF EXISTS match_embeddings;

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the embeddings table
-- mistral-embed produces 1024-dimensional vectors
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  embedding vector(1024),
  metadata JSONB
);

-- 3. Create an HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx
  ON embeddings USING hnsw (embedding vector_cosine_ops);

-- 4. Create the match function used by the retriever
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
