-- CreateTable: similarity_events for tracking similarity search analytics
CREATE TABLE IF NOT EXISTS similarity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    source_product_id TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT,
    variant TEXT NOT NULL,
    timestamp TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_similarity_events_timestamp ON similarity_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_similarity_events_event_type ON similarity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_similarity_events_variant ON similarity_events(variant);
CREATE INDEX IF NOT EXISTS idx_similarity_events_source_product ON similarity_events(source_product_id);
CREATE INDEX IF NOT EXISTS idx_similarity_events_user ON similarity_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_similarity_events_session ON similarity_events(session_id) WHERE session_id IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_similarity_events_analytics
ON similarity_events(timestamp, event_type, variant);

-- Add comment
COMMENT ON TABLE similarity_events IS 'Tracks similarity search events for analytics and A/B testing';
