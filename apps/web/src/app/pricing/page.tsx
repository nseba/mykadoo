import type { Metadata } from 'next';
import { PricingPageClient } from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose the perfect Mykadoo plan for your gift-giving needs. Free, Gold, and Platinum tiers with AI-powered recommendations.',
  openGraph: {
    title: 'Pricing | Mykadoo',
    description:
      'Choose the perfect Mykadoo plan for your gift-giving needs. Free, Gold, and Platinum tiers.',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
