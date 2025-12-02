'use client';

/**
 * Search Results Component
 *
 * Grid display of gift recommendations
 */

import { GiftCard, type GiftRecommendation } from './GiftCard';

interface SearchResultsProps {
  recommendations: GiftRecommendation[];
  searchId: string;
  metadata?: {
    model: string;
    cost: number;
    latency: number;
    totalResults: number;
  };
  onSave?: (gift: GiftRecommendation) => void;
}

export function SearchResults({ recommendations, searchId, metadata, onSave }: SearchResultsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recommendations found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metadata */}
      {metadata && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-4 text-sm text-blue-900">
            <div>
              <span className="font-medium">Results:</span> {metadata.totalResults}
            </div>
            <div>
              <span className="font-medium">AI Model:</span> {metadata.model}
            </div>
            <div>
              <span className="font-medium">Response Time:</span> {metadata.latency}ms
            </div>
            <div>
              <span className="font-medium">Cost:</span> ${metadata.cost.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((gift, index) => (
          <GiftCard
            key={`${gift.productName}-${index}`}
            gift={gift}
            searchId={searchId}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  );
}
