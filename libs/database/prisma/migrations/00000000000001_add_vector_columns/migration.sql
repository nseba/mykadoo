-- Add vector columns for semantic search and recommendations
-- Requires pgvector extension to be enabled first

-- Add embedding column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);

-- Add query embedding column to searches table
ALTER TABLE "searches" ADD COLUMN IF NOT EXISTS "query_embedding" vector(1536);

-- Add preference embedding column to user_profiles table
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "preference_embedding" vector(1536);

-- Create HNSW index for product embeddings (faster but uses more memory)
-- HNSW parameters: m = number of connections per layer, ef_construction = search breadth during build
CREATE INDEX IF NOT EXISTS "products_embedding_hnsw_idx"
ON "products" USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create IVFFlat index for search query embeddings (more memory efficient)
-- Lists = number of clusters (sqrt of expected rows is a good starting point)
CREATE INDEX IF NOT EXISTS "searches_query_embedding_ivfflat_idx"
ON "searches" USING ivfflat ("query_embedding" vector_cosine_ops)
WITH (lists = 100);

-- Create IVFFlat index for user preference embeddings
CREATE INDEX IF NOT EXISTS "user_profiles_preference_embedding_ivfflat_idx"
ON "user_profiles" USING ivfflat ("preference_embedding" vector_cosine_ops)
WITH (lists = 100);

-- Create SQL functions for similarity search

-- Find similar products by vector similarity
CREATE OR REPLACE FUNCTION find_similar_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  category_filter text DEFAULT NULL,
  min_price float DEFAULT NULL,
  max_price float DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price float,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price::float,
    p.category,
    (1 - (p.embedding <=> query_embedding))::float AS similarity
  FROM products p
  WHERE
    p.embedding IS NOT NULL
    AND p.is_active = true
    AND (1 - (p.embedding <=> query_embedding)) > match_threshold
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Find similar search queries
CREATE OR REPLACE FUNCTION find_similar_queries(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  query text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.query,
    (1 - (s.query_embedding <=> query_embedding))::float AS similarity
  FROM searches s
  WHERE
    s.query_embedding IS NOT NULL
    AND (1 - (s.query_embedding <=> query_embedding)) > match_threshold
  ORDER BY s.query_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Hybrid search combining full-text and vector similarity
CREATE OR REPLACE FUNCTION hybrid_search_products(
  search_query text,
  query_embedding vector(1536),
  keyword_weight float DEFAULT 0.3,
  semantic_weight float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price float,
  category text,
  keyword_score float,
  semantic_score float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH keyword_matches AS (
    SELECT
      p.id,
      p.title,
      p.description,
      p.price::float,
      p.category,
      ts_rank(
        to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, '')),
        plainto_tsquery('english', search_query)
      )::float AS keyword_rank
    FROM products p
    WHERE
      p.is_active = true
      AND to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
          @@ plainto_tsquery('english', search_query)
  ),
  semantic_matches AS (
    SELECT
      p.id,
      (1 - (p.embedding <=> query_embedding))::float AS semantic_rank
    FROM products p
    WHERE
      p.is_active = true
      AND p.embedding IS NOT NULL
  )
  SELECT
    COALESCE(k.id, s_match.id) AS id,
    COALESCE(k.title, (SELECT title FROM products WHERE id = s_match.id)) AS title,
    COALESCE(k.description, (SELECT description FROM products WHERE id = s_match.id)) AS description,
    COALESCE(k.price, (SELECT price::float FROM products WHERE id = s_match.id)) AS price,
    COALESCE(k.category, (SELECT category FROM products WHERE id = s_match.id)) AS category,
    COALESCE(k.keyword_rank, 0.0)::float AS keyword_score,
    COALESCE(s_match.semantic_rank, 0.0)::float AS semantic_score,
    (
      keyword_weight * COALESCE(k.keyword_rank, 0.0) +
      semantic_weight * COALESCE(s_match.semantic_rank, 0.0)
    )::float AS combined_score
  FROM keyword_matches k
  FULL OUTER JOIN semantic_matches s_match ON k.id = s_match.id
  WHERE k.id IS NOT NULL OR s_match.id IS NOT NULL
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;
