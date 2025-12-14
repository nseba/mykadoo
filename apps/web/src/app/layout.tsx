import '@mykadoo/design-system';
import './global.css';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics, AnalyticsProvider } from '../components/analytics';

// Optimized font loading with font-display: swap
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mykadoo - AI-Powered Gift Search Engine',
    template: '%s | Mykadoo',
  },
  description:
    'Find the perfect gift with AI-powered personalized recommendations. Discover thoughtful presents for every occasion.',
  keywords: [
    'gift search',
    'gift ideas',
    'AI gift recommendations',
    'personalized gifts',
    'gift finder',
    'present ideas',
  ],
  authors: [{ name: 'Mykadoo Team' }],
  creator: 'Mykadoo',
  publisher: 'Mykadoo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Mykadoo',
    title: 'Mykadoo - AI-Powered Gift Search Engine',
    description:
      'Find the perfect gift with AI-powered personalized recommendations.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Mykadoo - AI Gift Search',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mykadoo - AI-Powered Gift Search Engine',
    description:
      'Find the perfect gift with AI-powered personalized recommendations.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@mykadoo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6B6B' },
    { media: '(prefers-color-scheme: dark)', color: '#FF6B6B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for third-party services */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
