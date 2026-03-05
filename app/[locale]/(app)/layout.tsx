import "../../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/authOptions";

import Script from "next/script";
import Header from "../_layout_components/Header";
import Footer from "../_layout_components/Footer";
import TopUpModal from "../_componentForPage/TopUpModal";
import SignDrawer from "../_componentForPage/drawer/SignDrawer";
import AppWrapper from "../_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";
import { routing } from "@/i18n/routing";
import UserHydrator from "../UserHydrator";
import { AuthProvider } from "../authProvider";

export default async function AppLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const session = await getServerSession(authOptions);

  const user = session?.user
    ? {
      id: (session.user as any).id,
      name: session.user.username ?? null,
      email: session.user.email ?? null,
      image: session.user.username ?? (session.user as any).avatar_url ?? null,
      avatar_url:
        (session.user as any).avatar_url ?? null,
      user_id: (session.user as any).user_id ?? null,
      non_expiring_credits: (session.user as any).non_expiring_credits ?? 0,
      expiring_credits: (session.user as any).expiring_credits ?? 0,
      plan_name: (session.user as any).plan_name ?? null,
    }
    : null;

  const common = (await import(`../../../messages/${locale}/common.json`)).default;
  const home = (await import(`../../../messages/${locale}/home.json`)).default;
  const blog = (await import(`../../../messages/${locale}/blog.json`)).default;
  const pricing = (await import(`../../../messages/${locale}/pricing.json`)).default;
  const messages = { ...common, ...home, ...blog, ...pricing };

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
      </head>

      <body suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppWrapper user={user}>
              <UserHydrator initialUser={user}>
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
