/**
 * Subscription Types and API Functions
 * PRD 0005: Subscription & Payment System
 */

export enum SubscriptionPlan {
  FREE = 'FREE',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  UNPAID = 'UNPAID',
  PAUSED = 'PAUSED',
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface PlanLimits {
  aiSearches: number;
  recipientProfiles: number;
  wishlists: number;
  wishlistShares: number;
  aiChat: boolean;
  familySharing: boolean;
  adsEnabled: boolean;
}

export interface PlanComparison {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  features: string[];
  limits: PlanLimits;
}

export interface UsageStats {
  count: number;
  limit: number;
  remaining: number;
}

export interface CurrentUsage {
  aiSearches: UsageStats;
  recipientProfiles: UsageStats;
  wishlists: UsageStats;
  wishlistShares: UsageStats;
  periodStart: string;
  periodEnd: string;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  createdAt: string;
}

export interface SubscriptionWithUsage extends Subscription {
  usage: {
    aiSearches: { count: number; limit: number };
    recipientProfiles: { count: number; limit: number };
    wishlists: { count: number; limit: number };
  };
  limits: PlanLimits;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  paidAt?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getPlans(): Promise<PlanComparison[]> {
  return fetchWithAuth<PlanComparison[]>('/subscriptions/plans');
}

export async function getCurrentSubscription(): Promise<SubscriptionWithUsage> {
  return fetchWithAuth<SubscriptionWithUsage>('/subscriptions/current');
}

export async function getCurrentUsage(): Promise<CurrentUsage> {
  return fetchWithAuth<CurrentUsage>('/subscriptions/usage');
}

export async function createCheckoutSession(params: {
  plan: 'GOLD' | 'PLATINUM';
  interval: 'MONTHLY' | 'YEARLY';
  successUrl: string;
  cancelUrl: string;
  promoCode?: string;
}): Promise<{ sessionId: string; url: string }> {
  return fetchWithAuth<{ sessionId: string; url: string }>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function createBillingPortalSession(returnUrl: string): Promise<{ url: string }> {
  return fetchWithAuth<{ url: string }>('/subscriptions/portal', {
    method: 'POST',
    body: JSON.stringify({ returnUrl }),
  });
}

export async function upgradeSubscription(params: {
  plan: 'GOLD' | 'PLATINUM';
  interval: 'MONTHLY' | 'YEARLY';
}): Promise<Subscription> {
  return fetchWithAuth<Subscription>('/subscriptions/upgrade', {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function downgradeSubscription(params: {
  plan: 'FREE' | 'GOLD';
  interval?: 'MONTHLY' | 'YEARLY';
}): Promise<Subscription> {
  return fetchWithAuth<Subscription>('/subscriptions/downgrade', {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function cancelSubscription(immediately = false): Promise<Subscription> {
  return fetchWithAuth<Subscription>('/subscriptions/cancel', {
    method: 'POST',
    body: JSON.stringify({ immediately }),
  });
}

export async function reactivateSubscription(): Promise<Subscription> {
  return fetchWithAuth<Subscription>('/subscriptions/reactivate', {
    method: 'POST',
  });
}

export async function getInvoices(limit = 10): Promise<Payment[]> {
  return fetchWithAuth<Payment[]>(`/subscriptions/invoices?limit=${limit}`);
}

export async function validatePromoCode(code: string): Promise<{
  valid: boolean;
  discountType?: string;
  discountValue?: number;
  message?: string;
}> {
  return fetchWithAuth('/subscriptions/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// Utility functions
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getAnnualSavings(monthlyPrice: number, yearlyPrice: number): number {
  const annualFromMonthly = monthlyPrice * 12;
  return Math.round(((annualFromMonthly - yearlyPrice) / annualFromMonthly) * 100);
}

export function isPlanUpgrade(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
  const planOrder = { [SubscriptionPlan.FREE]: 0, [SubscriptionPlan.GOLD]: 1, [SubscriptionPlan.PLATINUM]: 2 };
  return planOrder[newPlan] > planOrder[currentPlan];
}

export function isUnlimited(limit: number): boolean {
  return limit === -1;
}
