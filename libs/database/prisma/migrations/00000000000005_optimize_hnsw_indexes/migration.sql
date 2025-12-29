-- Migration: Optimize HNSW Indexes for Performance
-- Description: Improves index parameters and adds query caching infrastructure

-- Drop existing HNSW indexes to recreate with optimized parameters
DROP INDEX IF EXISTS idx_products_embedding_hnsw;
DROP INDEX IF EXISTS idx_user_profiles_embedding_hnsw;

-- Recreate product embedding index with optimized parameters
-- m=24 (default 16): More connections for better recall
-- ef_construction=100 (default 64): Better index quality
CREATE INDEX idx_products_embedding_hnsw
    ON products
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 24, ef_construction = 100);

-- Recreate user profile embedding index
CREATE INDEX IF NOT EXISTS idx_user_profiles_embedding_hnsw
    ON user_profiles
    USING hnsw (preference_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Create query cache table for storing popular query results
CREATE TABLE IF NOT EXISTS query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    result_ids TEXT[] NOT NULL,
    result_scores FLOAT[] NOT NULL,
    hit_count INTEGER DEFAULT 1,
    last_hit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for cache key lookup
CREATE INDEX IF NOT EXISTS idx_query_cache_key
    ON query_cache(cache_key);

-- Index for cache expiration cleanup
CREATE INDEX IF NOT EXISTS idx_query_cache_expires
    ON query_cache(expires_at);

-- Index for popular queries (for warming cache)
CREATE INDEX IF NOT EXISTS idx_query_cache_hits
    ON query_cache(hit_count DESC);

-- Create benchmark results table
CREATE TABLE IF NOT EXISTS benchmark_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation TEXT NOT NULL,
    dataset_size INTEGER NOT NULL,
    iterations INTEGER NOT NULL,
    avg_latency_ms FLOAT NOT NULL,
    p50_latency_ms FLOAT NOT NULL,
    p95_latency_ms FLOAT NOT NULL,
    p99_latency_ms FLOAT NOT NULL,
    min_latency_ms FLOAT NOT NULL,
    max_latency_ms FLOAT NOT NULL,
    throughput_ops_per_sec FLOAT NOT NULL,
    memory_usage_mb FLOAT NOT NULL,
    index_stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for benchmark result analysis
CREATE INDEX IF NOT EXISTS idx_benchmark_results_operation
    ON benchmark_results(operation, created_at DESC);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM query_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get or update cache entry
CREATE OR REPLACE FUNCTION get_or_update_cache(
    p_cache_key TEXT,
    p_query_text TEXT,
    p_query_embedding vector(1536),
    p_result_ids TEXT[],
    p_result_scores FLOAT[],
    p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS TABLE (
    cache_hit BOOLEAN,
    result_ids TEXT[],
    result_scores FLOAT[]
) AS $$
DECLARE
    existing_record query_cache%ROWTYPE;
BEGIN
    -- Try to find existing cache entry
    SELECT * INTO existing_record
    FROM query_cache
    WHERE cache_key = p_cache_key
    AND expires_at > NOW();

    IF FOUND THEN
        -- Update hit count
        UPDATE query_cache
        SET hit_count = hit_count + 1,
            last_hit_at = NOW()
        WHERE id = existing_record.id;

        RETURN QUERY SELECT
            TRUE,
            existing_record.result_ids,
            existing_record.result_scores;
    ELSE
        -- Insert new cache entry
        INSERT INTO query_cache (
            cache_key,
            query_text,
            query_embedding,
            result_ids,
            result_scores,
            expires_at
        ) VALUES (
            p_cache_key,
            p_query_text,
            p_query_embedding,
            p_result_ids,
            p_result_scores,
            NOW() + (p_ttl_seconds || ' seconds')::interval
        )
        ON CONFLICT (cache_key) DO UPDATE SET
            result_ids = EXCLUDED.result_ids,
            result_scores = EXCLUDED.result_scores,
            hit_count = query_cache.hit_count + 1,
            last_hit_at = NOW(),
            expires_at = EXCLUDED.expires_at;

        RETURN QUERY SELECT FALSE, p_result_ids, p_result_scores;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Set optimal HNSW search parameters for production
-- ef_search controls accuracy vs speed tradeoff at query time
-- Higher values = better accuracy but slower queries
DO $$
BEGIN
    -- Set session-level ef_search (will be overridden by application if needed)
    EXECUTE 'SET hnsw.ef_search = 60';
EXCEPTION
    WHEN OTHERS THEN
        -- hnsw.ef_search might not be available in all versions
        NULL;
END $$;

-- Comment on tables
COMMENT ON TABLE query_cache IS 'Cache for frequently executed similarity search queries';
COMMENT ON TABLE benchmark_results IS 'Historical benchmark results for performance tracking';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries, returns count of deleted rows';
COMMENT ON FUNCTION get_or_update_cache IS 'Gets cached result or inserts new entry with TTL';
