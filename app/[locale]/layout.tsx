import type { Metadata } from "next";
import { AuthProvider } from "./authProvider";
import "../globals.css";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/authOptions";
import { headers } from "next/headers";

import Script from "next/script";
import Header from "./_layout_components/Header";
import Footer from "./_layout_components/Footer";
import TopUpModal from "./_componentForPage/TopUpModal";
import SignDrawer from "./_componentForPage/drawer/SignDrawer";
import AppWrapper from "./_layout_components/AppWrapper";
import { Toaster } from "react-hot-toast";
import { routing } from "@/i18n/routing";
import UserHydrator from "./UserHydrator";

/* -------------------------
 * Localized SEO Metadata
 * ------------------------- */
const localizedMeta: Record<string, { title: string; description: string }> = {
  en: {
    title: "Curify Studio | AI Video Translation, Dubbing & Subtitles",
    description:
      "Curify is an AI-native content creation platform offering voiceover, dubbing, subtitles, and lip sync in 170+ languages.",
  },
  zh: {
    title: "Curify Studio | 视频翻译与配音 AI 平台",
    description:
      "Curify 是一个 AI 内容创作平台，支持 170+ 语言的视频翻译、配音与字幕生成。",
  },
  es: {
    title: "Curify Studio | Plataforma de Doblaje y Subtítulos con IA",
    description:
      "Curify es una plataforma de creación de contenido potenciada por IA para traducción y localización de videos en más de 170 idiomas.",
  },
  fr: {
    title: "Curify Studio | Traduction et doublage vidéo IA",
    description:
      "Curify est une plateforme de création de contenu IA offrant traduction, doublage et sous-titrage vidéo en 170+ langues.",
  },
  de: {
    title: "Curify Studio | KI-gestützte Videountertitelung & Übersetzung",
    description:
      "Curify ist eine KI-gestützte Plattform zur Videolokalisierung mit Übersetzung, Untertiteln und Lippensynchronisation.",
  },
  hi: {
    title: "Curify Studio | एआई वीडियो अनुवाद और डबिंग प्लेटफॉर्म",
    description:
      "Curify एक एआई-संचालित वीडियो अनुवाद और डबिंग प्लेटफॉर्म है जो 170+ भाषाओं में काम करता है।",
  },
  ru: {
    title: "Curify Studio | Платформа для перевода и дубляжа видео с ИИ",
    description:
      "Curify — это платформа на базе ИИ для перевода, дубляжа и субтитров на 170+ языках.",
  },
  ja: {
    title: "Curify Studio | AI動画翻訳・吹き替えプラットフォーム",
    description:
      "CurifyはAIを活用した動画翻訳・吹き替え・字幕生成プラットフォームです（170以上の言語対応）。",
  },
  ko: {
    title: "Curify Studio | AI 영상 번역 및 더빙 플랫폼",
    description:
      "Curify는 170개 이상의 언어로 영상 번역, 더빙 및 자막 생성을 지원하는 AI 콘텐츠 플랫폼입니다。",
  },
};

/* -------------------------
 * Metadata generator
 * ------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = localizedMeta[locale] || localizedMeta["en"];

  const rawHeaders = await headers();
  const pathname = rawHeaders.get("x-pathname") || "";
  const normalizedPath =
    pathname === `/${locale}` ? "" : pathname.replace(`/${locale}`, "");

  return {
    metadataBase: new URL("https://www.curify-ai.com"),
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/${locale}${normalizedPath}`,
      type: "website",
      images: [
        {
          url: "/og-banner.png",
          width: 1200,
          height: 630,
          alt: "Curify Studio AI platform",
        },
      ],
    },
    alternates: {
      canonical: `/en${normalizedPath}`,
      languages: {
        ...routing.locales.reduce((acc, loc) => {
          acc[loc] = `/${loc}${normalizedPath}`;
          return acc;
        }, {} as Record<string, string>),
        "x-default": `/en${normalizedPath}`,
      },
    },
  };
}

/* -------------------------
 * Locale Layout
 * ------------------------- */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  /* -------------------------
   * Path + Protection Logic
   * ------------------------- */
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const protectedPrefixes = ["/workspace", "/magic", "/project_details"];

  const isProtectedPage = protectedPrefixes.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );

  // ✅ Extract Credits & Extended Info from Session
  const user = session?.user
    ? {
        id: (session.user as any).id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? (session.user as any).avatar_url ?? null,
        avatar_url: (session.user as any).avatar_url ?? session.user.image ?? null,
        user_id: (session.user as any).user_id ?? null,
        non_expiring_credits: (session.user as any).non_expiring_credits ?? 0,
        expiring_credits: (session.user as any).expiring_credits ?? 0,
        plan_name: (session.user as any).plan_name ?? null,
      }
    : null;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const meta = localizedMeta[locale] || localizedMeta["en"];

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* GA4 */}
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

        {/* Google Sign-In */}
        <script src="https://accounts.google.com/gsi/client" async defer />

        {/* Structured Data */}
        <Script id="json-ld" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Curify Studio",
            operatingSystem: "Web",
            applicationCategory: "MultimediaApplication",
            url: "https://www.curify-ai.com",
            description: meta.description,
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            creator: {
              "@type": "Organization",
              name: "Curify AI",
              url: "https://www.curify-ai.com",
            },
          })}
        </Script>

        {/* Icon Font */}
        <Script
          src="//at.alicdn.com/t/c/font_4910365_wqytpll6n9g.js"
          strategy="beforeInteractive"
        />
      </head>

      <body suppressHydrationWarning>
        <AuthProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* 
              ✅ OPTIMIZATION:
              - AppWrapper gets user from session (includes credits)
              - UserHydrator only wraps protected pages
              - UserHydrator receives initialUser to set atom immediately
              - API fetch only happens on protected pages when needed
            */}
            <AppWrapper user={user}>
              {isProtectedPage ? (
                <UserHydrator initialUser={user}>
                  <Header />
                  <TopUpModal />
                  <SignDrawer />
                  {children}
                  <Toaster />
                  <Footer />
                </UserHydrator>
              ) : (
                <>
                  <Header />
                  <TopUpModal />
                  <SignDrawer />
                  {children}
                  <Toaster />
                  <Footer />
                </>
              )}
            </AppWrapper>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
