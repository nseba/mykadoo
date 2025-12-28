'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface AffiliateDisclosureProps {
  variant?: 'banner' | 'inline' | 'footer';
  collapsible?: boolean;
  className?: string;
}

export function AffiliateDisclosure({
  variant = 'banner',
  collapsible = false,
  className = '',
}: AffiliateDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const disclosureText = {
    short: 'As an Amazon Associate and affiliate partner, we earn from qualifying purchases.',
    full: 'Mykadoo is a participant in various affiliate marketing programs, including the Amazon Associates Program and other affiliate networks like ShareASale and CJ Affiliate. This means that when you click on certain links on this website and make a purchase, we may receive a commission at no additional cost to you. We only recommend products and services that we believe will add value to our users. The commissions we earn help support our platform and allow us to continue providing helpful gift recommendations. Thank you for your support!',
  };

  // Banner variant - prominent at top of page
  if (variant === 'banner') {
    return (
      <div className={`bg-blue-50 border-b border-blue-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Affiliate Disclosure: </span>
                {disclosureText.short}
                {collapsible && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                  >
                    {isExpanded ? 'Show less' : 'Learn more'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </p>
              {isExpanded && collapsible && (
                <p className="mt-2 text-sm text-blue-800">
                  {disclosureText.full}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant - within content
  if (variant === 'inline') {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="text-gray-600 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Disclosure: </span>
              {disclosureText.short}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Footer variant - subtle at bottom of page
  if (variant === 'footer') {
    return (
      <div className={`bg-gray-100 border-t border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-600 text-center">
            {disclosureText.short}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// Full page disclosure component for /disclosure or /affiliate-disclosure page
export function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Affiliate Disclosure
      </h1>

      <div className="prose prose-blue max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          At Mykadoo, transparency is important to us. This page explains our
          participation in affiliate marketing programs and how we earn revenue
          from product recommendations.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          What is Affiliate Marketing?
        </h2>
        <p className="text-gray-700 mb-4">
          Affiliate marketing is a type of performance-based marketing where we
          earn a commission for referring customers to products or services. When
          you click on an affiliate link and make a purchase, the merchant pays us
          a small percentage of the sale.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Our Affiliate Partnerships
        </h2>
        <p className="text-gray-700 mb-4">
          Mykadoo is a participant in the following affiliate programs:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Amazon Associates Program:</strong> We earn from qualifying
            purchases made through Amazon affiliate links.
          </li>
          <li>
            <strong>ShareASale:</strong> We partner with various merchants through
            the ShareASale affiliate network.
          </li>
          <li>
            <strong>CJ Affiliate (Commission Junction):</strong> We work with
            advertisers through the CJ Affiliate network.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          How This Affects You
        </h2>
        <p className="text-gray-700 mb-4">
          When you click on an affiliate link and make a purchase:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            You pay the <strong>same price</strong> as you would if you went
            directly to the merchant&apos;s website.
          </li>
          <li>
            We earn a small commission from the merchant (not from you).
          </li>
          <li>
            This commission helps us maintain and improve our platform.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Our Promise to You
        </h2>
        <p className="text-gray-700 mb-4">
          We are committed to providing honest and helpful gift recommendations:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            We only recommend products we believe will add value to our users.
          </li>
          <li>
            Our recommendations are based on product quality, ratings, and
            relevance—not commission rates.
          </li>
          <li>
            We clearly identify affiliate links and provide this disclosure.
          </li>
          <li>
            Your trust is more important to us than any commission.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Questions?
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about our affiliate relationships or how we
          earn revenue, please contact us at{' '}
          <a href="mailto:support@mykadoo.com" className="text-blue-600 hover:text-blue-800">
            support@mykadoo.com
          </a>
          .
        </p>

        <p className="text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
          Last updated: {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
