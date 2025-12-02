'use client';

/**
 * Search Page
 *
 * Main gift search interface
 */

import { useState } from 'react';
import { SearchForm, type SearchFormData } from '../../components/search/SearchForm';
import { SearchResults } from '../../components/search/SearchResults';
import { LoadingState } from '../../components/search/LoadingState';
import { ErrorState } from '../../components/search/ErrorState';
import type { GiftRecommendation } from '../../components/search/GiftCard';

interface SearchResponse {
  recommendations: GiftRecommendation[];
  searchId?: string;
  metadata: {
    model: string;
    cost: number;
    latency: number;
    totalResults: number;
  };
  success: boolean;
  error?: string;
}

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const handleSearch = async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      setResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGift = (gift: GiftRecommendation) => {
    // TODO: Implement save to wishlist
    console.log('Save gift:', gift);
    alert(`Saved "${gift.productName}" to your wishlist!`);
  };

  const handleRetry = () => {
    setError(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Find the Perfect Gift
          </h1>
          <p className="mt-2 text-gray-600">
            AI-powered personalized gift recommendations for every occasion
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <SearchForm onSubmit={handleSearch} loading={loading} />
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            {loading && <LoadingState />}

            {error && <ErrorState message={error} onRetry={handleRetry} />}

            {results && !loading && !error && (
              <SearchResults
                recommendations={results.recommendations}
                metadata={results.metadata}
                onSave={handleSaveGift}
              />
            )}

            {!loading && !error && !results && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-coral-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-coral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Ready to find amazing gifts?
                </h2>
                <p className="text-gray-600 mb-4">
                  Fill out the form on the left to get personalized recommendations
                </p>
                <ul className="text-sm text-gray-500 space-y-2 max-w-md mx-auto text-left">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-coral-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>AI-powered recommendations tailored to your recipient</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-coral-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Diverse options across multiple categories</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-coral-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Strict budget adherence with smart filtering</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by AI • Personalized for You
          </p>
        </div>
      </footer>
    </div>
  );
}
