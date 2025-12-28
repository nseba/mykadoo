'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard, Product } from '../products/ProductCard';
import { Skeleton } from '../ui/Skeleton';

export interface SimilarProductsProps {
  productId: string;
  title?: string;
  limit?: number;
  threshold?: number;
  categoryFilter?: string;
  priceRange?: { min?: number; max?: number };
  lazyLoad?: boolean;
  className?: string;
  onProductClick?: (product: Product, position: number) => void;
}

interface RecommendationVariant {
  variant: 'control' | 'basic' | 'hybrid' | 'personalized';
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

export function SimilarProducts({
  productId,
  title = 'You might also like',
  limit = 6,
  threshold = 0.7,
  categoryFilter,
  priceRange,
  lazyLoad = true,
  className = '',
  onProductClick,
}: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState<RecommendationVariant['variant']>('basic');
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get session ID for analytics
  const getSessionId = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem('similarity_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('similarity_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Assign A/B test variant
  const assignVariant = useCallback(async (): Promise<RecommendationVariant['variant']> => {
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
  }, [getSessionId]);

  // Fetch similar products
  const fetchSimilarProducts = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Assign variant first
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
      if (priceRange?.min !== undefined) {
        params.append('minPrice', priceRange.min.toString());
      }
      if (priceRange?.max !== undefined) {
        params.append('maxPrice', priceRange.max.toString());
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
  }, [productId, limit, threshold, categoryFilter, priceRange, assignVariant, getSessionId]);

  // Track impression event
  const trackImpressionEvent = useCallback(async () => {
    if (hasTrackedImpression || products.length === 0) return;

    try {
      await fetch('/api/similarity-analytics/track/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceProductId: productId,
          recommendedProductIds: products.map((p) => p.id),
          sessionId: getSessionId(),
          variant,
        }),
      });
      setHasTrackedImpression(true);
    } catch {
      // Silently fail
    }
  }, [productId, products, variant, hasTrackedImpression, getSessionId]);

  // Track click event
  const trackClickEvent = async (clickedProductId: string, position: number) => {
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
  };

  // Handle product click
  const handleProductClick = (product: Product, position: number) => {
    trackClickEvent(product.id, position);
    onProductClick?.(product, position);
  };

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad]);

  // Fetch products when visible
  useEffect(() => {
    if (isVisible && productId) {
      fetchSimilarProducts();
    }
  }, [isVisible, productId, fetchSimilarProducts]);

  // Track impression when products become visible
  useEffect(() => {
    if (isVisible && products.length > 0 && !hasTrackedImpression) {
      trackImpressionEvent();
    }
  }, [isVisible, products, hasTrackedImpression, trackImpressionEvent]);

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Control group - don't render anything
  if (variant === 'control') {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div ref={containerRef} className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-coral-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Silently hide on error
  }

  // Empty state
  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-coral-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Navigation arrows for overflow */}
        {products.length > 3 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Product carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-13px)] snap-start"
          >
            <ProductCard
              product={product}
              onClick={() => handleProductClick(product, index)}
              trackClick={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimilarProducts;
