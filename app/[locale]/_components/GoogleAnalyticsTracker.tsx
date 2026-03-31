"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;
    const pageLocation = window.location.href;

    if (lastTrackedUrlRef.current === pageLocation) return;
    lastTrackedUrlRef.current = pageLocation;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: pageLocation,
      page_path: pagePath,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[GA] page_view", {
        page_title: document.title,
        page_location: pageLocation,
        page_path: pagePath,
      });
    }
  }, [pathname, searchParams]);

  return null;
}