'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SubscriptionPlan, createCheckoutSession } from '../../lib/subscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentPlan?: SubscriptionPlan;
  recommendedPlan?: 'GOLD' | 'PLATINUM';
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  currentPlan = SubscriptionPlan.FREE,
  recommendedPlan = 'GOLD',
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown);

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Return focus to previously focused element
      if (previousActiveElement.current && !isOpen) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: 'GOLD' | 'PLATINUM') => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession({
        plan,
        interval: 'YEARLY',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: window.location.href,
      });
      window.location.href = url;
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const modalTitleId = 'upgrade-modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100">
            <svg
              className="h-6 w-6 text-coral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-coral-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h2 id={modalTitleId} className="mt-4 text-xl font-bold text-gray-900">
          Upgrade to Unlock {feature ? `${feature}` : 'More Features'}
        </h2>

        <p className="mt-2 text-gray-600">
          {feature
            ? `This feature is available on premium plans. Upgrade now to access ${feature} and much more.`
            : 'Get more AI searches, profiles, and exclusive features with a premium subscription.'}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {(currentPlan === SubscriptionPlan.FREE || recommendedPlan === 'GOLD') && (
            <button
              onClick={() => handleUpgrade('GOLD')}
              disabled={loading}
              className={`w-full rounded-lg px-4 py-3 font-semibold transition-colors ${
                recommendedPlan === 'GOLD'
                  ? 'bg-coral-500 text-white hover:bg-coral-600'
                  : 'border-2 border-gray-200 text-gray-700 hover:border-coral-500 hover:text-coral-500'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div>Upgrade to Gold</div>
                  <div className="text-sm opacity-80">$8.25/mo billed annually</div>
                </div>
                {recommendedPlan === 'GOLD' && (
                  <span className="rounded bg-white/20 px-2 py-1 text-xs">Recommended</span>
                )}
              </div>
            </button>
          )}

          <button
            onClick={() => handleUpgrade('PLATINUM')}
            disabled={loading}
            className={`w-full rounded-lg px-4 py-3 font-semibold transition-colors ${
              recommendedPlan === 'PLATINUM'
                ? 'bg-coral-500 text-white hover:bg-coral-600'
                : 'border-2 border-gray-200 text-gray-700 hover:border-coral-500 hover:text-coral-500'
            } disabled:opacity-50`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div>Upgrade to Platinum</div>
                <div className="text-sm opacity-80">$16.58/mo billed annually</div>
              </div>
              {recommendedPlan === 'PLATINUM' && (
                <span className="rounded bg-white/20 px-2 py-1 text-xs">Recommended</span>
              )}
            </div>
          </button>
        </div>

        <div className="mt-6 border-t pt-4">
          <Link
            href="/pricing"
            className="block text-center text-sm text-coral-500 hover:underline"
          >
            Compare all plans
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
