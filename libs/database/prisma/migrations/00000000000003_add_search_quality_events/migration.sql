-- Search Quality Events Table
-- Tracks search quality metrics for semantic search

CREATE TABLE IF NOT EXISTS search_quality_events (
    id SERIAL PRIMARY KEY,
    query_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    query TEXT NOT NULL,
    user_id VARCHAR(50),
    session_id VARCHAR(100),
    product_id VARCHAR(50),
    position INTEGER,
    dwell_time_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for query_id lookups (find all events for a query)
CREATE INDEX IF NOT EXISTS idx_search_quality_events_query_id
ON search_quality_events(query_id);

-- Index for event_type filtering
CREATE INDEX IF NOT EXISTS idx_search_quality_events_event_type
ON search_quality_events(event_type);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_search_quality_events_created_at
ON search_quality_events(created_at);

-- Composite index for metrics aggregation
CREATE INDEX IF NOT EXISTS idx_search_quality_events_type_date
ON search_quality_events(event_type, created_at);

-- Index for user analysis
CREATE INDEX IF NOT EXISTS idx_search_quality_events_user
ON search_quality_events(user_id) WHERE user_id IS NOT NULL;

-- Index for session analysis
CREATE INDEX IF NOT EXISTS idx_search_quality_events_session
ON search_quality_events(session_id) WHERE session_id IS NOT NULL;

-- Index for query text analysis
CREATE INDEX IF NOT EXISTS idx_search_quality_events_query
ON search_quality_events USING gin(to_tsvector('english', query));


-- Searches table for storing query embeddings
-- This extends or creates the searches table with embedding support

DO $$
BEGIN
    -- Check if searches table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'searches') THEN
        CREATE TABLE searches (
            id VARCHAR(50) PRIMARY KEY,
            query TEXT NOT NULL,
            query_embedding vector(1536),
            user_id VARCHAR(50),
            session_id VARCHAR(100),
            result_count INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Index for query embeddings (semantic search on past queries)
        CREATE INDEX IF NOT EXISTS idx_searches_embedding
        ON searches USING hnsw (query_embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);

        -- Index for time-based queries
        CREATE INDEX IF NOT EXISTS idx_searches_created_at
        ON searches(created_at);

        -- Index for user queries
        CREATE INDEX IF NOT EXISTS idx_searches_user
        ON searches(user_id) WHERE user_id IS NOT NULL;
    ELSE
        -- Table exists, add embedding column if not present
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = 'searches' AND column_name = 'query_embedding'
        ) THEN
            ALTER TABLE searches ADD COLUMN query_embedding vector(1536);

            CREATE INDEX IF NOT EXISTS idx_searches_embedding
            ON searches USING hnsw (query_embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
        END IF;
    END IF;
END $$;
