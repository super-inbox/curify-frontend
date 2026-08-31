import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NanoTemplateDetailClient from "@/app/[locale]/(static)/nano-template/[slug]/NanoTemplateDetailClient";
import ExampleImagesGrid from "@/app/[locale]/(static)/nano-template/[slug]/ExampleImagesGrid";
import TopicStrip from "@/app/[locale]/_components/TopicStrip";
import BulkDesignCallout from "@/app/[locale]/_components/BulkDesignCallout";
import TopicFormatContent, {
  type TopicFormatContent as FormatContent,
} from "@/app/[locale]/_components/TopicFormatContent";
import { resolveTopicPath } from "@/lib/topic_path_overrides";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
} from "@/lib/nano_utils";

import { buildNanoFeedCards, buildTemplateImageGridItems } from "@/lib/nano_page_data";
import { getImageViewsForTemplate } from "@/lib/nano_example_utils";
import {
  resolveContentLocale,
  makeSafeTranslator,
  titleCaseFromSlug,
} from "@/lib/locale_utils";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

import { getTemplatesForTopic, getRelatedTopics, getFurtherExplorationTopics, getParentTopic, getTopicById, getNavigationalChildren, getTagChildren, getTier1Ancestor, getGalleryTag, getBlogTag, getBlogSlugsForTopic, isLocalizedTopic, getTopicNavList } from "@/lib/topicRegistry";
import { getTopicWorkbenchPreset, isSelfieScopedTopic, SELFIE_TEMPLATE_IDS } from "@/lib/topic_workbench";
import ImageWorkbench from "@/app/[locale]/_components/ImageWorkbench";
import BrandWorkflow from "@/app/[locale]/_components/BrandWorkflow";
import TopicWorkflow from "@/app/[locale]/_components/TopicWorkflow";
import { getTopicWorkflow } from "@/lib/topic_workflows";
import { getUseCaseForTopic } from "@/lib/topic_use_case";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import TopSearchSuggestions from "./TopSearchSuggestions";
import SearchRedirectTracker from "./SearchRedirectTracker";

// Topic data is bundled (nano_templates.json + nano_inspiration.json +
// blogs.json) plus a single fetch for related prompts. Bundled data
// only changes on redeploy; the prompts fetch is itself cached via
// nanoPromptsService (next: { revalidate, tags }). So cache the page
// forever until the next deploy. Do NOT add force-dynamic here — it
// silently overrides this revalidate and kills the cache.
export const revalidate = false;

// Prerender the i18n-authored topics, mirroring the sitemap's `getTopicRoutes()`
// (app/sitemap.xml/route.ts): topic ids that appear on a template, filtered by
// isLocalizedTopic. Un-authored topics render noindex,nofollow and are left to
// on-demand rendering rather than baked into the build.
export function generateStaticParams() {
  const templateLevelTopics = new Set<string>();
  for (const t of nanoTemplates as unknown as Array<{ topics?: string | string[] }>) {
    const raw = t.topics;
    const topics = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw.split(",").map((s) => s.trim())
      : [];
    for (const tp of topics) if (tp) templateLevelTopics.add(tp.toLowerCase());
  }
  return Array.from(templateLevelTopics)
    .filter((tp) => isLocalizedTopic(tp))
    .flatMap((slug) => routing.locales.map((locale) => ({ locale, slug })));
}

import nanoTemplates from "@/public/data/nano_templates.json";
import { routing } from "@/i18n/routing";
import nanoImages from "@/public/data/nano_inspiration.json";
import blogsData from "@/public/data/blogs.json";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";
import PromptCard from "@/app/[locale]/(static)/nano-banana-pro-prompts/PromptCard";
import MBTIQuizCapsule from "@/app/[locale]/_components/MBTIQuizCapsule";
import RelatedBlogCard from "@/app/[locale]/_components/RelatedBlogCard";
import HomeFusedRow, { type HomeExampleTile, type TopRemixPrompt } from "@/app/[locale]/(public)/HomeFusedRow";
import ExternalInspirationRow from "@/app/[locale]/_components/ExternalInspirationRow";
import { getExternalInspirationForTopic } from "@/lib/externalInspiration";

