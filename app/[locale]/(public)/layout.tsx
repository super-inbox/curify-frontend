import "../../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { headers } from "next/headers";
import type { Metadata } from "next";

import Header from "../_layout_components/Header";
import Footer from "../_layout_components/Footer";
import TopUpModal from "../_componentForPage/TopUpModal";
import SignDrawer from "../_componentForPage/drawer/SignDrawer";
import AppWrapper from "../_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  
  // Remove locale prefix from pathname to get the canonical path
  // e.g. /zh/pricing -> /pricing
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "";
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";
  
  // Construct languages map for all supported locales
  const languages: Record<string, string> = {};
  routing.locales.forEach((lang) => {
    languages[lang] = `${siteUrl}/${lang}${pathWithoutLocale}`;
  });

  return {
    alternates: {
      canonical: `${siteUrl}/${locale}${pathWithoutLocale}`,
      languages: {
        ...languages,
        "x-default": `${siteUrl}/en${pathWithoutLocale}`,
      },
    },
    // Add default title template
    title: {
      template: '%s | Curify Studio',
      default: 'Curify Studio'
    },
    // Fallback description if not provided by page
    description: 'Curify is an AI-native platform helping creators, educators, and media teams produce and localize videos, manga, and presentations at scale.'
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

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-23QXSJ8HS7"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-23QXSJ8HS7', { page_path: window.location.pathname });
          `}
        </Script>

        <script src="https://accounts.google.com/gsi/client" async defer />

        <Script
          src="//at.alicdn.com/t/c/font_4910365_wqytpll6n9g.js"
          strategy="beforeInteractive"
        />
      </head>

      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Public: no server session, no user hydration */}
          <AppWrapper user={null}>
            <Header />
            <TopUpModal />
            <SignDrawer />
            {children}
            <Toaster />
            <Footer />
          </AppWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
