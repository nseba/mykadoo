'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackArticleScroll, trackArticleReadComplete } from '../lib/analytics';

interface UseScrollTrackingOptions {
  articleId: string;
  articleTitle: string;
  enabled?: boolean;
  thresholds?: number[];
  readTimeMultiplier?: number; // Expected reading time in seconds per 1000 words
}

export function useScrollTracking({
  articleId,
  articleTitle,
  enabled = true,
  thresholds = [25, 50, 75, 100],
  readTimeMultiplier = 240, // 4 minutes per 1000 words
}: UseScrollTrackingOptions) {
  const trackedThresholds = useRef<Set<number>>(new Set());
  const startTime = useRef<number>(Date.now());
  const hasTrackedComplete = useRef<boolean>(false);

  const calculateScrollPercentage = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const maxScroll = documentHeight - windowHeight;

    if (maxScroll <= 0) return 100;

    return Math.round((scrollTop / maxScroll) * 100);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollPercentage = calculateScrollPercentage();

      // Track each threshold once
      thresholds.forEach((threshold) => {
        if (
          scrollPercentage >= threshold &&
          !trackedThresholds.current.has(threshold)
        ) {
          trackedThresholds.current.add(threshold);
          trackArticleScroll(articleId, threshold);
        }
      });

      // Track read complete when user reaches 90%+ and has spent sufficient time
      if (scrollPercentage >= 90 && !hasTrackedComplete.current) {
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
        // Only count as complete if user spent at least 30 seconds
        if (timeSpent >= 30) {
          hasTrackedComplete.current = true;
          trackArticleReadComplete(articleId, articleTitle, timeSpent);
        }
      }
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [articleId, articleTitle, enabled, thresholds, calculateScrollPercentage]);

  return {
    trackedThresholds: trackedThresholds.current,
  };
}

export default useScrollTracking;
