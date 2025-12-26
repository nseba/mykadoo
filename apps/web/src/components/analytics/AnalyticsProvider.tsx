'use client';

import { AnalyticsTracker } from './AnalyticsTracker';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsTracker />
      {children}
    </>
  );
}

export default AnalyticsProvider;
