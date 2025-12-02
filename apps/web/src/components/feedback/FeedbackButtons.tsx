/**
 * Feedback Buttons Component
 *
 * Like/dislike buttons for quick feedback on recommendations
 */

'use client';

import React, { useState } from 'react';

export interface FeedbackButtonsProps {
  productId: string;
  searchId: string;
  onFeedback?: (action: 'LIKED' | 'DISLIKED') => void;
  className?: string;
}

/**
 * Quick feedback buttons (thumbs up/down)
 */
export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  productId,
  searchId,
  onFeedback,
  className = '',
}) => {
  const [feedback, setFeedback] = useState<'LIKED' | 'DISLIKED' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (action: 'LIKED' | 'DISLIKED') => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(action);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId,
          productId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      onFeedback?.(action);
    } catch (error) {
      console.error('Feedback submission error:', error);
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleFeedback('LIKED')}
        disabled={isSubmitting || feedback !== null}
        className={`
          flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all
          ${
            feedback === 'LIKED'
              ? 'bg-coral-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-coral-50'
          }
          ${isSubmitting || feedback !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="Like this recommendation"
      >
        <svg
          className="w-4 h-4"
          fill={feedback === 'LIKED' ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
        <span className="text-sm font-medium">Like</span>
      </button>

      <button
        onClick={() => handleFeedback('DISLIKED')}
        disabled={isSubmitting || feedback !== null}
        className={`
          flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all
          ${
            feedback === 'DISLIKED'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          ${isSubmitting || feedback !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="Dislike this recommendation"
      >
        <svg
          className="w-4 h-4"
          fill={feedback === 'DISLIKED' ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
        <span className="text-sm font-medium">Dislike</span>
      </button>

      {feedback && (
        <span className="text-xs text-gray-500">Thanks for your feedback!</span>
      )}
    </div>
  );
};
