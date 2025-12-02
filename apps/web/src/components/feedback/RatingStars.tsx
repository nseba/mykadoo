/**
 * Rating Stars Component
 *
 * 5-star rating system for detailed feedback
 */

'use client';

import React, { useState } from 'react';

export interface RatingStarsProps {
  productId: string;
  searchId: string;
  onRating?: (rating: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 5-star rating component
 */
export const RatingStars: React.FC<RatingStarsProps> = ({
  productId,
  searchId,
  onRating,
  className = '',
  size = 'md',
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleRating = async (value: number) => {
    if (isSubmitting || rating > 0) return;

    setIsSubmitting(true);
    setRating(value);

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
          action: 'LIKED',
          rating: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      onRating?.(value);
    } catch (error) {
      console.error('Rating submission error:', error);
      setRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (index: number) => {
    const filled = (hoverRating || rating) >= index;

    return (
      <button
        key={index}
        onClick={() => handleRating(index)}
        onMouseEnter={() => !rating && setHoverRating(index)}
        onMouseLeave={() => setHoverRating(0)}
        disabled={rating > 0 || isSubmitting}
        className={`
          transition-all
          ${rating > 0 || isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-110'}
        `}
        aria-label={`Rate ${index} stars`}
      >
        <svg
          className={`${sizeClasses[size]} transition-colors ${
            filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          Thanks for rating!
        </span>
      )}
    </div>
  );
};
