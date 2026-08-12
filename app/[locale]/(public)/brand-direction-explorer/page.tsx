import type { Metadata } from "next";
import BrandDirectionExplorerClient from "./BrandDirectionExplorerClient";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Localized metadata. English authoritative; zh for the tea/coffee-brand
// audience this P0 targets; every other locale falls back to English.
// This route is intentionally not wired into TOOL_REGISTRY / messages/*/home.json
// (see lib/tool-page-guard.ts) — it's a standalone route, so it does not go
// through resolveToolNamespaceOr404 and does not show up on /tools.
//
// INDEXABLE since 2026-08-12. It shipped noindex as a pitch/demo surface, but it
// turned out to be the highest-throughput surface on the site: 6 of the 20
// projects created in the week to 08-11 came from here (30%), two users running
// generate → download → generate → download loops. Meanwhile it was
// `noindex, nofollow`, absent from the sitemap, absent from /tools, and
// "URL is unknown to Google — never crawled". The product was working and
// nothing could find it.
//
// The URL is deliberately NOT moved under /tools/<slug>: that would need a
// TOOL_REGISTRY entry plus a home.json namespace, and relocating the one surface
// that converts best is not worth the risk. Discovery is solved instead by the
// sitemap entry (app/sitemap.xml/route.ts) and by cards on the use-case pages.
const META: Record<string, { title: string; description: string }> = {
  en: {
    title: "Brand Direction Explorer — pick a direction, generate a visual",
    description:
      "Pick one of three preset creative directions for a coffee shop opening poster or a Chinese tea brand moodboard, then generate a single visual from it.",
  },
  zh: {
    title: "品牌创意方向探索 —— 选择方向，生成视觉方案",
    description:
      "为咖啡店开业海报或中式茶饮品牌选择三个预置创意方向之一，生成对应的视觉方案。",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale || "en").toLowerCase().split("-")[0];
  const m = META[lang] ?? META.en;
  return {
    ...m,
    alternates: {
      canonical: getCanonicalUrl(locale, "/brand-direction-explorer"),
      languages: getLanguagesMap("/brand-direction-explorer"),
    },
  };
}

export default async function BrandDirectionExplorerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BrandDirectionExplorerClient locale={locale} />;
}
