import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";

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

import { getTemplatesForTopic, getRelatedTopics, getParentTopic, getTopicById, getNavigationalChildren, getTagChildren, getTier1Ancestor, getGalleryTag, getBlogTag, getBlogSlugsForTopic, isLocalizedTopic } from "@/lib/topicRegistry";
import TopSearchSuggestions from "./TopSearchSuggestions";

// Topic data is bundled (nano_templates.json + nano_inspiration.json +
// blogs.json) plus a single fetch for related prompts. Bundled data
// only changes on redeploy; the prompts fetch is itself cached via
// nanoPromptsService (next: { revalidate, tags }). So cache the page
// forever until the next deploy. Do NOT add force-dynamic here — it
// silently overrides this revalidate and kills the cache.
export const revalidate = false;

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import blogsData from "@/public/data/blogs.json";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";
import PromptCard from "@/app/[locale]/(public)/nano-banana-pro-prompts/PromptCard";
import MBTIQuizCapsule from "@/app/[locale]/_components/MBTIQuizCapsule";
import RelatedBlogCard from "@/app/[locale]/_components/RelatedBlogCard";


type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const t = await getTranslations({ locale });
  const safeT = (key: string) => { try { return t(key as never) ?? ""; } catch { return ""; } };
  const safeRaw = <T,>(key: string): T | null => {
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

  // Union of both sources
  const allFilteredIds = new Set([...templateTaggedIds, ...inspirationTaggedIds]);

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
        .slice(0, 10);
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

  const topicDescription =
    translateTopics(`topics.${slug}.description`) || "";

  // Longer 3-4 sentence intro paragraph rendered under the title — gives
  // each locale enough unique localized prose for Google to treat it as
  // its own page rather than a duplicate of the en version.
  const topicIntro = translateTopics(`topics.${slug}.intro`) || "";

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
  const relatedTopicIds = getRelatedTopics(slug).filter((id) => isLocalizedTopic(id));

  const parentTopicId = getParentTopic(slug);

  // Resolve the Tier 1 ancestor for this page (itself if Tier 1, parent if Tier 2, Tier 1 root if Tier 3 tag)
  const tier1Ancestor = getTier1Ancestor(slug);

  // Tier 2 navigational subtopics — shown at top on all tiers
  const navSubTopics = (tier1Ancestor ? getNavigationalChildren(tier1Ancestor) : [])
    .filter((id) => isLocalizedTopic(id));

  // Tier 3 tag subtopics — shown at bottom on all tiers. Filtered by
  // isLocalizedTopic so unlocalized tier-3 vocabulary entries (e.g.,
  // tier3.world-cup's 12 tournament editions that intentionally stay
  // vocabulary-only per the i18n-gating rule) don't show an empty
  // section header.
  const tagSubTopics = (tier1Ancestor
    ? getTagChildren(tier1Ancestor).filter((id) => id !== slug)
    : []
  ).filter((id) => isLocalizedTopic(id));

  const subTopicsHeading = !!parentTopicId
    ? translateTopics("topicPage.exploreMoreHeading") || "Explore More"
    : translateTopics("topicPage.subTopicsHeading") || "Browse by Category";

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1400px] px-4 pt-2 pb-4 sm:px-6 lg:px-8">

        <div>
          {/* Localized description + intro are kept in the DOM (so Google
              and screen readers see them) but visually hidden via sr-only.
              They're our main per-locale prose used to differentiate
              topic pages across the 10 supported languages. */}
          {topicDescription ? (
            <p className="sr-only">{topicDescription}</p>
          ) : null}

          {topicIntro ? (
            <p className="sr-only whitespace-pre-line">{topicIntro}</p>
          ) : null}

          {relatedTopicIds.length > 0 && (
            <div className="mt-4">
              <TopicNavRow
                locale={localeStr}
                topics={relatedTopicIds}
                activeTopic={slug}
                showDisabled={false}
                size="small"
              />
            </div>
          )}

          {navSubTopics.length > 0 && (
            <div className="mt-4">
              <TopicNavRow
                locale={localeStr}
                topics={navSubTopics}
                activeTopic={slug}
                showDisabled={false}
                size="small"
              />
            </div>
          )}
        </div>
      </section>

      {(slug === 'character' || slug === 'mbti') && (
        <section className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6 lg:px-8">
          <MBTIQuizCapsule />
        </section>
      )}

      {gridItems.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
          <ExampleImagesGrid items={gridItems} locale={localeStr} maxRows={3} desktopOpensExample />
        </section>
      )}

      {galleryPrompts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
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

      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
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

      {tagSubTopics.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-3">
            {subTopicsHeading}
          </h2>
          <TopicNavRow
            locale={localeStr}
            topics={tagSubTopics}
            showDisabled={false}
            size="default"
          />
        </section>
      )}

      {/* Top-query suggestions — rendered at the bottom of the page so they
          act as exploration prompts AFTER the user has scanned the content
          grid above. Only renders when the topic has a curated list in
          TopSearchSuggestions.tsx (today: world-cup). */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        <TopSearchSuggestions
          locale={localeStr}
          topicId={slug}
          heading={translateTopics("topicPage.topQueriesHeading") || "People also search"}
        />
      </section>

    </main>
  );
}