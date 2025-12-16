'use client';

import {
  PlanComparison,
  SubscriptionPlan,
  formatPrice,
  getAnnualSavings,
} from '../../lib/subscription';

interface PricingCardProps {
  plan: PlanComparison;
  isYearly: boolean;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  loading?: boolean;
}

export function PricingCard({
  plan,
  isYearly,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  loading = false,
}: PricingCardProps) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  const savings = getAnnualSavings(plan.monthlyPrice, plan.yearlyPrice);

  const isPaid = plan.plan !== SubscriptionPlan.FREE;

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 transition-all ${
        isPopular
          ? 'border-coral-500 bg-coral-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-coral-300'
      } ${isCurrentPlan ? 'ring-2 ring-coral-500 ring-offset-2' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-coral-500 px-4 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
      </div>

      <div className="mb-6">
        {isPaid ? (
          <>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(monthlyEquivalent)}
              </span>
              <span className="ml-1 text-gray-600">/month</span>
            </div>
            {isYearly && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {formatPrice(price)} billed annually
                </span>
                {savings > 0 && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Save {savings}%
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">Free</span>
            <span className="ml-1 text-gray-600">forever</span>
          </div>
        )}
      </div>

      <ul className="mb-8 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isPopular ? 'text-coral-500' : 'text-green-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.plan)}
        disabled={isCurrentPlan || loading}
        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
          isCurrentPlan
            ? 'cursor-default bg-gray-100 text-gray-500'
            : isPopular
            ? 'bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50'
            : isPaid
            ? 'border-2 border-coral-500 text-coral-500 hover:bg-coral-50 disabled:opacity-50'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : isPaid ? (
          `Get ${plan.name}`
        ) : (
          'Get Started Free'
        )}
      </button>
    </div>
  );
}