// Style-exploration niche topics render a single FUSED surface (template
// examples + gallery prompts interleaved, same tile UI as the home rail)
// instead of the default separate example-grid + gallery sections. As
// seeded inspirations land (tagged with the topic in topics[]), they flow
// straight into this rail. See docs/subject-style-exploration-pages.
const NICHE_STYLE_TOPICS = new Set<string>([
  "sneaker-design", "jewelry-design", "eyewear-design", "handbag-design",
  "coffee-shop-branding", "tea-brand-design", "candle-packaging",
  "wine-label-design", "chocolate-packaging", "flower-shop-branding",
  "museum-merchandise",
]);


type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Early-out for taxonomy entries that don't have authored i18n yet
  // (mood / aesthetic / lighting / temporal / product tier-3 cohorts from
  // Rounds 2B/2D — ~99 entries flagged in docs/search-and-content.md
  // 2026-05-31 "i18n-gating + product tier-2 completion" ship). Without
  // this guard, generateMetadata calls t() on missing keys for every
  // locale's metadata fetch, surfacing MISSING_MESSAGE console errors
  // (e.g. topics.wary.displayName in fr). The Page itself already 404s
  // via isLocalizedTopic but generateMetadata runs ahead of that on
  // crawler hits.
  if (!isLocalizedTopic(slug)) {
    const fallback = titleCaseFromSlug(slug);
    return {
      title: `${fallback} — Nano Banana AI Templates`,
      description: `Explore ${fallback} AI visual templates and prompts on Nano Banana.`,
      robots: { index: false, follow: false },
    };
  }

  const t = await getTranslations({ locale });
  // Use t.has() to silence dev-mode missing-message warnings for
  // partial topic i18n entries (the 27 "stub" topics that have
  // displayName but not title/description/keywords). next-intl logs the
  // miss even when caught, AND returns the raw key string for some
  // missing modes — so a plain try/catch leaks "topics.foo.title" into
  // the rendered <title>. has() check is the only fully-clean fallback.
  const hasFn = (t as unknown as { has?: (k: string) => boolean }).has;
  const safeT = (key: string) => {
    if (typeof hasFn === "function" && !hasFn.call(t, key)) return "";
    try { return t(key as never) ?? ""; } catch { return ""; }
  };
  const safeRaw = <T,>(key: string): T | null => {
    if (typeof hasFn === "function" && !hasFn.call(t, key)) return null;
    try { return (t as { raw: (k: string) => T }).raw(key) ?? null; } catch { return null; }
  };

  const displayName = safeT(`topics.${slug}.displayName`) || titleCaseFromSlug(slug);
  const title = safeT(`topics.${slug}.title`) || `${displayName} — Nano Banana AI Templates`;
  const description = safeT(`topics.${slug}.description`) || `Explore ${displayName} AI visual templates and prompts on Nano Banana.`;
  const keywordsRaw = safeRaw<string[]>(`topics.${slug}.keywords`);
  const keywords = Array.isArray(keywordsRaw) && keywordsRaw.length > 0 ? keywordsRaw : undefined;

  const canonical = getCanonicalUrl(locale, `/topics/${slug}`);
  const languages = getLanguagesMap(`/topics/${slug}`);

  return {
    title,
    description,
    keywords,
    alternates: { canonical, languages },
    openGraph: {
      title: `${displayName} | Nano Banana`,
      description,
      url: canonical,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale: localeStr, slug } = await params;
  setRequestLocale(localeStr);

  const contentLocale = resolveContentLocale(localeStr);

  const tNano = await getTranslations({ locale: localeStr, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);

  const tTopicsRoot = await getTranslations({ locale: localeStr });
  const translateTopics = makeSafeTranslator(tTopicsRoot);

  const allTemplates = nanoTemplates as unknown as RawTemplate[];
  const allImages = nanoImages as unknown as RawNanoImageRecord[];

  // From nano_templates: templates that DIRECTLY have this topic in their topics field
  const templateTaggedIds = new Set(
    allTemplates
      .filter((t: any) => {
        const topics: string[] = Array.isArray(t.topics)
          ? t.topics
          : typeof t.topics === "string"
          ? t.topics.split(",").map((s: string) => s.trim())
          : [];
        return topics.map((s: string) => s.trim().toLowerCase()).includes(slug.toLowerCase());
      })
      .map((t: any) => t.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );

  // From nano_inspiration: template IDs referenced by images tagged with this topic
  const inspirationTaggedIds = new Set(
    allImages
      .filter((img: any) => (img.topics ?? []).includes(slug))
      .map((img: any) => img.template_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );

  // Union of both sources. The AI Selfie topic (portrait) reuses the broad
  // "portrait" tag, which also covers MBTI cards, movie posters, fandom grids,
  // costumes, K-pop, etc. — scope its example grid + template feed to genuine
  // "restyle your own photo" templates so it reads as a selfie collection.
  // (The gallery-prompt row and nav sections are unaffected.)
  const selfieScoped = isSelfieScopedTopic(slug);
  const allFilteredIds = new Set(
    [...templateTaggedIds, ...inspirationTaggedIds].filter(
      (id) => !selfieScoped || SELFIE_TEMPLATE_IDS.has(id)
    )
  );

  // 404 if the slug lacks EN i18n in messages/en/topics.json. Many
  // taxonomy entries (mood / aesthetic / lighting / temporal / product
  // tier-3 cohorts from Rounds 2B/2D) are vocabulary-only — they exist
  // in the taxonomy but don't yet have authored topic-page content.
  // The registry already excludes these from getTopicById, but explicit
  // 404 here keeps the route surface clean and prevents accidental
  // renders when content gets attached via auto-tag.
  if (!isLocalizedTopic(slug)) notFound();

  // 404 only for completely unknown slugs. If the slug is a declared topic
  // in the registry (Tier 1, Tier 2, or Tier 3 tag) but currently has no
  // tagged content, render the page anyway — it will still surface
  // navigation, gallery, and Tier 3 chips while content gets curated.
  const isDeclaredTopic = !!getTopicById(slug);
  if (!allFilteredIds.size && !isDeclaredTopic) notFound();

  const filteredTemplates = allTemplates.filter((t: any) => allFilteredIds.has(t.id));

  // Images: template-tagged → all its images; inspiration-tagged → only that image; deduplicated
  const seenImageIds = new Set<string>();
  const filteredImages: RawNanoImageRecord[] = [];
  for (const img of allImages) {
    const id = (img as any).id;
    if (!img?.template_id || !id || seenImageIds.has(id)) continue;
    // Selfie topic: only genuine restyle-your-photo templates (see allowlist).
    if (selfieScoped && !SELFIE_TEMPLATE_IDS.has(img.template_id)) continue;
    const fromTemplate = templateTaggedIds.has(img.template_id);
    const fromInspiration = ((img as any).topics ?? []).includes(slug);
    if (fromTemplate || fromInspiration) {
      seenImageIds.add(id);
      filteredImages.push(img);
    }
  }

  const reg = buildNanoRegistry(filteredTemplates, filteredImages);

  // Stamp each item with its parent template's batch flag so the grid
  // can render the per-item Download Pack button on /topics pages
  // (which span multiple templates with mixed batch=true / batch=false).
  // The grid-level batch prop only works for single-template surfaces.
  const imagesByTemplate = [...filteredTemplates]
    .sort((a, b) => (b.rank_score ?? 1) - (a.rank_score ?? 1))
    .map((t) =>
      buildTemplateImageGridItems(
        getImageViewsForTemplate(reg, t.id, contentLocale)
      ).map((it) => ({ ...it, batch: t.batch === true }))
    )
    .filter((imgs) => imgs.length > 0);

  // Interleave: round-robin across templates for visual diversity
  const gridItems: typeof imagesByTemplate[number] = [];
  const maxLen = Math.max(0, ...imagesByTemplate.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const imgs of imagesByTemplate) {
      if (i < imgs.length) gridItems.push(imgs[i]);
    }
  }

  // Perf: only ship an INITIAL WINDOW of interleaved examples into the RSC
  // payload. The client grid renders ~2-3 rows and reveals the rest via
  // "See more"; shipping ALL examples (up to ~1700 on big topics like
  // /topics/posters) bloated the page to >1.3 MB even though only a few rows
  // ever render. The round-robin above keeps the first N diverse across
  // templates. Mirrors the nanoCards feed cap below. (True progressive /
  // fetch-more is a planned follow-up; 96 still gives a generous expand.)
  const GRID_INITIAL_CAP = 96;
  const gridItemsInitial = gridItems.slice(0, GRID_INITIAL_CAP);

  const nanoCards = buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
    // Matches NanoInspirationRow visible default (5×5 = 25) + safety
    // buffer. Was unlimited, shipping ~150-200 cards into the SSR HTML
    // when the row only renders 25.
    limit: 30,
  });

  if (!nanoCards.length && !isDeclaredTopic) {
    notFound();
  }

  // Gallery prompts for this topic (if configured).
  //
  // Fetch ~3x the visible cap so the post-filter has room to drop
  // revealing-imagery prompts (marked with the `revealing-female` tag
  // by scripts/tag_revealing_female.py) while still landing on ~10
  // family-friendly prompts. The exclusion is global — no topic in
  // the current taxonomy needs to surface revealing imagery, so we
  // skip the per-topic opt-in until that need actually appears.
  const galleryTag = getGalleryTag(slug);
  let galleryPrompts: NanoPromptBase[] = [];
  if (galleryTag) {
    try {
      const raw = await nanoPromptsService.getNanoPromptsByTag(galleryTag, {
        limit: 30,
      });
      galleryPrompts = raw
        .filter((p) => !(p.tags ?? []).includes("revealing-female"))
        .slice(0, 12);
    } catch {
      // gallery is non-critical; fail silently
    }
  }

  // Blog posts for this topic — union of two sources:
  //   1. blogs whose tag matches TOPIC_BLOG_TAG[slug] (broad — used for
  //      e.g. ai → "Creator Tools" where ANY post with that tag belongs)
  //   2. blogs whose slug is in TOPIC_BLOG_SLUGS[slug] (narrow — used for
  //      curated single-post pins like world-cup → soccer-poster-prompts
  //      where the tag is generic but the post is canonical)
  const blogTag = getBlogTag(slug);
  const blogSlugs = getBlogSlugsForTopic(slug);
  const blogSlugSet = new Set(blogSlugs.map((s) => s.toLowerCase()));
  const blogPostSet = new Map<string, (typeof blogsData)[number]>();
  if (blogTag) {
    for (const b of blogsData as any[]) {
      if (b.tag?.toLowerCase() === blogTag.toLowerCase()) {
        blogPostSet.set(b.slug, b);
      }
    }
  }
  if (blogSlugSet.size > 0) {
    for (const b of blogsData as any[]) {
      if (b.slug && blogSlugSet.has(b.slug.toLowerCase())) {
        blogPostSet.set(b.slug, b);
      }
    }
  }
  const blogPosts = Array.from(blogPostSet.values());

  const topicTitle =
    translateTopics(`topics.${slug}.title`) ||
    translateTopics(`topics.${slug}.displayName`) ||
    titleCaseFromSlug(slug);

  const topicDisplayName =
    translateTopics(`topics.${slug}.displayName`) || titleCaseFromSlug(slug);

  const topicDescription =
    translateTopics(`topics.${slug}.description`) || "";

  // Longer 3-4 sentence intro paragraph rendered under the title — gives
  // each locale enough unique localized prose for Google to treat it as
  // its own page rather than a duplicate of the en version.
  const topicIntro = translateTopics(`topics.${slug}.intro`) || "";

  // Visual-format topics (infographic, poster, sticker, …) carry an authored
  // `format` block → a visible rich-content body (how-to + use cases + FAQ).
  // Raw read since it's structured (arrays/objects), not a plain string.
  const formatContent: FormatContent | null = tTopicsRoot.has(
    `topics.${slug}.format`
  )
    ? (tTopicsRoot.raw(`topics.${slug}.format`) as FormatContent)
    : null;

  const exampleImagesHeading =
    translateTopics("topicPage.exampleImagesHeading") || "Example Images";
  const templatesHeading =
    translateTopics("topicPage.templatesHeading") || "Templates";

  // Filter every chip list by isLocalizedTopic so the heading sections
  // don't mount when all chips would be suppressed by TopicNavRow's
  // showDisabled={false} (which drops unlocalized = non-navigable
  // entries). Without this, sections like "Explore More" / "Browse by
  // Category" render an empty h2 above zero chips — see WC pages
  // pre-2026-06-04 where tier3.world-cup had 12 unlocalized editions.
  // "Further exploration" row at the top: a topic-SPECIFIC set (next-tier
  // children → siblings → co-occurring topics) that reframes navigation around
  // where THIS topic leads, instead of repeating the global entry-bar list (now
  // hidden on /topics/* — see SiteTopBar). Prefer the curated manual related
  // links when present, then fill/extend with the derived set, capped.
  const furtherTopicIds = Array.from(
    new Set([...getRelatedTopics(slug), ...getFurtherExplorationTopics(slug)])
  )
    .filter((id) => id !== slug && isLocalizedTopic(id))
    .slice(0, 6);

  // Commerce topics (merch / product / ecommerce) open a use-case-scoped
  // 3-column image workbench at the top of the page.
  const workbenchPreset = getTopicWorkbenchPreset(slug);
  const topicUseCase = getUseCaseForTopic(slug);

  // Niche style-exploration topics: build a fused (examples + gallery) pool.
  // Examples come from inspirations tagged with THIS topic in topics[]
  // (clean, curated); gallery from the on-intent TOPIC_GALLERY_TAG (if any).
  const isNicheStyleTopic = NICHE_STYLE_TOPICS.has(slug);
  // Third content source: prompt-less external inspiration references mapped to
  // this topic (image + outbound attribution link). See lib/externalInspiration.
  const externalInspiration = getExternalInspirationForTopic(slug);
  const fusedExamples: HomeExampleTile[] = isNicheStyleTopic
    ? filteredImages
        .map((x: any) => ({
          id: x.id,
          templateId: x.template_id,
          title:
            x.locales?.[contentLocale]?.title ||
            x.locales?.en?.title ||
            x.locales?.zh?.title ||
            "",
          preview: x.asset?.preview_image_url || x.asset?.image_url || "",
        }))
        .filter((e: HomeExampleTile) => Boolean(e.preview))
        .slice(0, 40)
    : [];
  const fusedGallery: TopRemixPrompt[] = isNicheStyleTopic
    ? galleryPrompts
        .map((p) => ({
          id: p.id,
          title: p.title,
          image_url: (p as unknown as { imageURL?: string }).imageURL || "",
          tags: p.tags || [],
          unique_copies_30d: 0,
          total_copies_30d: 0,
        }))
        .filter((g) => Boolean(g.image_url))
    : [];
  const hasFused = fusedExamples.length + fusedGallery.length > 0;

  // The "start a workflow" workbench normally sits BELOW the example grid
  // (scan examples, then do-it-yourself). The selfie surface (/topics/portrait)
  // is a tool-first experience, so it leads with the workbench instead.
  const workbenchAboveExamples = workbenchPreset === "selfie";
  const workbenchSection =
    workbenchPreset || slug === "branding" || getTopicWorkflow(workbenchPreset, slug) ? (
      <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        {/* Design-workflow ladder ABOVE the "start a workflow" upload
            workbench: brand topics get BrandWorkflow; merch/product get the
            commerce ladder chaining the existing template pipeline. */}
        {slug === "branding" && <BrandWorkflow locale={localeStr} />}
        {getTopicWorkflow(workbenchPreset, slug) && (
          <TopicWorkflow locale={localeStr} config={getTopicWorkflow(workbenchPreset, slug)!} />
        )}
        {workbenchPreset && (
          <ImageWorkbench locale={localeStr} preset={workbenchPreset} />
        )}
      </section>
    ) : null;

  return (
    <main className="min-h-screen">
      {/* Fires a CLICK event when ?from_search= is present (server-side
          redirect from /search). Lets search_cycle5_pull.py attribute
          bare-country redirects as a distinct "had-redirect" bucket. */}
      <SearchRedirectTracker />
      <section className="mx-auto max-w-[1600px] px-4 pt-2 pb-4 sm:px-6 lg:px-8">

        <div>
          {/* Localized description + intro are kept in the DOM (so Google
              and screen readers see them) but visually hidden via sr-only.
              They're our main per-locale prose used to differentiate
              topic pages across the 10 supported languages. */}
          {/* Niche style-exploration topics render VISIBLE SEO body (title +
              description + intro) so the page has real indexable prose above
              the fused rail — matches the inspiration-hub row pattern. Broad
              topics keep the sr-only treatment (their visible content is the
              example grid + format block). */}
          {isNicheStyleTopic ? (
            <div className="mb-6 max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                {topicDisplayName}
              </h1>
              {topicDescription ? (
                <p className="mt-2 text-base text-neutral-700">{topicDescription}</p>
              ) : null}
              {/* intro kept indexable but hidden — the visible lead is the
                  description above; the fuller prose lives in the FAQ block
                  at the bottom, so we don't render two near-identical paras. */}
              {topicIntro ? (
                <p className="sr-only whitespace-pre-line">{topicIntro}</p>
              ) : null}
            </div>
          ) : (
            <>
              {topicDescription ? (
                <p className="sr-only">{topicDescription}</p>
              ) : null}
              {topicIntro ? (
                <p className="sr-only whitespace-pre-line">{topicIntro}</p>
              ) : null}
            </>
          )}

          {/* "Explore further" — topic-specific next-tier + co-occurrence topics,
              rendered with the same TopicStrip tile UI as the entry bar. Uses
              requireThumbnail=false so hand-derived format topics (art-prints,
              illustration…) that lack a manifest thumbnail still show as tiles.
              This replaces the old bottom "Explore More" strip. */}
          {furtherTopicIds.length > 0 && (
            <div className="mt-4">
              <TopicStrip
                locale={localeStr}
                heading={
                  translateTopics("topicPage.furtherExplorationHeading") ||
                  "Explore further"
                }
                trackPrefix={`topic-explore-further:${slug}`}
                requireThumbnail={false}
                singleRow
                items={furtherTopicIds.map((subSlug) => ({
                  slug: subSlug,
                  path: resolveTopicPath(subSlug),
                  label:
                    translateTopics(`topics.${subSlug}.displayName`) ||
                    titleCaseFromSlug(subSlug),
                }))}
              />
            </div>
          )}

        </div>
      </section>

      {(slug === 'character' || slug === 'mbti') && (
        <section className="mx-auto max-w-[1600px] px-4 pb-6 sm:px-6 lg:px-8">
          <MBTIQuizCapsule />
        </section>
      )}

      {/* Niche style-exploration topics: one fused rail (template examples +
          gallery prompts interleaved) instead of the separate grid + gallery
          sections below. */}
      {isNicheStyleTopic && hasFused && (
        <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <HomeFusedRow
            examples={fusedExamples}
            galleryPrompts={fusedGallery}
            locale={localeStr}
            maxRows={4}
          />
        </section>
      )}

      {/* Tool-first topics (selfie): the upload workbench leads, above the
          example grid. */}
      {workbenchAboveExamples && workbenchSection}

      {/* WC 2026 calendar widget — slot into the top-right cell of the
          ExampleImagesGrid on WC-family + sports pages. When the page
          has no gridItems, fall back to a standalone single-cell row.
          Auto-hides after July 19, 2026 via the widget itself. */}
      {!isNicheStyleTopic && gridItems.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <ExampleImagesGrid
            items={gridItemsInitial}
            locale={localeStr}
            maxRows={3}
            desktopOpensExample
            showCaption
          />
        </section>
      ) : null}

      {/* "Start a workflow" — for most workbench topics (merch / product /
          ecommerce / branding) this sits BELOW the example grid: scan examples
          first, then do-it-yourself. The selfie surface leads with it instead
          (rendered above via workbenchAboveExamples). */}
      {!workbenchAboveExamples && workbenchSection}

      {!isNicheStyleTopic && galleryPrompts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
            Gallery
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {galleryPrompts.map((prompt, i) => (
              <PromptCard key={`${prompt.id}-${i}`} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {externalInspiration.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <ExternalInspirationRow locale={localeStr} items={externalInspiration} />
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 6).map((blog: any) => (
              <RelatedBlogCard key={blog.slug} blog={blog} locale={localeStr} category={blog.tag} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
          {templatesHeading}
        </h2>
        <NanoTemplateDetailClient
          locale={localeStr}
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
          showOtherTemplateTitle={false}
        />
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-8">
        <BulkDesignCallout
          source={`topics/${slug}`}
          subject={topicDisplayName || undefined}
        />
      </section>

      {/* Visible authored body for visual-format topics (how-to + uses + FAQ).
          Below the template feed so the page still leads with visuals. */}
      <TopicFormatContent content={formatContent} displayName={topicDisplayName} />

      {/* Topic → use-case cross-link at the bottom: reuse the existing
          use-case chip row (EntryBar pills + click tracking), filtered to the
          persona this topic maps to. Routes captured SEO demand to conversion. */}
      {topicUseCase && (
        <section className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-8">
          <UseCaseChipsRow filterTo={[topicUseCase.slug]} showQuestion />
        </section>
      )}

      {/* The old bottom "Explore More" / "Browse by Category" strip (tier-2
          navSubTopics + tier-3 tagSubTopics) was removed: the top "Explore
          further" row now covers that same next-tier exploration. */}

      {/* Top-query suggestions — rendered at the bottom of the page so they
          act as exploration prompts AFTER the user has scanned the content
          grid above. Only renders when the topic has a curated list in
          TopSearchSuggestions.tsx (today: world-cup). */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
        <TopSearchSuggestions
          locale={localeStr}
          topicId={slug}
          heading={translateTopics("topicPage.topQueriesHeading") || "People also search"}
        />
      </section>

    </main>
  );
}