// ✅ You have enough info now.
// Your example schema:
// {
//   id: string,                // <-- exampleId (has spaces; keep encodeURIComponent)
//   template_id: string,       // <-- templateId
//   locales: { [lng]: {...} }  // <-- availableLocales = Object.keys(locales)
//   updated_at?: string        // (not present now; we'll fallback to now)
// }
//
// We will implement:
// - /sitemap.xml (main): static + blogs + templates (your existing file, unchanged)
// - /sitemap-examples.xml (new): all example detail pages, locale-aware + fallback to template locales
//
// Add file: app/sitemap-examples.xml/route.ts
// And add import: nanoInsp from "@/public/data/nano_inspiration.json"

// -------------------------------
// app/sitemap-examples.xml/route.ts
// -------------------------------

import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

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

function generateHreflangLinks(route: string, availableLocales?: string[]) {
  const localesToUse = availableLocales?.length ? availableLocales : LOCALES;

  const links = localesToUse
    .map((lng) => {
      const pathPrefix = lng === "en" ? "" : `/${lng}`;
      return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
    })
    .join("");

  return links + `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`;
}

function generateUrlEntry(
  locale: string,
  route: string,
  opts?: {
    lastmod?: string;
    changefreq?: string;
    priority?: string;
    availableLocales?: string[];
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
  if (!v) return undefined;
  // keep as-is; if it isn't ISO, Google is still usually OK
  return v;
}

export async function GET() {
  const templateLocalesMap = getTemplateLocalesMap();
  const examples = nanoInspiration as unknown as NanoExample[];

  let urls = "";

  for (const ex of examples) {
    if (!ex?.id || !ex?.template_id) continue;

    const templateId = String(ex.template_id).trim();
    const exampleId = String(ex.id).trim();

    // ✅ locale strategy:
    // 1) example locales (most accurate)
    // 2) fallback to template locales
    // 3) fallback to global LOCALES
    const exampleLocales = ex.locales ? Object.keys(ex.locales) : [];
    const availableLocales =
      (exampleLocales.length ? exampleLocales : templateLocalesMap.get(templateId)) || LOCALES;

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