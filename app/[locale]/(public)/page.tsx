import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeClient from "./HomeClient";
import HomeDiscoveryStrip from "./HomeDiscoveryStrip";
// 1. Import your service and mapper
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { SITE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
  type NanoInspirationCardType,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
// Top-25 most-copied gallery prompts (30d). Snapshotted offline via
// curify-studio/scripts/snapshot_top_remix_prompts.py. Inlined at build
// time → no per-render DB/API hit; refreshes when the snapshot is
// committed (run the script when refresh is wanted).
import topRemixSnapshot from "@/public/data/top_remix_prompts.json";
import { POPULAR_PREFILL_QUERIES } from "@/lib/popularPrefillQueries";

// Nano cards on the home page are intentionally locale-agnostic for now —
// always built from the en content + en translations regardless of URL locale.
// Surrounding page chrome (hero copy, header) still respects URL locale via i18n.
async function buildHomeNanoCards(): Promise<NanoInspirationCardType[]> {
  try {
    const t = await getTranslations({ locale: "en", namespace: "nano" });
    const reg = buildNanoRegistry(
      nanoTemplates as unknown as RawTemplate[],
      nanoInspiration as unknown as RawNanoImageRecord[]
    );
    return buildNanoFeedCards(reg, "en", {
      perTemplateMaxImages: 2,
      strictLocale: true,
      translate: (key: string) => {
        try {
          return (t as any)(key) ?? "";
        } catch {
          return "";
        }
      },
    }) as NanoInspirationCardType[];
  } catch (err) {
    console.error("[nano] failed to build nano cards on server:", err);
    return [];
  }
}

// Prerender one static variant per locale -> served from edge cache instead of
// a per-request render (cuts Fast Origin Transfer). Cached until next deploy.
// The page's own generateMetadata below sets the correct per-locale canonical +
// hreflang from params, so SEO output is byte-identical to the dynamic version.
export const revalidate = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });

  const baseUrl = SITE_URL;

  const canonicalUrl = getCanonicalUrl(locale); // home = no path

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguagesMap(),
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonicalUrl,   // ← was using the wrong /en/ url here too
      siteName: "Curify",
      images: [
        {
          url: `${baseUrl}/og-cover.jpg`,
          width: 1200,
          height: 630,
          alt: "Curify – Turn Ideas Into Visual Thinking",
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [`${baseUrl}/og-cover.jpg`],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Build nano cards on the server so the client bundle stays slim.
  // The legacy `cards` prop (inspiration API fetch with limit=50) was
  // destructured by HomeClient but never rendered after the WC widget
  // refactor — drop the fetch entirely to save the API roundtrip on
  // every home render.
  const nanoCards = await buildHomeNanoCards();

  // Pick 4 random queries from the prefill pool for the interleaved
  // search-nudge tiles on the fused home row. Server-evaluated so the
  // picks are stable across hydration; rotates with each ISR rebuild
  // (which fires on commit, including the weekly snapshot workflow).
  // Reduced from 7 → 4 (2026-06-21) — these are navigational nudges,
  // not content; the WC slot already pins a rotating search card at
  // top-right of row 1, so the interleaved tiles are supplementary.
  const searchQueries = (() => {
    const a = [...POPULAR_PREFILL_QUERIES];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 4);
  })();

  return (
    <>
     <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Curify",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web",
      "description":
        "Curify is an AI-powered visual thinking platform that transforms trends, ideas, and knowledge into structured, shareable visual content including inspiration cards, infographics, and localized media.",
      "url": "https://www.curify-ai.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    })
  }}
/>
      <HomeClient
        locale={locale}
        nanoCards={nanoCards}
        topRemixPrompts={topRemixSnapshot.prompts}
        searchQueries={searchQueries}
        discoveryStrip={<HomeDiscoveryStrip locale={locale} />}
      />
    </>
  );
}
