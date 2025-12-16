'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SubscriptionWithUsage,
  Payment,
  SubscriptionPlan,
  SubscriptionStatus,
  getCurrentSubscription,
  getInvoices,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
  formatPrice,
  isUnlimited,
} from '../../../lib/subscription';

export function SubscriptionManagementClient() {
  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [invoices, setInvoices] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [subData, invoicesData] = await Promise.all([
        getCurrentSubscription(),
        getInvoices(5),
      ]);
      setSubscription(subData);
      setInvoices(invoicesData);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionLoading('billing');
    try {
      const { url } = await createBillingPortalSession(window.location.href);
      window.location.href = url;
    } catch (err) {
      setError('Failed to open billing portal');
      console.error(err);
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    setActionLoading('cancel');
    try {
      const updated = await cancelSubscription(false);
      setSubscription((prev) => prev && { ...prev, ...updated });
      setShowCancelModal(false);
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate() {
    setActionLoading('reactivate');
    try {
      const updated = await reactivateSubscription();
      setSubscription((prev) => prev && { ...prev, ...updated });
    } catch (err) {
      setError('Failed to reactivate subscription');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-6 h-64 rounded-lg bg-gray-200" />
            <div className="mt-6 h-48 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Subscription Found</h1>
          <p className="mt-2 text-gray-600">
            You don&apos;t have an active subscription yet.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-lg bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = subscription.plan !== SubscriptionPlan.FREE;
  const isCanceled = subscription.cancelAtPeriodEnd || subscription.status === SubscriptionStatus.CANCELED;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <Link
            href="/account"
            className="text-sm text-coral-500 hover:text-coral-600"
          >
            Back to Account
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {subscription.plan} Plan
                </h2>
                <StatusBadge status={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {isPaid ? (
                  <>
                    {subscription.billingInterval === 'MONTHLY' ? 'Monthly' : 'Annual'} billing
                    {subscription.currentPeriodEnd && (
                      <> &bull; Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                    )}
                  </>
                ) : (
                  'Free forever'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {isPaid && (
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'billing'}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === 'billing' ? 'Loading...' : 'Manage Billing'}
                </button>
              )}
              <Link
                href="/pricing"
                className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600"
              >
                {isPaid ? 'Change Plan' : 'Upgrade'}
              </Link>
            </div>
          </div>

          {isCanceled && subscription.currentPeriodEnd && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-yellow-50 p-4">
              <div>
                <p className="font-medium text-yellow-800">
                  Subscription ending {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <p className="text-sm text-yellow-700">
                  You&apos;ll keep your benefits until then.
                </p>
              </div>
              <button
                onClick={handleReactivate}
                disabled={actionLoading === 'reactivate'}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {actionLoading === 'reactivate' ? 'Processing...' : 'Reactivate'}
              </button>
            </div>
          )}
        </div>

        {/* Usage Section */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Usage This Period</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <UsageBar
              label="AI Searches"
              current={subscription.usage.aiSearches.count}
              limit={subscription.usage.aiSearches.limit}
            />
            <UsageBar
              label="Recipient Profiles"
              current={subscription.usage.recipientProfiles.count}
              limit={subscription.usage.recipientProfiles.limit}
            />
            <UsageBar
              label="Wishlists"
              current={subscription.usage.wishlists.count}
              limit={subscription.usage.wishlists.limit}
            />
          </div>
        </div>

        {/* Invoices Section */}
        {invoices.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <div className="mt-4 divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(invoice.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {invoice.paidAt
                        ? new Date(invoice.paidAt).toLocaleDateString()
                        : new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        invoice.status === 'SUCCEEDED'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {invoice.status}
                    </span>
                    {invoice.invoiceUrl && (
                      <a
                        href={invoice.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-coral-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Section */}
        {isPaid && !isCanceled && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Cancel Subscription</h2>
            <p className="mt-1 text-sm text-red-700">
              Cancel your subscription at the end of the current billing period.
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Subscription?
              </h3>
              <p className="mt-2 text-gray-600">
                Your subscription will remain active until{' '}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'the end of your billing period'}
                . You won&apos;t be charged again.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? 'Canceling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
}) {
  if (cancelAtPeriodEnd) {
    return (
      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
        Canceling
      </span>
    );
  }

  const statusConfig: Record<SubscriptionStatus, { bg: string; text: string; label: string }> = {
    [SubscriptionStatus.ACTIVE]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    [SubscriptionStatus.TRIALING]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
    [SubscriptionStatus.PAST_DUE]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Past Due' },
    [SubscriptionStatus.CANCELED]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Canceled' },
    [SubscriptionStatus.INCOMPLETE]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Incomplete' },
    [SubscriptionStatus.INCOMPLETE_EXPIRED]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' },
    [SubscriptionStatus.UNPAID]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid' },
    [SubscriptionStatus.PAUSED]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Paused' },
  };

  const config = statusConfig[status];
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function UsageBar({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const unlimited = isUnlimited(limit);
  const percentage = unlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !unlimited && percentage >= 80;
  const isAtLimit = !unlimited && current >= limit;

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={isAtLimit ? 'font-medium text-red-600' : 'text-gray-900'}>
          {current} / {unlimited ? 'Unlimited' : limit}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        {unlimited ? (
          <div className="h-full w-full bg-gradient-to-r from-coral-300 to-coral-500" />
        ) : (
          <div
            className={`h-full transition-all ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-coral-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
