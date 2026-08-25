import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import exampleI18nEn from "@/messages/en/example.json";
import exampleVisibilityWhitelist from "@/public/data/example_visibility_whitelist.json";
import exampleSitemapExperiment from "@/public/data/example_sitemap_experiment.json";
import { toSlug } from "@/lib/nano_utils";
import { templateExamplesIndexable } from "@/lib/example_indexing";
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
  topics?: string[] | string;
  index_examples?: boolean | null;
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

// SITEMAP A/B (2026-08-26). Localized example URLs de-listed as the TREATMENT
// arm of a live experiment. Keyed "<locale>|<route>"; bare EN is never here.
//
// QUESTION: does a <loc> entry for a locale variant do anything, given every
// example page already emits a complete hreflang alternates set? Nobody knows,
// so this measures it instead of guessing.
//
// An earlier revision of this file answered "nothing" by assertion and cut the
// sitemap 11,190 -> 3,146 (-72%) in one step. That was too aggressive to be
// safe: it de-listed 7,319 URLs on a 90d-impression rule, and an un-measured
// site-wide cut has no way to tell "hreflang was sufficient" apart from "we
// just buried 7,319 URLs". Reverted in favour of the cohort below.
//
// Both arms were drawn from the SAME pool: non-EN, zero impressions in BOTH a
// 180d and a 28d window, surviving the noindex + thin-locale gates so the arms
// are not contaminated by URLs dropped for other reasons. Treatment (~2,000)
// is de-listed here; control (~4,969) stays in the sitemap. Every URL started
// at zero impressions, so any later impression is attributable.
//
// DO NOT regenerate the cohort file mid-flight -- it would reshuffle the arms
// and destroy the comparison. Read out in 4-8 weeks (due ~2026-09-23) with
// scripts/read_example_sitemap_experiment.cjs.
const TREATMENT_DELISTED = new Set<string>(
  (exampleSitemapExperiment as { treatment?: string[] }).treatment ?? []
);

// templateId -> whether its example pages are indexable at all. Mirrors the
// noindex rule in the example route's generateMetadata:
//   noindex = !templateExamplesIndexable(topics, index_examples) || localeThin
// Generator-demo templates (expression sheets, mockups, sticker packs) noindex
// every example and canonical to the template, so emitting them in the sitemap
// advertises URLs we have explicitly told Google not to index.
function buildExamplesIndexableMap(): Map<string, boolean> {
  const raws = nanoTemplates as unknown as NanoTemplate[];
  const m = new Map<string, boolean>();
  for (const t of raws) {
    if (!t?.id) continue;
    const topics = Array.isArray(t.topics)
      ? t.topics
      : typeof t.topics === "string"
        ? t.topics.split(",").map((x) => x.trim())
        : [];
    m.set(String(t.id).trim(), templateExamplesIndexable(topics, t.index_examples));
  }
  return m;
}

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

  const examplesIndexableMap = buildExamplesIndexableMap();

  let urls = "";

  let emitted = 0;
  let skipped = 0;
  let skippedNoindex = 0;
  let skippedThinLocale = 0;
  let skippedDeadLocale = 0;
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

    // Gate against the page's own noindex rule. Without this the sitemap
    // advertises URLs whose <meta robots> says noindex — a direct
    // contradiction, and 75.8% of this sitemap had zero impressions in 90d.
    if (examplesIndexableMap.get(templateId) === false) {
      skippedNoindex++;
      continue;
    }
    emitted++;

    // allow_i18n entries surface in all 10 locales (their per-locale SEO
    // copy lives in messages/<locale>/example.json). Other entries stick
    // with whatever locales they actually have data for, falling back to
    // the parent template's locale set.
    const route = `/nano-template/${encodeURIComponent(
      toSlug(templateId)
    )}/example/${encodeURIComponent(exampleId)}`;

    const exampleLocales = ex.locales ? Object.keys(ex.locales) : [];
    let availableLocales: readonly string[] = ex.allow_i18n
      ? LOCALES
      : (exampleLocales.length
          ? exampleLocales
          : templateLocalesMap.get(templateId)) || LOCALES;

    // localeThin: a non-allow_i18n example renders template-level fallbacks on
    // any locale other than en/zh, and the page noindexes it. Emitting those was
    // the bulk of the waste — 85% of this sitemap was locale-prefixed.
    if (!ex.allow_i18n) {
      const before = availableLocales.length;
      availableLocales = availableLocales.filter((l) => l === "en" || l === "zh");
      skippedThinLocale += before - availableLocales.length;
    }

    // hreflang must stay COMPLETE: it is the mechanism that keeps a de-listed
    // variant discoverable, so alternates are built from the full locale set.
    const alternateLocales = availableLocales;

    // Only the <loc> entries are pruned, and only for the treatment arm. Bare
    // EN is always emitted; every other locale variant stays unless it was
    // assigned to treatment. Control and unassigned variants are untouched.
    let emitLocales: readonly string[] = availableLocales.filter(
      (l) => l === "en" || !TREATMENT_DELISTED.has(`${l}|${route}`)
    );

    // A handful of examples have no `en` locale at all (e.g. locales: {zh}).
    // If every locale they do have lands in treatment, the filter above empties
    // the list and the example emits NO <url> at all -- which also deletes its
    // hreflang block, because alternates live inside the <url> entry. That
    // would make treatment mean "removed from the index entirely" rather than
    // "de-listed but still hreflang-reachable", quietly breaking the very thing
    // the experiment is trying to measure. Never let an entry disappear.
    if (emitLocales.length === 0) emitLocales = availableLocales;

    skippedDeadLocale += alternateLocales.length - emitLocales.length;


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

    for (const locale of emitLocales) {
      urls += generateUrlEntry(locale, route, {
        lastmod,
        changefreq: "weekly",
        priority: "0.5",
        availableLocales: alternateLocales,
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