import type { Metadata } from "next";
import { AuthProvider } from "./authProvider";
import "../globals.css";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

import Script from "next/script";
import Header from "./_layout_components/Header";
import Footer from "./_layout_components/Footer";
import TopUpModal from "./_componentForPage/TopUpModal";
import SignDrawer from "./_componentForPage/drawer/SignDrawer";
import AppWrapper from "./_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";
import { routing } from "@/i18n/routing";
import UserHydrator from "./UserHydrator";

export const metadata: Metadata = {
  title: "Curify Studio | AI Video Translation, Dubbing & Subtitles",
  description:
    "Curify is an AI-native content creation platform offering voiceover, dubbing, subtitles, and lip sync in 170+ languages. Translate and localize your videos instantly.",
  keywords: [
    "AI video translation",
    "video dubbing",
    "bilingual subtitles",
    "voice cloning",
    "AI lip sync",
    "Curify Studio",
    "automated content localization"
  ],
  openGraph: {
    title: "Curify Studio | AI Video Translation & Dubbing",
    description:
      "AI-powered voiceover, dubbing, and subtitles in 170+ languages with emotional tone and lip sync.",
    url: "https://curify-ai.com",
    siteName: "Curify Studio",
    images: [
      {
        url: "https://curify-ai.com/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Curify Studio AI platform",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "https://curify-ai.com",
  },
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout(props: Props) {
  const { children, params } = props;
  const { locale } = await params;

  const session = await getServerSession(authOptions);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <head>
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer />

        {/* Structured Data: JSON-LD */}
        <Script id="json-ld" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Curify Studio",
            operatingSystem: "Web",
            applicationCategory: "MultimediaApplication",
            url: "https://curify-ai.com",
            description:
              "AI-powered voiceover, dubbing, and subtitles in 170+ languages. Preserve emotion and lip sync in your localized content.",
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            creator: {
              "@type": "Organization",
              name: "Curify AI",
              url: "https://curify-ai.com",
            },
          })}
        </Script>

        {/* Icon font */}
        <Script
          src="//at.alicdn.com/t/c/font_4910365_wqytpll6n9g.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <AuthProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppWrapper user={null}>
              <UserHydrator>
                <Header />
                <TopUpModal />
                <SignDrawer />
                {children}
                <Toaster />
                <Footer />
              </UserHydrator>
            </AppWrapper>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
