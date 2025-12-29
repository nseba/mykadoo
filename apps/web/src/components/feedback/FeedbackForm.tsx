/**
 * Feedback Form Component
 *
 * Detailed feedback form with comments
 */

'use client';

import React, { useState } from 'react';

export interface FeedbackFormData {
  productId: string;
  searchId: string;
  action: 'LIKED' | 'DISLIKED' | 'PURCHASED' | 'DISMISSED';
  rating?: number;
  comment?: string;
  occasion?: string;
  relationship?: string;
}

export interface FeedbackFormProps {
  productId: string;
  searchId: string;
  onSubmit?: (data: FeedbackFormData) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Detailed feedback form with all options
 */
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  productId,
  searchId,
  onSubmit,
  onClose,
  className = '',
}) => {
  const [formData, setFormData] = useState<Partial<FeedbackFormData>>({
    productId,
    searchId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.action) {
      setError('Please select a feedback action');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:14001';
      const response = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess(true);
      onSubmit?.(formData as FeedbackFormData);

      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
      >
        <div className="text-green-600 text-lg font-medium mb-2">
          Thank you for your feedback!
        </div>
        <p className="text-green-700 text-sm">
          Your input helps us provide better recommendations.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Share Your Feedback
      </h3>

      {/* Action Selection */}
      <fieldset className="mb-4">
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          What did you do? <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2" role="group" aria-required="true">
          {[
            { value: 'LIKED', label: 'Loved it!' },
            { value: 'DISLIKED', label: "Not for me" },
            { value: 'PURCHASED', label: 'Purchased' },
            { value: 'DISMISSED', label: 'Not interested' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, action: option.value as any })}
              aria-pressed={formData.action === option.value}
              className={`
                px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                ${
                  formData.action === option.value
                    ? 'border-coral-500 bg-coral-50 text-coral-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset className="mb-4">
        <legend id="rating-label" className="block text-sm font-medium text-gray-700 mb-2">
          Rate this recommendation (optional)
        </legend>
        <div className="flex gap-1" role="radiogroup" aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={formData.rating === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${
                  (formData.rating || 0) >= star
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Additional comments (optional)
        </label>
        <textarea
          id="feedback-comment"
          value={formData.comment || ''}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          placeholder="Tell us more about your experience..."
          aria-describedby="comment-hint"
        />
        <p id="comment-hint" className="sr-only">
          Share any additional thoughts about this gift recommendation
        </p>
      </div>

      {/* Context Fields */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="feedback-occasion" className="block text-sm font-medium text-gray-700 mb-2">
            Occasion (optional)
          </label>
          <input
            id="feedback-occasion"
            type="text"
            value={formData.occasion || ''}
            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            placeholder="e.g., Birthday"
          />
        </div>
        <div>
          <label htmlFor="feedback-relationship" className="block text-sm font-medium text-gray-700 mb-2">
            Relationship (optional)
          </label>
          <input
            id="feedback-relationship"
            type="text"
            value={formData.relationship || ''}
            onChange={(e) =>
              setFormData({ ...formData, relationship: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            placeholder="e.g., Mother"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !formData.action}
          className="flex-1 bg-coral-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
