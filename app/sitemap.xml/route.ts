import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoMetadata from "@/lib/generated/nanobanana_prompts_metadata.json";
import { TOOL_REGISTRY } from "@/lib/tools-registry";
import { USE_CASES } from "@/lib/use-cases";
import { toSlug } from "@/lib/nano_utils";
import { isLocalizedTopic } from "@/lib/topicRegistry_pure";
import {
  SEO_RETITLED_LASTMOD,
  SEO_RETITLED_TEMPLATE_IDS,
} from "@/lib/seo_retitled_templates";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

// Bump this only when nano template pages materially change. Bumped
// 2026-05-08 to recrawl after restricting hreflang/canonical to the
// locales each template actually localizes (fixes "Duplicate without
// user-selected canonical" reports for non-en/zh template URLs).
const NANO_TEMPLATES_LASTMOD = "2026-05-08T00:00:00.000Z";

// Bumped 2026-05-08 — topic pages got per-locale `intro` paragraphs +
// keywords (fixes "Crawled - currently not indexed" for non-en/zh
// topic URLs that previously rendered near-identical content).
const TOPICS_LASTMOD = "2026-05-08T00:00:00.000Z";

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

function getNanoTemplateRoutes(): Array<{
  route: string;
  locales: string[];
  lastmod: string;
}> {
  const raws = nanoTemplates as unknown as Array<{
    id: string;
    locales?: Record<string, unknown>;
  }>;

  return raws
    .filter((t) => t?.id && typeof t.id === "string")
    .map((t) => {
      // Only emit URLs for locales the template actually has content
      // for (typically "en", sometimes "en"+"zh"). Including all 10
      // locales here told Google about duplicate URLs that all rendered
      // the same fallback content, triggering "Duplicate without
      // user-selected canonical" deindex reports.
      const tplLocales = t.locales ? Object.keys(t.locales) : [];
      const localized = tplLocales.filter((l) =>
        (LOCALES as readonly string[]).includes(l)
      );
      return {
        route: `/nano-template/${encodeURIComponent(toSlug(t.id.trim()))}`,
        locales: localized.length > 0 ? localized : ["en"],
        lastmod: SEO_RETITLED_TEMPLATE_IDS.has(t.id.trim())
          ? SEO_RETITLED_LASTMOD
          : NANO_TEMPLATES_LASTMOD,
      };
    });
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

function getUseCaseRoutes(): string[] {
  return USE_CASES.map((uc) => `/use-cases/${uc.slug}`);
}

function getTopicRoutes(): string[] {
  // Collect topics that appear directly on templates (parent-level topics)
  const templateLevelTopics = new Set<string>();
  for (const t of nanoTemplates as unknown as Array<{ topics?: string | string[] }>) {
    const raw = t.topics;
    const topics = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw.split(",").map((s) => s.trim())
      : [];
    for (const tp of topics) {
      if (tp) templateLevelTopics.add(tp.toLowerCase());
    }
  }
  // Filter to i18n-authored topics only — topics without i18n render
  // noindex,nofollow (see app/[locale]/(public)/topics/[slug]/page.tsx:62-68),
  // so emitting them in the sitemap wastes crawl budget. Pre-filter cuts
  // ~71 topics × 10 locales = 710 noindex'd sitemap entries.
  // See docs/wedge1-hygiene-findings-2026-06-26.md.
  return Array.from(templateLevelTopics)
    .filter((tp) => isLocalizedTopic(tp))
    .map((tp) => `/topics/${tp}`);
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
  const useCaseRoutes = getUseCaseRoutes();
  const topicRoutes = getTopicRoutes();

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

  // Topic pages
  topicRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: TOPICS_LASTMOD,
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // Use case pages
  useCaseRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: STABLE_LASTMOD,
        changefreq: "weekly",
        priority: "0.8",
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

  // Tag pages — EN only. Non-EN tag pages render
  // <meta name="robots" content="noindex,follow"> + canonical pointing to
  // the EN URL (per the deliberate locale-collapse policy, since tag-page
  // content is identical across locales). Emitting them in the sitemap
  // told Google about 461 × 9 = 4,149 noindex'd URLs that diluted crawl
  // budget. See docs/wedge1-hygiene-findings-2026-06-26.md.
  tagRoutes.forEach((route) => {
    urls += generateUrlEntry("en", route, {
      changefreq: "weekly",
      priority: "0.7",
    });
  });

  // Nano template detail pages
  nanoTemplateRoutes.forEach(({ route, locales: availableLocales, lastmod }) => {
    availableLocales.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod,
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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}