'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (command: string, ...params: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = 'G-HBM2PTD15Y';

// This is a simplified version that doesn't use useSearchParams
// to avoid the 404 page issue
export default function GoogleAnalytics() {
  // Don't render during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  // Initialize Google Analytics
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    // Track initial page load
    handleRouteChange(window.location.pathname + window.location.search);

    // Listen for route changes
    const handleRouteComplete = () => {
      handleRouteChange(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handleRouteComplete);
    window.addEventListener('pushState', handleRouteComplete);
    window.addEventListener('replaceState', handleRouteComplete);

    return () => {
      window.removeEventListener('popstate', handleRouteComplete);
      window.removeEventListener('pushState', handleRouteComplete);
      window.removeEventListener('replaceState', handleRouteComplete);
    };
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
