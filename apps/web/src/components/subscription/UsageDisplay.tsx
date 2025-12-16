'use client';

import { useSubscription } from '../../hooks/useSubscription';
import { isUnlimited } from '../../lib/subscription';

interface UsageDisplayProps {
  feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares';
  label: string;
  showBar?: boolean;
  compact?: boolean;
  className?: string;
}

export function UsageDisplay({
  feature,
  label,
  showBar = true,
  compact = false,
  className = '',
}: UsageDisplayProps) {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 w-24 rounded bg-gray-200" />
        {showBar && <div className="mt-2 h-2 rounded-full bg-gray-200" />}
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const usageData = subscription.usage[feature as keyof typeof subscription.usage];
  if (!usageData) return null;

  const { count, limit } = usageData;
  const unlimited = isUnlimited(limit);
  const percentage = unlimited ? 100 : Math.min((count / limit) * 100, 100);
  const isNearLimit = !unlimited && percentage >= 80;
  const isAtLimit = !unlimited && count >= limit;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-sm ${
          isAtLimit
            ? 'text-red-600'
            : isNearLimit
            ? 'text-yellow-600'
            : 'text-gray-600'
        } ${className}`}
      >
        <span className="font-medium">{count}</span>
        <span>/</span>
        <span>{unlimited ? 'Unlimited' : limit}</span>
        <span className="text-gray-400">{label}</span>
      </span>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span
          className={`text-sm font-medium ${
            isAtLimit ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {count} / {unlimited ? 'Unlimited' : limit}
        </span>
      </div>
      {showBar && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          {unlimited ? (
            <div className="h-full w-full bg-gradient-to-r from-coral-300 to-coral-500" />
          ) : (
            <div
              className={`h-full transition-all duration-300 ${
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
      )}
    </div>
  );
}

interface UsageSummaryProps {
  className?: string;
}

export function UsageSummary({ className = '' }: UsageSummaryProps) {
  const { subscription, loading, isPremium } = useSubscription();

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-8 rounded bg-gray-200" />
          <div className="h-8 rounded bg-gray-200" />
          <div className="h-8 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Usage This Month</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isPremium
              ? 'bg-coral-100 text-coral-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {subscription.plan} Plan
        </span>
      </div>
      <div className="mt-4 space-y-4">
        <UsageDisplay feature="aiSearches" label="AI Searches" />
        <UsageDisplay feature="recipientProfiles" label="Recipient Profiles" />
        <UsageDisplay feature="wishlists" label="Wishlists" />
      </div>
    </div>
  );
}

interface FeatureGateProps {
  feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares' | 'aiChat' | 'familySharing';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canUseFeature, loading } = useSubscription();

  if (loading) {
    return <>{children}</>;
  }

  if (!canUseFeature(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
