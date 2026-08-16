// app/[locale]/(public)/enterprise/page.tsx
//
// Landing surface for the Enterprise AI Implementation line (2nd B2B line,
// started 2026-07-25). Copy source of truth: ./copy.ts, itself derived from
// ~/curify-studio/docs/enterprise-ai-capability-one-pager.md.
//
// Why this page exists (UC-P0-2, docs/workstream-vertical-use-cases.md
// §2026-08-12): it is the artifact the Enterprise-AI motions point at —
// LinkedIn founder-led posts and SI-partner outreach on the EN side, and
// WeChat / relationship-sourced CN enterprise conversations on the zh side.
//
// BILINGUAL: en + zh (see ./copy.ts). Other locales render the English copy.
//
// NOT AN SEO SURFACE (decision 2026-08-12). This page is deliberately absent
// from the sitemap: every reader arrives from a conversation, a post or an
// email, not from a query, and the CN half of the pipeline is entirely
// relationship-sourced. We do NOT emit `noindex` — that would also break the
// case where a bid lead or partnerships lead searches the company name to
// check we're real, which is the one search path that matters here. Per-locale
// canonicals + en/zh alternates below are correctness, not optimization.

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";
import { ENTERPRISE_COPY, enterpriseLang } from "./copy";
import EnterpriseClient from "./EnterpriseClient";

// Prerender per locale — static copy, no per-request data. Edge-cached.
export const revalidate = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = enterpriseLang(locale);
  const { title, description } = ENTERPRISE_COPY[lang].meta;

  // Canonical points at the URL for the language actually rendered, so the 8
  // English-fallback locales consolidate onto /enterprise instead of each
  // claiming to be a distinct page.
  const canonical =
    lang === "zh" ? `${SITE_URL}/zh/enterprise` : `${SITE_URL}/enterprise`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/enterprise`,
        zh: `${SITE_URL}/zh/enterprise`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Curify",
      type: "website",
      locale,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Service schema. Kept deliberately modest and factually checkable: it
// describes the offering and the founder, and makes no claim of a delivered
// enterprise reference (the anchor engagement is still a proposal — see
// ~/curify-studio/docs/workstream-enterprise-ai-b2b.md).
function buildJsonLd(lang: "en" | "zh") {
  const { title, description } = ENTERPRISE_COPY[lang].meta;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    serviceType:
      "AI document intelligence, RAG knowledge management, contract review",
    provider: {
      "@type": "Organization",
      name: "Curify AI",
      url: SITE_URL,
      founder: {
        "@type": "Person",
        name: "Jay Wang",
        jobTitle: "Founder",
        description:
          "16+ years in AI and data. Head of AI at ByBit, formerly Principal Applied Science Manager at Microsoft and Director of Data Science at Kuaishou. Ph.D. in Statistics; author of Building Recommender Systems Using LLMs (Springer, 2025).",
      },
    },
    areaServed: ["GB", "EU", "US", "CN"],
    description,
    url: lang === "zh" ? `${SITE_URL}/zh/enterprise` : `${SITE_URL}/enterprise`,
    inLanguage: lang,
  };
}

export default async function EnterprisePage({ params }: Props) {
  const { locale } = await params;
  const lang = enterpriseLang(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(lang)) }}
      />
      <EnterpriseClient />
    </>
  );
}
