'use client';

import React from 'react';
import { ProductCard, Product } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick?: (product: Product) => void;
  emptyMessage?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ProductGrid({
  products,
  loading = false,
  onProductClick,
  emptyMessage = 'No products found',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}: ProductGridProps) {
  // Grid column classes based on breakpoints
  const gridCols = {
    mobile: columns.mobile === 1 ? 'grid-cols-1' : `grid-cols-${columns.mobile}`,
    tablet: columns.tablet === 2 ? 'md:grid-cols-2' : `md:grid-cols-${columns.tablet}`,
    desktop: columns.desktop === 3 ? 'lg:grid-cols-3' : `lg:grid-cols-${columns.desktop}`,
  };

  if (loading) {
    return (
      <div
        className={`grid ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} gap-6`}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} gap-6`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}
