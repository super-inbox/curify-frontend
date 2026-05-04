"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-23QXSJ8HS7";
// Skip GA for crawler/bot user agents so their visits don't pollute
// real-user analytics. Pattern matches the typical "bot/spider/crawler"
// signatures Amazonbot, Googlebot, Bingbot, etc. all advertise.
const BOT_UA_RE = /bot|spider|crawl|slurp|screenshot/i;

export default function GoogleAnalyticsInit() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const ua =
      typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    if (BOT_UA_RE.test(ua)) return;
    setShouldLoad(true);
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
