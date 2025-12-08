'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ExternalLink } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  retailerName?: string;
  platform: string;
  affiliateLink: string;
  availability?: string;
}

export interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  trackClick?: boolean;
  trackingEndpoint?: string;
}

export function ProductCard({
  product,
  onClick,
  trackClick = true,
  trackingEndpoint = '/api/tracking/click',
}: ProductCardProps) {
  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Track the click if enabled
    if (trackClick && trackingEndpoint) {
      try {
        await fetch(`${trackingEndpoint}/${product.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to track click:', error);
      }
    }

    // Open affiliate link in new tab
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold shadow-md">
            -{discountPercent}%
          </div>
        )}

        {/* Platform Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
          {product.retailerName || product.platform}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < Math.round(product.rating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-gray-500">
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {product.currency === 'USD' ? '$' : product.currency}
              {displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.currency === 'USD' ? '$' : product.currency}
                {product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Availability */}
        {product.availability && (
          <div className="text-xs">
            {product.availability === 'IN_STOCK' ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : product.availability === 'OUT_OF_STOCK' ? (
              <span className="text-red-600 font-medium">Out of Stock</span>
            ) : (
              <span className="text-gray-500">Availability Unknown</span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleAffiliateClick}
          className="w-full bg-coral-500 hover:bg-coral-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-coral-600"
        >
          View on {product.retailerName || product.platform}
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}
