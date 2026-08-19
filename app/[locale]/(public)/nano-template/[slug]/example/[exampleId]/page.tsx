// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import ExampleReproduceSurface from "./ExampleReproduceSurface";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import ExampleVideoPlayer from "./ExampleVideoPlayer";
import ExampleRelatedTopics from "./ExampleRelatedTopics";
import ProgressiveCdnImage from "@/app/[locale]/_components/ProgressiveCdnImage";
import WcTravelRail from "@/app/[locale]/_components/WcTravelRail";
import { getWcTravelRecommendations } from "@/lib/wcTravelRail";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import TopicStrip from "@/app/[locale]/_components/TopicStrip";
import { resolveTopicPath } from "@/lib/topic_path_overrides";
import { titleCaseFromSlug } from "@/lib/locale_utils";
import { getTopicNavList } from "@/lib/topicRegistry";
import {
  toAbsUrlMaybe,
  resolveExampleVerticalSections,
  buildVerticalJsonLd,
  buildVerticalFaqJsonLd,
  buildNanoH1,
} from "@/lib/nano_seo_utils";
import {
  VerticalAttributeChips,
  VerticalKnowledgeSection,
} from "@/app/[locale]/_components/VerticalKnowledge";
import { getCanonicalUrl } from "@/lib/canonical";
import { templateExamplesIndexable } from "@/lib/example_indexing";
import { SITE_URL } from "@/lib/constants";

import { toSlug, getTemplateView, type RawNanoImageRecord } from "@/lib/nano_utils";
import {
  getNanoExampleById,
  buildCircularExampleNav,
  getExampleI18n,
} from "@/lib/nano_example_utils";
import { routing } from "@/i18n/routing";

import {
  buildNanoPageContext,
  buildTemplateImageGridItems,
  buildSimilarExampleGridItems,
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  resolveLocalizedExampleCopy,
} from "@/lib/nano_page_data";

// Example data is entirely bundled (nano_inspiration.json) and only
// changes on redeploy. generateStaticParams (below) pre-builds every
// example at deploy, and revalidate=false keeps the Full Route Cache
// pinned until the next deploy. Avoids pointless 4h rebuilds with
// byte-identical output.
export const revalidate = false;

type PageParams = {
  locale: string;
  slug: string;
  exampleId: string;
};

