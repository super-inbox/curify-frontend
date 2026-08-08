import type { Metadata } from "next";
import BrandDirectionExplorerClient from "./BrandDirectionExplorerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Localized metadata. English authoritative; zh for the tea/coffee-brand
// audience this P0 targets; every other locale falls back to English.
// This route is intentionally not wired into TOOL_REGISTRY / messages/*/home.json
// (see lib/tool-page-guard.ts) — it's a standalone route, so it does not go
// through resolveToolNamespaceOr404 and does not show up on /tools.
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
  return { ...m, robots: { index: false, follow: false } };
}

export default async function BrandDirectionExplorerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BrandDirectionExplorerClient locale={locale} />;
}
