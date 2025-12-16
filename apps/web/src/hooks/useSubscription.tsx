'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  SubscriptionWithUsage,
  SubscriptionPlan,
  CurrentUsage,
  getCurrentSubscription,
  getCurrentUsage,
  isUnlimited,
} from '../lib/subscription';

interface SubscriptionContextValue {
  subscription: SubscriptionWithUsage | null;
  usage: CurrentUsage | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isPremium: boolean;
  isGold: boolean;
  isPlatinum: boolean;
  canUseFeature: (feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares' | 'aiChat' | 'familySharing') => boolean;
  remainingUsage: (feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares') => number;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [usage, setUsage] = useState<CurrentUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [subData, usageData] = await Promise.all([
        getCurrentSubscription(),
        getCurrentUsage(),
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isPremium = subscription
    ? subscription.plan !== SubscriptionPlan.FREE
    : false;

  const isGold = subscription?.plan === SubscriptionPlan.GOLD;
  const isPlatinum = subscription?.plan === SubscriptionPlan.PLATINUM;

  const canUseFeature = useCallback(
    (feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares' | 'aiChat' | 'familySharing'): boolean => {
      if (!subscription) return false;

      const limits = subscription.limits;
      const usageData = subscription.usage;

      switch (feature) {
        case 'aiChat':
          return limits.aiChat;
        case 'familySharing':
          return limits.familySharing;
        case 'aiSearches':
          if (isUnlimited(limits.aiSearches)) return true;
          return usageData.aiSearches.count < limits.aiSearches;
        case 'recipientProfiles':
          if (isUnlimited(limits.recipientProfiles)) return true;
          return usageData.recipientProfiles.count < limits.recipientProfiles;
        case 'wishlists':
          if (isUnlimited(limits.wishlists)) return true;
          return usageData.wishlists.count < limits.wishlists;
        case 'wishlistShares':
          if (isUnlimited(limits.wishlistShares)) return true;
          return limits.wishlistShares > 0;
        default:
          return false;
      }
    },
    [subscription]
  );

  const remainingUsage = useCallback(
    (feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares'): number => {
      if (!usage) return 0;

      const featureUsage = usage[feature];
      if (isUnlimited(featureUsage.limit)) return -1;
      return featureUsage.remaining;
    },
    [usage]
  );

  const value: SubscriptionContextValue = {
    subscription,
    usage,
    loading,
    error,
    refresh,
    isPremium,
    isGold,
    isPlatinum,
    canUseFeature,
    remainingUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Simple hook for checking if user can use a feature (doesn't require full context)
export function useFeatureAccess(
  feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares' | 'aiChat' | 'familySharing'
): { canUse: boolean; loading: boolean } {
  const { canUseFeature, loading } = useSubscription();
  return { canUse: canUseFeature(feature), loading };
}

// Hook for displaying usage stats
export function useUsageStats(
  feature: 'aiSearches' | 'recipientProfiles' | 'wishlists' | 'wishlistShares'
): { current: number; limit: number; remaining: number; loading: boolean } {
  const { usage, loading } = useSubscription();

  if (!usage) {
    return { current: 0, limit: 0, remaining: 0, loading };
  }

  const stats = usage[feature];
  return {
    current: stats.count,
    limit: stats.limit,
    remaining: stats.remaining,
    loading,
  };
}
