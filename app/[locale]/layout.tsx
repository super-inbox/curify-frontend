import type { Metadata } from "next";
import { AuthProvider } from "./authProvider";
import "../globals.css";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
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

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout(props: Props) {
  const { children, params } = props;
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Import locale messages
  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Map localized meta tags
  const localizedMeta: Record<string, { title: string; description: string }> = {
    en: {
      title: "Curify Studio | AI Video Translation, Dubbing & Subtitles",
      description:
        "Curify is an AI-native content creation platform offering voiceover, dubbing, subtitles, and lip sync in 170+ languages.",
    },
    zh: {
      title: "Curify Studio | 视频翻译与配音 AI 平台",
      description: "Curify 是一个 AI 内容创作平台，支持 170+ 语言的视频翻译、配音与字幕生成。",
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

  const meta = localizedMeta[locale];

  // 👇 Read pathname from middleware (critical for canonical correctness)
  const rawHeaders = await headers();
  const pathname = rawHeaders.get("x-pathname") || "";
  const normalizedPath =
    pathname === `/${locale}` ? "" : pathname.replace(`/${locale}`, "");

  return (
    <html lang={locale}>
      <head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`https://curify-ai.com/${locale}${normalizedPath}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://curify-ai.com/og-banner.png" />
        <meta property="og:image:alt" content="Curify Studio AI platform" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* ---------------------------------------------- */}
        {/*               CANONICAL SEO FIX                */}
        {/* ---------------------------------------------- */}

        {/* Canonical: always point to EN as primary */}
        <link
          rel="canonical"
          href={`https://curify-ai.com/en${normalizedPath}`}
        />

        {/* Hreflang alternates for each locale */}
        {routing.locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`https://curify-ai.com/${loc}${normalizedPath}`}
          />
        ))}

        {/* Fallback */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://curify-ai.com/en${normalizedPath}`}
        />

        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer />

        {/* Structured Data */}
        <Script id="json-ld" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Curify Studio",
            operatingSystem: "Web",
            applicationCategory: "MultimediaApplication",
            url: "https://curify-ai.com",
            description:
              meta.description ??
              "AI-powered voiceover, dubbing, and subtitles in 170+ languages.",
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
