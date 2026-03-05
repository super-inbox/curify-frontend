// app/sitemap-examples.xml/route.ts
//
// Generates example-detail URLs for Nano templates:
// /nano-template/${templateId}/example/${exampleId}
//
// PLUS tool detail URLs from TOOL_REGISTRY (status != coming_soon):
// /tools/${slug}
//
// Locale strategy:
// - examples: 1) example.locales 2) template locales 3) routing.locales
// - tools: all routing.locales (for now)

import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import { TOOL_REGISTRY } from "@/lib/tools-registry";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales; // readonly tuple

type NanoTemplate = {
  id: string;
  locales?: Record<string, any>;
};

type NanoExample = {
  id: string;
  template_id: string;
  locales?: Record<string, any>;
  updated_at?: string;
  lastmod?: string;
  date?: string;
};

// Build a lookup: templateId -> availableLocales (fallback for language-agnostic examples)
function getTemplateLocalesMap(): Map<string, string[]> {
  const raws = nanoTemplates as unknown as NanoTemplate[];

  const m = new Map<string, string[]>();
  for (const t of raws) {
    if (!t?.id || typeof t.id !== "string") continue;
    const templateId = t.id.trim();
    const availableLocales = t.locales ? Object.keys(t.locales) : [];
    if (availableLocales.length > 0) m.set(templateId, availableLocales);
  }
  return m;
}

function getToolRoutes(): string[] {
  return TOOL_REGISTRY.filter((t) => t.status !== "coming_soon").map(
    (t) => `/tools/${encodeURIComponent(t.slug)}`
  );
}

// Accept readonly arrays to support routing.locales (readonly tuple)
function generateHreflangLinks(route: string, availableLocales?: readonly string[]) {
  const localesToUse: readonly string[] =
    availableLocales && availableLocales.length > 0 ? availableLocales : LOCALES;

  const links = localesToUse
    .map((lng) => {
      // Strip prefix for English
      const pathPrefix = lng === "en" ? "" : `/${lng}`;
      return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
    })
    .join("");

  // x-default strictly points to the unprefixed route
  return links + `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`;
}

function generateUrlEntry(
  locale: string,
  route: string,
  opts?: {
    lastmod?: string;
    changefreq?: string;
    priority?: string;
    availableLocales?: readonly string[];
  }
) {
  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const loc = `${BASE_URL}${pathPrefix}${route}`;

  const lastmod = opts?.lastmod ?? new Date().toISOString();
  const changefreq = opts?.changefreq ?? "weekly";
  const priority = opts?.priority ?? "0.5";

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      ${generateHreflangLinks(route, opts?.availableLocales)}
    </url>
  `;
}

function pickLastmod(x: NanoExample): string | undefined {
  const v = x.updated_at || x.lastmod || x.date;
  return v || undefined;
}

export async function GET() {
  const templateLocalesMap = getTemplateLocalesMap();
  const examples = nanoInspiration as unknown as NanoExample[];
  const toolRoutes = getToolRoutes();

  let urls = "";

  // ✅ 1) Tool detail pages × locales
  // (only those not coming_soon)
  toolRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.8",
        availableLocales: LOCALES,
      });
    });
  });

  // ✅ 2) Nano template example pages × locales (existing logic)
  for (const ex of examples) {
    if (!ex?.id || !ex?.template_id) continue;

    const templateId = String(ex.template_id).trim();
    const exampleId = String(ex.id).trim();

    const exampleLocales = ex.locales ? Object.keys(ex.locales) : [];

    const availableLocales: readonly string[] =
      (exampleLocales.length
        ? exampleLocales
        : templateLocalesMap.get(templateId)) || LOCALES;

    const route = `/nano-template/${encodeURIComponent(templateId)}/example/${encodeURIComponent(
      exampleId
    )}`;

    const lastmod = pickLastmod(ex);

    for (const locale of availableLocales) {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.5",
        availableLocales,
        lastmod,
      });
    }
  }

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls}
</urlset>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}