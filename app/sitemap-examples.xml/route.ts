import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import exampleI18nEn from "@/messages/en/example.json";
import exampleVisibilityWhitelist from "@/public/data/example_visibility_whitelist.json";
import { toSlug } from "@/lib/nano_utils";
import {
  SEO_RETITLED_LASTMOD,
  SEO_RETITLED_TEMPLATE_IDS,
  I18N_DESCRIPTIONS_LASTMOD,
  MBTI_RECRAWL_LASTMOD,
} from "@/lib/seo_retitled_templates";

// Example IDs that have per-locale SEO copy in messages/<locale>/example.json.
// Used ONLY for the lastmod bump below (so Google re-fetches i18n-authored
// URLs) — no longer gates sitemap inclusion. Sitemap inclusion is now
// GSC-driven (see shouldEmitExample below). 726 i18n-authored examples
// with 0 GSC visibility get dropped from the sitemap as of B1 (2026-07-01);
// if they later gain GSC signal the next whitelist regen re-adds them.
const EXAMPLE_I18N_IDS: ReadonlySet<string> = new Set(
  Object.keys(exampleI18nEn as Record<string, unknown>)
);

// Example IDs that got any GSC impression in the last 28 days per the
// most-recent scripts/build_example_visibility_whitelist.cjs run.
// Crawl-budget optimization (B1, 2026-07-01): emitting all 17,650 example
// URLs means Google spends most of its per-domain crawl budget on the
// invisible 85% of the tail. Only emit examples that either have SEO
// signal (GSC-visible OR i18n-authored OR their template was SEO retitled
// OR were recently added) so crawler focuses on the pages that actually
// return value. Regenerate via
//   node scripts/build_example_visibility_whitelist.cjs
// after each fresh audit_gsc_full pull.
const GSC_VISIBLE_IDS: ReadonlySet<string> = new Set(
  (exampleVisibilityWhitelist as { ids?: string[] }).ids ?? []
);

// Examples added within the last N days always stay in the sitemap so
// fresh content gets a fair shot at discovery before GSC has time to
// observe it. Threshold matches the GSC pull window (28d) plus a small
// buffer for crawl latency.
const FRESH_WINDOW_DAYS = 45;
const FRESH_CUTOFF_MS = Date.now() - FRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000;

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
  allow_i18n?: boolean;
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

function isFreshExample(ex: NanoExample): boolean {
  const raw = ex.updated_at || ex.lastmod || ex.date;
  if (!raw) return false;
  const t = Date.parse(raw);
  return Number.isFinite(t) && t >= FRESH_CUTOFF_MS;
}

function shouldEmitExample(ex: NanoExample, exampleId: string): boolean {
  // 1. GSC-visible in last 28 days → keep (proven traffic potential).
  if (GSC_VISIBLE_IDS.has(exampleId)) return true;
  // 2. Template got explicit SEO retitle work → keep the whole family.
  if (SEO_RETITLED_TEMPLATE_IDS.has(String(ex.template_id).trim())) return true;
  // 3. Freshly added → keep to give discovery a chance before we ever
  //    see GSC data. (No date field on examples today, so this is a
  //    no-op — the field is here for when we start emitting dates.)
  if (isFreshExample(ex)) return true;
  // 4. i18n-only examples with 0 GSC signal are dropped. If Google
  //    starts showing them, the next whitelist regen picks them up
  //    (see comment on GSC_VISIBLE_IDS above). This is the crawl-budget
  //    reclaim — ~726 examples where the i18n investment hasn't paid
  //    off within GSC's ~28-day observation window.
  return false;
}

export async function GET() {
  const templateLocalesMap = getTemplateLocalesMap();
  const examples = nanoInspiration as unknown as NanoExample[];

  let urls = "";

  let emitted = 0;
  let skipped = 0;
  for (const ex of examples) {
    if (!ex?.id || !ex?.template_id) continue;

    const templateId = String(ex.template_id).trim();
    const exampleId = String(ex.id).trim();

    // B1 (2026-07-01) crawl-budget cull: drop examples with no SEO signal.
    // Keep GSC-visible, i18n-authored, SEO-retitled, or freshly added ones;
    // skip the rest so Googlebot spends its per-domain budget on pages
    // that actually return traffic instead of the invisible tail.
    if (!shouldEmitExample(ex, exampleId)) {
      skipped++;
      continue;
    }
    emitted++;

    // allow_i18n entries surface in all 10 locales (their per-locale SEO
    // copy lives in messages/<locale>/example.json). Other entries stick
    // with whatever locales they actually have data for, falling back to
    // the parent template's locale set.
    const exampleLocales = ex.locales ? Object.keys(ex.locales) : [];
    const availableLocales: readonly string[] = ex.allow_i18n
      ? LOCALES
      : (exampleLocales.length
          ? exampleLocales
          : templateLocalesMap.get(templateId)) || LOCALES;

    const route = `/nano-template/${encodeURIComponent(
      toSlug(templateId)
    )}/example/${encodeURIComponent(exampleId)}`;

    // Lastmod priority:
    //  1. Examples with i18n SEO copy in messages/<loc>/example.json —
    //     bumped to the i18n descriptions ship date so Google re-fetches
    //     and picks up the per-locale title / description / metaDescription.
    //     Covers the original 260 allow_i18n=true entries AND the 1,275
    //     non-MBTI entries backfilled on 2026-05-14.
    //  2. Examples whose parent template was retitled in the SEO pass —
    //     bumped to that pass's date so the new h1 is recrawled.
    //  3. Fallback to the example's own updated_at / lastmod, or STABLE.
    // MBTI family gets the newest lastmod (canonical + title-dedup fixes,
    // 2026-07-24) — highest priority so it overrides the May i18n date.
    const lastmod = templateId.includes("mbti")
      ? MBTI_RECRAWL_LASTMOD
      : EXAMPLE_I18N_IDS.has(exampleId)
      ? I18N_DESCRIPTIONS_LASTMOD
      : SEO_RETITLED_TEMPLATE_IDS.has(templateId)
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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}