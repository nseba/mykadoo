'use client';

/**
 * Gift Card Component
 *
 * Display individual gift recommendation
 */

export interface GiftRecommendation {
  productName: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  matchReason: string;
  imageUrl?: string;
  purchaseUrl?: string;
  retailer?: string;
  relevanceScore: number;
}

interface GiftCardProps {
  gift: GiftRecommendation;
  onSave?: (gift: GiftRecommendation) => void;
}

export function GiftCard({ gift, onSave }: GiftCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Placeholder */}
      {gift.imageUrl ? (
        <img
          src={gift.imageUrl}
          alt={gift.productName}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-coral-100 to-blue-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image available</span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {gift.productName}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-coral-600">
              ${gift.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">{gift.category}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{gift.description}</p>

        {/* Match Reason */}
        <div className="mb-3 p-3 bg-blue-50 rounded-md">
          <p className="text-xs font-medium text-blue-900 mb-1">Why this gift?</p>
          <p className="text-xs text-blue-700">{gift.matchReason}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {gift.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Relevance Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Match Score</span>
            <span className="font-medium text-coral-600">{gift.relevanceScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-coral-500 h-2 rounded-full transition-all"
              style={{ width: `${gift.relevanceScore}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {gift.purchaseUrl && (
            <a
              href={gift.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-coral-500 text-white text-sm font-medium rounded-md hover:bg-coral-600 text-center transition-colors"
            >
              View Product
            </a>
          )}
          {onSave && (
            <button
              onClick={() => onSave(gift)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Save to wishlist"
            >
              Save
            </button>
          )}
        </div>

        {/* Retailer */}
        {gift.retailer && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Available at {gift.retailer}
          </p>
        )}
      </div>
    </div>
  );
}