async function getPageData(localeStr: string, slug: string, rawExampleId: string) {
  const ctx = await buildNanoPageContext(localeStr, slug);
  const imageId = decodeURIComponent(rawExampleId);

  const example = getNanoExampleById(ctx.templateId, imageId, ctx.contentLocale);
  if (!example) return null;

  const templateView = getTemplateView(ctx.reg, ctx.templateId, ctx.contentLocale);
  const templateTopics = templateView?.topics ?? [];
  const templateUseCases = templateView?.use_cases ?? [];
  const templateBatch = templateView?.batch ?? false;
  const templateParameters = templateView?.parameters ?? [];
  const templateAllowGeneration = templateView?.allow_generation ?? false;
  const templateRequiresImageUpload = templateView?.requires_image_upload ?? false;

  const fallbackCopy = resolveLocalizedExampleCopy(
    example,
    ctx.contentLocale,
    ctx.localizedEntry
  );
  const category = fallbackCopy.category;

  // Always read example.json regardless of allow_i18n. We've backfilled
  // unique descriptions for ~1,275 non-allow_i18n examples; rendering
  // them improves the visible page even for locales we don't index.
  // The allow_i18n flag still gates *indexing* below (hreflang +
  // noindex), so non-allow_i18n examples on non-en/zh stay noindex'd
  // — they just look better to the visitors who do reach them.
  const allowI18n = !!example.allow_i18n;
  const exampleI18n = await getExampleI18n(example.id, ctx.contentLocale);
  const title = exampleI18n?.title || fallbackCopy.title;
  const bodyDescription = exampleI18n?.description || null;
  const metaDescription = exampleI18n?.metaDescription || null;

  const basePrompt = templateView?.base_prompt || example.base_prompt || "";
  const prompt = example.filled_prompt || example.base_prompt || "";
  const tags = [category, "nano banana", "prompt generator", "ai image"].filter(Boolean);

  const paramEntries = Object.fromEntries(
    Object.entries(example.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
  );

  const imageViews = getImageViewsForTemplate(
    ctx.reg,
    ctx.templateId,
    ctx.contentLocale
  );

  const gridItems = buildTemplateImageGridItems(imageViews, imageId);

  // Bumped 12 → 40 on 2026-06-29 so the 'More like this' grid's
  // built-in See More button has a richer pool to expand into (the
  // grid renders 2 rows × 5 cols = 10 visible above the fold; the
  // remaining 30 surface when the user clicks See more).
  const similarItems = buildSimilarExampleGridItems(ctx.reg, imageId, {
    limit: 40,
    maxPerTemplate: 2,
  });

  const prevNext = buildCircularExampleNav({
    reg: ctx.reg,
    templateId: ctx.templateId,
    contentLocale: ctx.contentLocale,
    pageLocale: localeStr,
    slug,
    currentExampleId: imageId,
  });

  const exampleTopics: string[] = example.topics ?? [];

  const otherNanoCards = buildOtherTemplateCards(
    ctx.reg,
    ctx.contentLocale,
    ctx.translateNano,
    ctx.templateId,
    Array.from(new Set([...(exampleTopics ?? []), ...(templateTopics ?? [])]))
  );

  const existingExamples = imageViews.map((v) => ({ id: v.id, params: v.params }));

  return {
    ...ctx,
    imageId,
    example,
    title,
    category,
    prompt,
    tags,
    exampleTopics,
    paramEntries,
    gridItems,
    similarItems,
    prevNext,
    otherNanoCards,
    templateTopics,
    templateUseCases,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    templateRequiresImageUpload,
    templateIndexExamples: templateView?.index_examples,
    templateIntroVideoUrl: templateView?.intro_video_url,
    basePrompt,
    existingExamples,
    allowI18n,
    bodyDescription,
    metaDescription,
  };
}

export async function generateStaticParams() {
  const mod = (await import("@/public/data/nano_inspiration.json")) as unknown as {
    default: RawNanoImageRecord[];
  };

  const locales = ["en", "zh"];

  return locales.flatMap((locale) =>
    mod.default.map((img) => ({
      locale,
      slug: toSlug(img.template_id),
      exampleId: encodeURIComponent(img.id),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const pageData = await getPageData(rawLocale, slug, rawExampleId);
  if (!pageData) return {};

  const { title, category, example, templateTopics, allowI18n, metaDescription, templateIndexExamples } = pageData;
  const ogImage = toAbsUrlMaybe(example.asset.preview_image_url);

  const topicText = templateTopics?.length ? templateTopics[0] : "";
  const categoryText = category || topicText || "nano banana";

  // MBTI head-term injection (2026-06-10 bleed fix). 12+ MBTI character
  // example pages were sitting at SERP pos 3-10 with 0 clicks because
  // titles read "Kobe Bryant — Nano Banana Prompt Generator" instead of
  // matching the query pattern "kobe bryant mbti". Same pattern across
  // /nano-template/{mbti-nba,mbti-yellowstone,mbti-naruto,mbti-generic,
  // friends-character-mbti,...}/example/* — every slug in the family
  // contains "mbti". One title-format swap recovers ~700+ impressions
  // of leaked CTR across the family.
  const isMbtiTemplate = slug.includes("mbti");

  // MBTI examples whose backfilled title already contains "MBTI" (e.g.
  // "Erling Haaland — ISTP ... MBTI Basketball Card") must NOT get a second
  // " MBTI" appended — that produced double-"MBTI", over-length <title>s that
  // Google truncated and hurt CTR on pos 1-9 bleeders (2026-07-24 GSC review).
  const titleHasMbti = /\bmbti\b/i.test(title);
  const mbtiTitle = titleHasMbti ? title : `${title} MBTI`;

  // Use locale-specific metaDescription when available; fall back to a
  // generic template-derived sentence for non-allow_i18n / not-yet-translated.
  const description =
    metaDescription ||
    (isMbtiTemplate
      ? `${mbtiTitle} personality type — AI-generated character card. Generate similar images with Nano Banana; full prompt + breakdown + example outputs.`
      : `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${categoryText} template.`);

  // Build hreflang alternates for allow_i18n entries (10 locales) so Google
  // groups the localized URLs together. For other entries, only en + zh
  // (the locales they actually have meaningful content in).
  const route = `/nano-template/${slug}/example/${rawExampleId}`;
  const hreflangLocales: readonly string[] = allowI18n
    ? routing.locales
    : ["en", "zh"];
  // Absolute URLs — Next.js only auto-absolutizes relative canonical/hreflang
  // when metadataBase is set, which this route does NOT inherit. A relative
  // canonical is why GSC classified every example page as "Duplicate without
  // user-selected canonical" (2026-07-11 audit). Prepend SITE_URL like the
  // template-detail page's getCanonicalUrl does.
  const languages: Record<string, string> = {};
  for (const lng of hreflangLocales) {
    const prefix = lng === "en" ? "" : `/${lng}`;
    languages[lng] = `${SITE_URL}${prefix}${route}`;
  }
  // x-default mirrors the canonical (root-domain English path).
  languages["x-default"] = `${SITE_URL}${route}`;

  // Generator-demo templates (expression sheets, product mockups, sticker packs):
  // each example is one thin variation of the tool, so the TEMPLATE is the SEO
  // target — noindex the example page and canonical it to the template page so
  // authority consolidates on the generator instead of splitting across hundreds
  // of variations. Info-heavy examples (MBTI, HSK, culture/recipe infographics)
  // stay indexed. Classifier reuses topics; see lib/example_indexing.
  const examplesIndexable = templateExamplesIndexable(templateTopics, templateIndexExamples);

  // Non-allow_i18n entries on non-en/zh locales render with template-level
  // fallbacks (thin) — noindex them to avoid SEO penalties for thin content.
  const localeThin = !allowI18n && rawLocale !== "en" && rawLocale !== "zh";
  const noindex = !examplesIndexable || localeThin;

  // Canonical target:
  //  - generator-demo → the TEMPLATE page (consolidate authority on the tool).
  //  - locale-thin    → the EN example (the page Google should index).
  //  - otherwise      → self.
  // A noindex page that canonicals to itself sends conflicting signals — Google
  // classifies it as "Duplicate without user-selected canonical".
  const canonicalPath = !examplesIndexable
    ? (rawLocale === "en" ? `/nano-template/${slug}` : `/${rawLocale}/nano-template/${slug}`)
    : (() => {
        const canonicalLocale = localeThin ? "en" : rawLocale;
        return canonicalLocale === "en" ? route : `/${canonicalLocale}${route}`;
      })();

  // MBTI: inject "MBTI" head term right after the character name so the
  // SERP title bolds the matched query ("kobe bryant mbti" etc).
  const pageTitle = isMbtiTemplate
    ? (titleHasMbti ? title : `${mbtiTitle} — Nano Banana Character Card`)
    : `${title} — Nano Banana Prompt Generator`;
  const ogTitleStr = isMbtiTemplate
    ? `${mbtiTitle} | Nano Banana`
    : `${title} | Nano Banana`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: ogTitleStr,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages,
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function NanoExampleDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const pageData = await getPageData(rawLocale, slug, rawExampleId);
  if (!pageData) notFound();

  const {
    pageLocale,
    templateId,
    example,
    title,
    category,
    prompt,
    exampleTopics,
    paramEntries,
    gridItems,
    similarItems,
    prevNext,
    otherNanoCards,
    templateTopics,
    templateUseCases,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    templateRequiresImageUpload,
    templateIntroVideoUrl,
    basePrompt,
    existingExamples,
    bodyDescription,
    nanoMessages,
  } = pageData;

  // Visible heading = SEO title with the "Nano Banana Prompt:" prefix + "| Curify
  // AI" suffix stripped (those read as jargon on-page); the raw `title` still
  // drives the <title> meta / OG in generateMetadata above.
  const displayTitle = buildNanoH1(title, category || slug);

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  const mergedTopics = [
    ...new Set([...(templateTopics ?? []), ...(exampleTopics ?? [])]),
  ];

  // VerticalPageSchema — example-level ontology + authored domain knowledge.
  // null unless THIS example (content.examples[exampleId] in nano.json) or its
  // template has authored vertical values, so unenriched examples render
  // unchanged. See docs/vertical-page-schema-v1.md.
  const vertical = resolveExampleVerticalSections(
    templateId,
    example.id,
    mergedTopics,
    nanoMessages
  );
  const verticalJsonLd = buildVerticalJsonLd(vertical, {
    name: title,
    description: bodyDescription ?? undefined,
    url: getCanonicalUrl(pageLocale, `/nano-template/${slug}/example/${rawExampleId}`),
    image: toAbsUrlMaybe(example.asset?.image_url),
  });
  // Answer-shaped markup for informational "<name> mbti" queries — see
  // buildVerticalFaqJsonLd. Null unless this page has authored knowledge.
  const verticalFaqJsonLd = buildVerticalFaqJsonLd(vertical, { name: title });
  const topicNav = getTopicNavList();
  const metaChips =
    mergedTopics.length > 0 || category ? (
      <>
        {/* Topic chips → sr-only on 2026-06-29 per operator. The
            Google-crawl tonnage matters (17K example pages × ~5 chips =
            ~88K links into /topics/<slug>) but they noise up the hero.
            End-user surface is the merged TopicStrip block at the
            page bottom. */}
        {mergedTopics.length > 0 && (
          <div className="sr-only">
            <TopicNavRow
              locale={rawLocale}
              allTopics={topicNav}
              topics={mergedTopics}
              className="mb-0"
              showDisabled={false}
              size="small"
            />
          </div>
        )}
        {category && (
          <Link
            href={`/${rawLocale}/nano-template/${slug}`}
            className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
          >
            {category}
          </Link>
        )}
      </>
    ) : null;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href={`/${rawLocale}`} className="hover:text-neutral-800">Home</Link>
        <span>/</span>
        <Link href={`/${rawLocale}/nano-template/${slug}`} className="hover:text-neutral-800">
          {category || slug}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-medium text-neutral-800">{displayTitle}</span>
      </nav>

      {/* Header — H1 + topic capsules. The visible heading strips the SEO-only
          "Nano Banana Prompt:" prefix + "| Curify AI" suffix (they belong in the
          <title> tag, not the on-page H1); the raw `title` still drives the meta. */}
      <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">{displayTitle}</h1>
        {metaChips ? <div className="flex flex-wrap items-center gap-2">{metaChips}</div> : null}
        {/* Share sits on the H1 row (moved off the column-1 image). */}
        <div className="ml-auto">
          <ShareButton url={examplePageUrl} title={displayTitle} />
        </div>
      </header>

      {/* VerticalPageSchema — Pillar 2 ontology chip strip (example-level) */}
      <VerticalAttributeChips vertical={vertical} />

      {/* Unified reproduce workbench — Source · Make-it-yours · Production tiles,
          full width (the old "More like this" right rail is gone; related
          images run full-width at the bottom). Mirrors the gallery surface so
          the generate mental model is identical across template + gallery. */}
      <ExampleReproduceSurface
        locale={rawLocale}
        templateId={templateId}
        slug={slug}
        title={title}
        description={bodyDescription ?? undefined}
        introVideoUrl={templateIntroVideoUrl}
        sourceReferenceUrl={
          toAbsUrlMaybe(example.asset.image_url) ?? example.asset.image_url
        }
        parameters={templateParameters}
        initialParams={paramEntries}
        basePrompt={basePrompt}
        allowGeneration={templateAllowGeneration}
        requiresImageUpload={templateRequiresImageUpload}
        batchEnabled={templateBatch}
        exampleId={example.id}
        examplePageUrl={examplePageUrl}
        existingExamples={existingExamples}
        useCaseFilter={templateUseCases}
        copyText={prompt}
        shareUrl={examplePageUrl}
        image={
          example.asset.video_url ? (
            <ExampleVideoPlayer
              templateId={templateId}
              exampleId={example.id}
              videoUrl={example.asset.video_url}
              posterUrl={example.asset.preview_image_url ?? example.asset.image_url}
              title={title}
            />
          ) : (
            <Link
              href={`/${rawLocale}/carousel/template-example/${slug}/${rawExampleId}?media=image`}
              className="relative block h-full w-full cursor-zoom-in"
              aria-label="Open image in carousel"
            >
              <ProgressiveCdnImage
                previewSrc={example.asset.preview_image_url}
                fullSrc={example.asset.image_url}
                alt={title}
                className="object-contain"
                fill
                priority
                noZoom
              />
            </Link>
          )
        }
      />

      {/* Prev / next within the template's examples — kept for crawl +
          navigation now that the hero's overlay arrows are gone. */}
      {prevNext && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={prevNext.prev.href}
            className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            ← Prev
          </Link>
          <Link
            href={prevNext.next.href}
            className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            Next →
          </Link>
        </div>
      )}

      <section className="mt-8">
        {similarItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More like this
            </h2>
            {/* Full "More like this" set at the bottom (below the fold). The
                old right-rail that showed the first 2 is gone — Column 3 is now
                the production workbench — so the grid renders the complete set
                from the first item. */}
            <ExampleImagesGrid
              items={similarItems}
              locale={pageLocale}
              maxRows={2}
              desktopOpensExample
              showCaption
            />
          </>
        )}
        {similarItems.length === 0 && gridItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More from this template
            </h2>
            <ExampleImagesGrid items={gridItems} locale={pageLocale} maxRows={2} desktopOpensExample showCaption />
          </>
        )}

        <NanoTemplateDetailClient
          locale={pageLocale}
          template={{
            template_id: templateId,
            base_prompt: "",
            parameters: [],
            topics: templateTopics,
          }}
          otherNanoCards={otherNanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />

        {/* VerticalPageSchema — Pillar 1 authored domain-knowledge block
            (example-level: MBTI type breakdown, strengths, career fit, etc.). */}
        <VerticalKnowledgeSection vertical={vertical} />

        {verticalJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(verticalJsonLd) }}
          />
        ) : null}

        {verticalFaqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(verticalFaqJsonLd) }}
          />
        ) : null}

        {/* W1.2 — Related-topics footer row. Expands the template+example
            topic union with tier-1 / tier-2 ancestors + curated related
            entries, filtered to fully-localized topics. Injects internal
            authority into /topics/* hubs (17,650 example URLs × ~5 fresh
            chips = ~88k new internal links — biggest tonnage in the W1
            indexation rescue plan).
            sr-only on 2026-06-29 — kept in DOM for Google crawl, but the
            end-user-visible browsing surface is the TopicStrip block
            mounted right below this. */}
        <div className="sr-only">
          <ExampleRelatedTopics locale={rawLocale} seedTopics={mergedTopics} />
        </div>

        {/* End-user-visible topic browsing surface — uses the merged
            templateTopics ∪ exampleTopics list as a TopicStrip
            (Canva-style tiles, deterministic colors per slug). Same
            pattern as the nano-template page bottom strip. */}
        {mergedTopics.length > 0 && (
          <section className="mt-10 pb-4">
            <TopicStrip
              locale={rawLocale}
              heading="Browse topics"
              trackPrefix={`example-bottom-strip:${slug}`}
              items={mergedTopics.map((subSlug) => ({
                slug: subSlug,
                path: resolveTopicPath(subSlug),
                label: titleCaseFromSlug(subSlug),
              }))}
            />
          </section>
        )}
      </section>

      {/* WC → travel cross-sell rail. Renders only on WC content pages
          (those carrying a <country>-world-cup compound tag). Filtered
          by intersecting the country tag with travel-tagged templates.
          See lib/wcTravelRail.ts for the detection logic. */}
      {(() => {
        const rec = getWcTravelRecommendations(
          exampleTopics,
          pageData.contentLocale,
          { limit: 6 },
        );
        return rec ? <WcTravelRail recommendation={rec} locale={rawLocale} /> : null;
      })()}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to create "${title}" with Nano Banana`,
            description: `Use this prompt to generate ${title} images with Nano Banana.`,
            image: example.asset.image_url,
            step: [
              { "@type": "HowToStep", text: "Open Nano Banana and select the template." },
              { "@type": "HowToStep", text: `Enter the prompt: ${prompt}` },
              { "@type": "HowToStep", text: "Generate and download your image." },
            ],
          }),
        }}
      />

      {/* Use-case chips — moved to the bottom of the example page (persona nav
          as a secondary fork after the content, not mid-page in the right column). */}
      {templateUseCases.length > 0 && (
        <section className="mt-10 pb-8">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Use this example for
          </div>
          <UseCaseChipsRow filterTo={templateUseCases} />
        </section>
      )}
    </main>
  );
}
