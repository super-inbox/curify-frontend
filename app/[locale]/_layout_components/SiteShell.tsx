import "../../globals.css";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import { Suspense } from "react";
import JotaiProvider from "../_components/JotaiProvider";
import { Toaster } from "react-hot-toast";

import Header from "./Header";
import Footer from "./Footer";
import AppWrapper from "./AppWrapper";
import SiteTopBar from "./SiteTopBar";
import TopUpModal from "../_componentForPage/TopUpModal";
import SignDrawer from "../_componentForPage/drawer/SignDrawer";
import GoogleAnalyticsInit from "../_components/GoogleAnalyticsInit";
import GoogleAnalyticsTracker from "../_components/GoogleAnalyticsTracker";
import SessionStartTracker from "../_components/SessionStartTracker";

/**
 * The public site chrome (html/body, providers, header, footer).
 *
 * Extracted from `(public)/layout.tsx` so the `(static)` route group can render
 * a byte-identical shell WITHOUT inheriting that layout's `headers()` call.
 * Reading a request header opts the whole segment tree into dynamic rendering,
 * which was silently overriding the `revalidate = false` + `generateStaticParams`
 * already declared on the programmatic pages (verified on prod: every public URL
 * served `cache-control: private, no-cache, no-store` + `x-vercel-cache: MISS`
 * at 4-14s TTFB). Both layouts must keep rendering the same markup, so the
 * chrome lives here and nowhere else.
 *
 * @param clientMessages already trimmed by `pickClientMessages()` — this
 *   component does no trimming of its own, because the two groups decide the
 *   keep-set differently (see each layout).
 */
export default function SiteShell({
  locale,
  clientMessages,
  children,
}: {
  locale: string;
  clientMessages: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>{/* keep existing scripts */}</head>

      <body suppressHydrationWarning>
        <GoogleAnalyticsInit />

        {/* Reads useSearchParams to log page_view; it renders null, so a
            Suspense boundary costs nothing in the prerendered HTML and keeps
            query-change tracking intact. */}
        <Suspense fallback={null}>
          <GoogleAnalyticsTracker />
        </Suspense>
        <SessionStartTracker />
        <Script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" strategy="afterInteractive" />
        <Script id="init-mermaid" strategy="afterInteractive">
          {`
            setTimeout(() => {
              if (typeof mermaid !== 'undefined') {
                mermaid.initialize({ 
                  startOnLoad: true, 
                  theme: 'default',
                  flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true
                  }
                });
                mermaid.run();
              }
            }, 1000);
          `}
        </Script>

        <JotaiProvider>
          <NextIntlClientProvider locale={locale} messages={clientMessages}>
            <AppWrapper user={null}>
              <Header />

              <main className="min-h-screen lg:ml-[70px]">
                <TopUpModal />
                <SignDrawer />

                <SiteTopBar locale={locale} />

                {children}

                <Toaster />
              </main>
              <Footer />
            </AppWrapper>
          </NextIntlClientProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
