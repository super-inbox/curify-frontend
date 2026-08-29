import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoMetadata from "@/lib/generated/nanobanana_prompts_metadata.json";
import { TOOL_REGISTRY } from "@/lib/tools-registry";
import { USE_CASES } from "@/lib/use-cases";
import { MBTI_TYPES } from "@/lib/mbti-meta";
import { toSlug } from "@/lib/nano_utils";
import { isLocalizedTopic } from "@/lib/topicRegistry_pure";
import {
  SEO_RETITLED_LASTMOD,
  FASHION_RECRAWL_LASTMOD,
  FASHION_RECRAWL_TEMPLATE_IDS,
  SEO_RETITLED_TEMPLATE_IDS,
} from "@/lib/seo_retitled_templates";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

// ── lastmod policy ───────────────────────────────────────────────────────────
// These are the primary at-scale recrawl signal. The Indexing API is capped at
// 200 URLs/day; lastmod covers all ~1,000 at once, so a stale value here
// suppresses recrawl far more broadly than any ping campaign can compensate for.
//
// Audited 2026-08-16 and every constant was months stale: 1,624 URLs advertised
// 2026-05-08 and 912 advertised 2026-03-01, while a 420-URL inspection sweep
// found only ~20% of the sitemap indexed — dominated by "Discovered, never
// crawled". We had materially changed these pages and then told Google they had
// not: the 2026-08-05 canonical-fold fix cut every page's HTML from 2.17MB to
// 480KB (the largest change the site has had), followed by blog titles, tool
// titles, topic i18n and FAQPage schema on 2026-08-12.
//
// Bump the relevant constant whenever a change alters what a crawler sees. Do
// NOT wire these to the build date — a sitemap whose lastmod moves on every
// deploy stops carrying information and Google learns to discount it.

// The 08-05 fold fix changed the rendered HTML of every template page.
const NANO_TEMPLATES_LASTMOD = "2026-08-05T00:00:00.000Z";

// Base for topic pages: the 08-05 fold fix, which is the last change that hit
// ALL of them. Pages that changed later take an override below — claiming a
// later date for the whole group would overstate freshness for 108 of 109
// topics, and an overstated lastmod is what teaches Google to discount the
// signal entirely.
const TOPICS_LASTMOD = "2026-08-05T00:00:00.000Z";

// Per-page overrides, keyed by topic slug. Only pages that genuinely changed.
const TOPIC_LASTMOD_OVERRIDES: Record<string, string> = {
  // 08-12: authored title / description / keywords across 10 locales.
  stickers: "2026-08-12T00:00:00.000Z",
};

// Genuinely-static routes (/about, /privacy, /agreement, /contact, /pricing…).
// Their last real change is the 08-05 fold fix; nothing since has altered them.
const STABLE_LASTMOD = "2026-08-05T00:00:00.000Z";

// Tool pages: 08-12 stripped a duplicated "| Curify" from 90 metadata titles,
// which changes the <title> a crawler sees on every one of them.
// 08-29 added /tools/impromptu-speech-practice and made tool emission respect
// a per-tool locale subset, which changes the URL set on this route.
const TOOLS_LASTMOD = "2026-08-29T00:00:00.000Z";

// Use-case pages: 08-12 added the worked-case block and moved the demo cards
// into the tools grid — a visible change on all of them.
const USE_CASES_LASTMOD = "2026-08-12T00:00:00.000Z";

// Added 2026-07-05 — the 16 /personality/[type] (MBTI) pages were never emitted
// in the sitemap, leaving them invisible to Google's crawl (MBTI & Character
// cluster build M1, docs/mbti-character-cluster-build-2026-07-05.md).
// 0% of the 16 MBTI pages were indexed as of the 2026-08-16 sweep (all
// "Discovered, never crawled"). The 08-05 fold fix applies here too.
const PERSONALITY_LASTMOD = "2026-08-05T00:00:00.000Z";

