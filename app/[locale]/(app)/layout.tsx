import "../../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import Script from "next/script";
import Header from "../_layout_components/Header";
import Footer from "../_layout_components/Footer";
import TopUpModal from "../_componentForPage/TopUpModal";
import SignDrawer from "../_componentForPage/drawer/SignDrawer";
import AppWrapper from "../_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";
import { routing } from "@/i18n/routing";
import GoogleAnalyticsInit from "../_components/GoogleAnalyticsInit";

import GoogleAnalyticsTracker from "../_components/GoogleAnalyticsTracker";

import EntryBar from "@/app/[locale]/_components/EntryBar";
import { headers } from "next/headers";

export default async function AppLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  // 👇 detect path
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const isBlogPage = pathname.includes("/blog");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* keep existing scripts */}
      </head>

      <body suppressHydrationWarning>
      <GoogleAnalyticsInit />

        <GoogleAnalyticsTracker />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppWrapper user={null}>
            <Header />

            <main className="min-h-screen lg:ml-[225px]">
              <TopUpModal />
              <SignDrawer />          

              {children}

              <Toaster />
              <Footer />
            </main>
          </AppWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}