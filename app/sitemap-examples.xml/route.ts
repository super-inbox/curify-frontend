import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import { toSlug } from "@/lib/nano_utils";
import {
  SEO_RETITLED_LASTMOD,
  SEO_RETITLED_TEMPLATE_IDS,
} from "@/lib/seo_retitled_templates";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;
const STABLE_LASTMOD = "2026-03-01T00:00:00.000Z";

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

// templateId -> available locales
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

function generateHreflangLinks(
  route: string,
  availableLocales?: readonly string[]
) {
  const localesToUse: readonly string[] =
    availableLocales && availableLocales.length > 0 ? availableLocales : LOCALES;

  const links = localesToUse
    .map((lng) => {
      const pathPrefix = lng === "en" ? "" : `/${lng}`;
      return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
    })
    .join("");

  return (
    links +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`
  );
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

  const lastmod = opts?.lastmod ?? STABLE_LASTMOD;
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
  return x.updated_at || x.lastmod || x.date || undefined;
}

export async function GET() {
  const templateLocalesMap = getTemplateLocalesMap();
  const examples = nanoInspiration as unknown as NanoExample[];

  let urls = "";

  for (const ex of examples) {
    if (!ex?.id || !ex?.template_id) continue;

    const templateId = String(ex.template_id).trim();
    const exampleId = String(ex.id).trim();

    const exampleLocales = ex.locales ? Object.keys(ex.locales) : [];
    const availableLocales: readonly string[] =
      (exampleLocales.length
        ? exampleLocales
        : templateLocalesMap.get(templateId)) || LOCALES;

    const route = `/nano-template/${encodeURIComponent(
      toSlug(templateId)
    )}/example/${encodeURIComponent(exampleId)}`;

    // If the parent template was retitled in the SEO pass, bump the
    // lastmod for every one of its examples so Google recrawls the
    // example pages too (they render the same i18n title as the h1).
    const lastmod = SEO_RETITLED_TEMPLATE_IDS.has(templateId)
      ? SEO_RETITLED_LASTMOD
      : pickLastmod(ex) ?? STABLE_LASTMOD;

    for (const locale of availableLocales) {
      urls += generateUrlEntry(locale, route, {
        lastmod,
        changefreq: "weekly",
        priority: "0.5",
        availableLocales,
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