// MBTI type pages hand-localize EN/zh/es only (lib/mbti-meta.ts pickLang);
// other locales render EN-fallback copy, so restrict sitemap emission to the
// localized 3 — same duplicate-canonical policy as nano-template routes.
// Expand when M3 adds ko/ru copy.
const PERSONALITY_LOCALES = ["en", "zh", "es"] as const;

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

// NOTE (2026-08-12): /enterprise is intentionally NOT listed here. It is a
// relationship + outbound landing surface, not a search surface — every
// reader arrives from a conversation, a LinkedIn post or an email, and the
// CN half of that pipeline is entirely WeChat-sourced. It is bilingual
// (en + zh) with correct per-locale canonicals and is not noindexed, so a
// buyer searching the company name still finds it; we just don't ask Google
// to crawl or rank it. See docs/workstream-vertical-use-cases.md §2026-08-12.

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
        // Take the LATER of the two. The retitle date (2026-05-05) predates the
        // 08-05 fold fix, so using it verbatim would advertise the 41 retitled
        // templates as STALER than every other template — the opposite of the
        // intent, and it would exclude exactly the pages we most want recrawled.
        // The 08-27 fashion retitle is newer than both dates below, so it takes
        // precedence for the one template it covers.
        lastmod: FASHION_RECRAWL_TEMPLATE_IDS.has(t.id.trim())
          ? FASHION_RECRAWL_LASTMOD
          : SEO_RETITLED_TEMPLATE_IDS.has(t.id.trim()) &&
              SEO_RETITLED_LASTMOD > NANO_TEMPLATES_LASTMOD
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

// Tools carry an optional `locales` field (lib/tools-registry.ts). Most tools
// omit it and are authored in all ten, so they emit ten URLs as before. A tool
// that declares a subset — an English-only experiment, say — emits only those,
// because the unauthored locales render literal i18n key paths and would be
// nine thin near-duplicates competing with the one real page. Same policy the
// MBTI and nano tag routes already apply.
function getToolRoutes(): { route: string; locales: readonly string[] }[] {
  return TOOL_REGISTRY
    .filter((t) => t.status !== "coming_soon")
    .map((t) => ({
      route: `/tools/${encodeURIComponent(t.slug)}`,
      locales: t.locales ?? LOCALES,
    }));
}

function getUseCaseRoutes(): string[] {
  return USE_CASES.map((uc) => `/use-cases/${uc.slug}`);
}

function getPersonalityRoutes(): string[] {
  // 16 MBTI type pages. Canonical form is UPPERCASE (page.tsx builds its
  // canonical from type.toUpperCase()); MBTI_TYPES is already uppercase, so
  // emit as-is to match the on-page canonical and avoid a lower/upper dup pair.
  return MBTI_TYPES.map((t) => `/personality/${t}`);
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
  const personalityRoutes = getPersonalityRoutes();

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
    const slug = route.replace("/topics/", "");
    const topicLastmod = TOPIC_LASTMOD_OVERRIDES[slug] ?? TOPICS_LASTMOD;
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: topicLastmod,
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // Personality (MBTI type) pages — EN/zh/es only (hand-localized in
  // mbti-meta; other locales are EN-fallback duplicates). See M1 above.
  personalityRoutes.forEach((route) => {
    PERSONALITY_LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: PERSONALITY_LASTMOD,
        changefreq: "weekly",
        priority: "0.7",
        availableLocales: PERSONALITY_LOCALES,
      });
    });
  });

  // Use case pages
  useCaseRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: USE_CASES_LASTMOD,
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // Tool routes
  toolRoutes.forEach(({ route, locales }) => {
    locales.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        lastmod: TOOLS_LASTMOD,
        changefreq: "weekly",
        priority: "0.8",
        // Only narrow the hreflang set when the tool actually declares one;
        // passing the full list here would be a no-op but reads as intent.
        availableLocales: locales === LOCALES ? undefined : locales,
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