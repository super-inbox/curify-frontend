// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import { TOOL_REGISTRY } from "@/lib/tools-registry";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

// ✅ Static pages (shared across locales)
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

// ✅ Nano template routes - RESPECTS LOCALE
function getNanoTemplateRoutes(): Array<{ route: string; locales: string[] }> {
  const raws = nanoTemplates as unknown as Array<{
    id: string;
    locales?: Record<string, any>;
  }>;

  return raws
    .filter((t) => t?.id && typeof t.id === "string")
    .map((t) => {
      const templateId = t.id.trim();
      const availableLocales = t.locales ? Object.keys(t.locales) : [];
      return {
        route: `/nano-template/${encodeURIComponent(templateId)}`,
        locales: availableLocales,
      };
    })
    .filter((item) => item.locales.length > 0);
}

// ✅ Tool routes from registry
function getToolRoutes(): string[] {
  return TOOL_REGISTRY
    .filter((t) => t.status !== "coming_soon")
    .map((t) => `/tools/${encodeURIComponent(t.slug)}`);
}

// hreflang generator
function generateHreflangLinks(route: string, availableLocales?: readonly string[]) {
  const localesToUse =
    availableLocales && availableLocales.length > 0 ? availableLocales : LOCALES;

  const links = localesToUse
    .map((lng) => {
      const pathPrefix = lng === "en" ? "" : `/${lng}`;
      return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
    })
    .join("");

  return links + `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`;
}

// URL entry generator
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

  let urls = "";

  // Static routes
  STATIC_ROUTES.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: route === "" ? "daily" : "weekly",
        priority: route === "" && locale === "en" ? "1.0" : "0.8",
      });
    });
  });

  // Tool routes
  toolRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // Nano templates
  nanoTemplateRoutes.forEach(({ route, locales: availableLocales }) => {
    availableLocales.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
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