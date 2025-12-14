'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVitals } from '../../lib/analytics';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    // Send to analytics
    trackWebVitals({
      name: metric.name,
      value: metric.value,
      id: metric.id,
    });
  });

  return null;
}

export default WebVitals;
