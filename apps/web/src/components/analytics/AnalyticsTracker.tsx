'use client';

import { useEffect, useRef } from 'react';
import { trackPageView } from '../../lib/analytics';

export function AnalyticsTracker() {
  const lastUrl = useRef<string>('');

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Track initial page view
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== lastUrl.current) {
      lastUrl.current = currentUrl;
      trackPageView(currentUrl);
    }

    // Listen for route changes
    const handleRouteChange = () => {
      const newUrl = window.location.pathname + window.location.search;
      if (newUrl !== lastUrl.current) {
        lastUrl.current = newUrl;
        trackPageView(newUrl);
      }
    };

    // Use History API to detect route changes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
}

export default AnalyticsTracker;
