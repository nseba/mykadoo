'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PricingCard } from '../../components/subscription/PricingCard';
import {
  PlanComparison,
  SubscriptionPlan,
  SubscriptionWithUsage,
  getPlans,
  getCurrentSubscription,
  createCheckoutSession,
} from '../../lib/subscription';

export function PricingPageClient() {
  const [plans, setPlans] = useState<PlanComparison[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, subscriptionData] = await Promise.all([
          getPlans(),
          getCurrentSubscription().catch(() => null),
        ]);
        setPlans(plansData);
        setCurrentSubscription(subscriptionData);
      } catch (err) {
        setError('Failed to load pricing data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) {
      // Redirect to signup
      window.location.href = '/signup';
      return;
    }

    setCheckoutLoading(plan);
    try {
      const { url } = await createCheckoutSession({
        plan: plan as 'GOLD' | 'PLATINUM',
        interval: isYearly ? 'YEARLY' : 'MONTHLY',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
      window.location.href = url;
    } catch (err) {
      setError('Failed to create checkout session');
      console.error(err);
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="animate-pulse">
            <div className="mx-auto h-8 w-64 rounded bg-gray-200" />
            <div className="mx-auto mt-4 h-4 w-96 rounded bg-gray-200" />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Choose Your Perfect Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find the right subscription for your gift-giving needs
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-full bg-white p-1 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                !isYearly
                  ? 'bg-coral-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                isYearly
                  ? 'bg-coral-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs opacity-80">Save 17%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.plan}
              plan={plan}
              isYearly={isYearly}
              isCurrentPlan={currentSubscription?.plan === plan.plan}
              isPopular={plan.plan === SubscriptionPlan.GOLD}
              onSelect={handleSelectPlan}
              loading={checkoutLoading === plan.plan}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <FAQItem
              question="Can I change my plan at any time?"
              answer="Yes! You can upgrade your plan immediately with prorated billing, or downgrade at the end of your current billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Free users can try all basic features without time limits. Premium features are available immediately upon subscription."
            />
            <FAQItem
              question="Can I cancel my subscription?"
              answer="Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="What happens to my data if I downgrade?"
              answer="Your data is always preserved. If you downgrade and exceed limits, you'll retain read access to existing items but won't be able to add new ones until you're within limits."
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-sm">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-2">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}
