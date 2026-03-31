import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoMetadata from "@/lib/generated/nanobanana_prompts_metadata.json";
import { TOOL_REGISTRY } from "@/lib/tools-registry";
import { toSlug } from "@/lib/nano_utils";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

// Bump this only when nano template pages materially change
const NANO_TEMPLATES_LASTMOD = "2026-03-11T00:00:00.000Z";

// Keep unchanged pages stable
const STABLE_LASTMOD = "2026-03-01T00:00:00.000Z";

const STATIC_ROUTES = [
  "",
  "/contact",
  "/pricing",
  "/about",
  "/tools",
  "/privacy",
  "/agreement",
  "/nano-banana-pro-prompts",
  "/inspiration-hub",
];

function getNanoTemplateRoutes(): Array<{ route: string; locales: string[] }> {
  const raws = nanoTemplates as unknown as Array<{ id: string }>;

  return raws
    .filter((t) => t?.id && typeof t.id === "string")
    .map((t) => ({
      route: `/nano-template/${encodeURIComponent(toSlug(t.id.trim()))}`,
      locales: [...LOCALES],
    }));
}

function getTagRoutes(): string[] {
  return nanoMetadata.metadata.tags.map(
    (t) => `/nano-banana-pro-prompts/tag/${encodeURIComponent(t.tag)}`
  );
}

function getToolRoutes(): string[] {
  return TOOL_REGISTRY
    .filter((t) => t.status !== "coming_soon")
    .map((t) => `/tools/${encodeURIComponent(t.slug)}`);
}

function generateHreflangLinks(
  route: string,
  availableLocales?: readonly string[]
) {
  const localesToUse =
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
  const priority =
    opts?.priority ?? (route === "" && locale === "en" ? "1.0" : "0.8");

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

export async function GET() {
  const nanoTemplateRoutes = getNanoTemplateRoutes();
  const toolRoutes = getToolRoutes();
  const tagRoutes = getTagRoutes();

  let urls = "";

  // Static routes
  STATIC_ROUTES.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: STABLE_LASTMOD,
        changefreq: route === "" ? "daily" : "weekly",
        priority: route === "" && locale === "en" ? "1.0" : "0.8",
      });
    });
  });

  // Tool routes
  toolRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: STABLE_LASTMOD,
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // Tag pages
  tagRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.7",
      });
    });
  });

  // Nano template detail pages
  nanoTemplateRoutes.forEach(({ route, locales: availableLocales }) => {
    availableLocales.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: NANO_TEMPLATES_LASTMOD,
        changefreq: "weekly",
        priority: "0.6",
        availableLocales,
      });
    });
  });

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