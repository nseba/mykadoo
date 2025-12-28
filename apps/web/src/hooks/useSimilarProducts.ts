'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../components/products/ProductCard';

export type RecommendationVariant = 'control' | 'basic' | 'hybrid' | 'personalized';

export interface UseSimilarProductsOptions {
  productId: string;
  limit?: number;
  threshold?: number;
  categoryFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  autoFetch?: boolean;
}

export interface UseSimilarProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  variant: RecommendationVariant;
  refetch: () => Promise<void>;
  trackClick: (clickedProductId: string, position: number) => Promise<void>;
  trackConversion: (convertedProductId: string, position?: number) => Promise<void>;
}

interface SimilarProductResponse {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  similarity: number;
  imageUrl?: string;
  salePrice?: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  retailerName?: string;
  platform: string;
  affiliateLink: string;
  availability?: string;
}

// Session ID management
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('similarity_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('similarity_session_id', sessionId);
  }
  return sessionId;
};

export function useSimilarProducts(
  options: UseSimilarProductsOptions
): UseSimilarProductsResult {
  const {
    productId,
    limit = 6,
    threshold = 0.7,
    categoryFilter,
    minPrice,
    maxPrice,
    autoFetch = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState<RecommendationVariant>('basic');

  // Assign A/B test variant
  const assignVariant = useCallback(async (): Promise<RecommendationVariant> => {
    try {
      const response = await fetch('/api/similarity-analytics/variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId() }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.variant;
      }
    } catch {
      // Fallback to basic variant
    }
    return 'basic';
  }, []);

  // Fetch similar products
  const fetchProducts = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Assign variant
      const assignedVariant = await assignVariant();
      setVariant(assignedVariant);

      // Control group gets no recommendations
      if (assignedVariant === 'control') {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        limit: limit.toString(),
        matchThreshold: threshold.toString(),
      });

      if (categoryFilter) {
        params.append('categoryFilter', categoryFilter);
      }
      if (minPrice !== undefined) {
        params.append('minPrice', minPrice.toString());
      }
      if (maxPrice !== undefined) {
        params.append('maxPrice', maxPrice.toString());
      }

      const response = await fetch(
        `/api/vectors/products/${productId}/similar?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch similar products');
      }

      const data: SimilarProductResponse[] = await response.json();

      // Transform to Product type
      const transformedProducts: Product[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        imageUrl: item.imageUrl,
        price: item.price,
        salePrice: item.salePrice,
        currency: item.currency || 'USD',
        rating: item.rating,
        reviewCount: item.reviewCount,
        retailerName: item.retailerName,
        platform: item.platform || 'AMAZON',
        affiliateLink: item.affiliateLink || '',
        availability: item.availability,
      }));

      setProducts(transformedProducts);

      // Track search event inline to avoid dependency issues
      try {
        await fetch('/api/similarity-analytics/track/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceProductId: productId,
            sessionId: getSessionId(),
            variant: assignedVariant,
            recommendedProductIds: transformedProducts.map((p) => p.id),
            searchThreshold: threshold,
          }),
        });
      } catch {
        // Silently fail analytics tracking
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId, limit, threshold, categoryFilter, minPrice, maxPrice, assignVariant]);

  // Track click event
  const trackClick = useCallback(
    async (clickedProductId: string, position: number) => {
      try {
        await fetch('/api/similarity-analytics/track/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceProductId: productId,
            clickedProductId,
            position,
            sessionId: getSessionId(),
            variant,
          }),
        });
      } catch {
        // Silently fail
      }
    },
    [productId, variant]
  );

  // Track conversion event
  const trackConversion = useCallback(
    async (convertedProductId: string, position?: number) => {
      try {
        await fetch('/api/similarity-analytics/track/conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceProductId: productId,
            convertedProductId,
            position,
            sessionId: getSessionId(),
            variant,
          }),
        });
      } catch {
        // Silently fail
      }
    },
    [productId, variant]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && productId) {
      fetchProducts();
    }
  }, [autoFetch, productId, fetchProducts]);

  return {
    products,
    isLoading,
    error,
    variant,
    refetch: fetchProducts,
    trackClick,
    trackConversion,
  };
}

export default useSimilarProducts;
