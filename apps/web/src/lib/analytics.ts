declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const isAnalyticsEnabled = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID && !!window.gtag;
};

// Page view tracking (automatic with Next.js App Router)
export const trackPageView = (url: string): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

// Generic event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Article/Content Events
export const trackArticleView = (
  articleId: string,
  articleTitle: string,
  category?: string,
  author?: string
): void => {
  trackEvent('view_item', 'content', articleTitle);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'view_item', {
    items: [
      {
        item_id: articleId,
        item_name: articleTitle,
        item_category: category,
        item_brand: author,
      },
    ],
  });
};

export const trackArticleScroll = (
  articleId: string,
  scrollDepth: number // 25, 50, 75, or 100
): void => {
  trackEvent('scroll', 'content', `scroll_${scrollDepth}%`, scrollDepth);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'scroll_depth', {
    article_id: articleId,
    percent_scrolled: scrollDepth,
  });
};

export const trackArticleShare = (
  articleId: string,
  articleTitle: string,
  method: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy_link'
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'share', {
    method: method,
    content_type: 'article',
    item_id: articleId,
    content_name: articleTitle,
  });
};

export const trackArticleReadComplete = (
  articleId: string,
  articleTitle: string,
  readingTimeSeconds: number
): void => {
  trackEvent('article_read_complete', 'content', articleTitle, readingTimeSeconds);
};

// Search Events
export const trackSearch = (searchTerm: string, resultsCount: number): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

export const trackSearchResultClick = (
  searchTerm: string,
  resultId: string,
  resultPosition: number
): void => {
  trackEvent('search_result_click', 'search', searchTerm, resultPosition);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'select_content', {
    content_type: 'search_result',
    content_id: resultId,
    search_term: searchTerm,
    position: resultPosition,
  });
};

// Affiliate/Product Events
export const trackProductView = (
  productId: string,
  productName: string,
  price?: number,
  source?: string
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'view_item', {
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        item_category: source,
      },
    ],
  });
};

export const trackAffiliateClick = (
  productId: string,
  productName: string,
  affiliateNetwork: string,
  price?: number
): void => {
  trackEvent('affiliate_click', 'ecommerce', productName);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'select_item', {
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        item_category: 'affiliate',
        item_brand: affiliateNetwork,
      },
    ],
  });

  // Also track as outbound link
  window.gtag?.('event', 'outbound_click', {
    link_type: 'affiliate',
    affiliate_network: affiliateNetwork,
    product_id: productId,
    product_name: productName,
  });
};

// User Engagement Events
export const trackNewsletterSignup = (source: string): void => {
  trackEvent('generate_lead', 'engagement', source);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'sign_up', {
    method: 'newsletter',
    source: source,
  });
};

export const trackCTAClick = (
  ctaName: string,
  ctaLocation: string,
  destinationUrl?: string
): void => {
  trackEvent('cta_click', 'engagement', ctaName);

  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    destination_url: destinationUrl,
  });
};

// User Authentication Events
export const trackLogin = (method: string): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'login', {
    method: method,
  });
};

export const trackSignUp = (method: string): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'sign_up', {
    method: method,
  });
};

// Error Tracking
export const trackError = (
  errorMessage: string,
  errorLocation: string,
  errorType: 'api' | 'client' | 'unknown' = 'unknown'
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'exception', {
    description: errorMessage,
    fatal: false,
    error_location: errorLocation,
    error_type: errorType,
  });
};

// Performance Tracking
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
}): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
};

// Timing Events
export const trackTiming = (
  name: string,
  value: number,
  category: string = 'performance'
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', 'timing_complete', {
    name: name,
    value: value,
    event_category: category,
  });
};
