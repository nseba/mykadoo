-- Migration: Add User Preference Tables
-- Description: Creates tables for user interaction tracking and preference embeddings

-- Create user_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    product_id TEXT,
    search_query TEXT,
    interaction_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
    ON user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_product_id
    ON user_interactions(product_id)
    WHERE product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_interactions_type
    ON user_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at
    ON user_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type_date
    ON user_interactions(user_id, interaction_type, created_at DESC);

-- Create user_profiles table for storing preference embeddings
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    preference_embedding vector(1536),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HNSW index for similarity search on user preference embeddings
CREATE INDEX IF NOT EXISTS idx_user_profiles_embedding_hnsw
    ON user_profiles
    USING hnsw (preference_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Create trending_products table for tracking product popularity
CREATE TABLE IF NOT EXISTS trending_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    category TEXT,
    interaction_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    score FLOAT DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_products_category
    ON trending_products(category);

CREATE INDEX IF NOT EXISTS idx_trending_products_score
    ON trending_products(score DESC);

CREATE INDEX IF NOT EXISTS idx_trending_products_period
    ON trending_products(period_start, period_end);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trending_products_unique
    ON trending_products(product_id, period_start, period_end);

-- Comment on tables
COMMENT ON TABLE user_interactions IS 'Tracks user interactions for preference learning';
COMMENT ON TABLE user_profiles IS 'Stores user preference embeddings for personalization';
COMMENT ON TABLE trending_products IS 'Aggregated trending products data by time period';
