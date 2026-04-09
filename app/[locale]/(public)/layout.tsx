import "../../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import JotaiProvider from "@/app/[locale]/_components/JotaiProvider";
import { routing } from "@/i18n/routing";
import { headers } from "next/headers";
import type { Metadata } from "next";

import Header from "../_layout_components/Header";
import Footer from "../_layout_components/Footer";
import TopUpModal from "../_componentForPage/TopUpModal";
import SignDrawer from "../_componentForPage/drawer/SignDrawer";
import AppWrapper from "../_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";
import GoogleAnalyticsInit from "../_components/GoogleAnalyticsInit";

import GoogleAnalyticsTracker from "../_components/GoogleAnalyticsTracker";

import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import EntryBar from "@/app/[locale]/_components/EntryBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "";

  return {
    alternates: {
      canonical: getCanonicalUrl(locale, pathWithoutLocale),
      languages: getLanguagesMap(pathWithoutLocale),
    },
    title: {
      template: "%s | Curify Studio",
      default: "Curify Studio",
    },
    description:
      "Curify is an AI-native platform helping creators, educators, and media teams produce and localize videos, manga, and presentations at scale.",
  };
}

export default async function PublicLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const isBlogPage = pathname.includes("/blog");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>{/* keep existing scripts */}</head>

      <body suppressHydrationWarning>
      <GoogleAnalyticsInit />

        <GoogleAnalyticsTracker />
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
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppWrapper user={null}>
              <Header />

            <main className="min-h-screen lg:ml-[300px]">
              <TopUpModal />
              <SignDrawer />
            
              {!isBlogPage && (
                  <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 px-4 pt-3 pb-4 backdrop-blur md:px-6 lg:px-8">
                  <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
                    {/* ✅ Narrower EntryBar */}
                    <div className="w-full max-w-[900px]">
                      <EntryBar locale={locale} />
                    </div>
                  </div>
                </div>
              )}

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