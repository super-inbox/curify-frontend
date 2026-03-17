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
import GoogleAnalyticsTracker from "../_components/GoogleAnalyticsTracker";

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
      <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-23QXSJ8HS7"
  strategy="afterInteractive"
/>
<Script id="ga4-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-23QXSJ8HS7', {
      send_page_view: false
    });
  `}
</Script>

        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>

      <body suppressHydrationWarning>
      <GoogleAnalyticsTracker />

        <NextIntlClientProvider locale={locale} messages={messages}>
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