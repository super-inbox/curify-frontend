"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, ArrowRight } from "lucide-react";
import { Link as IntlLink } from "@/i18n/navigation";
import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import { useRequireAuth } from "@/services/useRequireAuth";
import { templatePacksService } from "@/services/templatePacks";
import { useTracking, useVideoTracking } from "@/services/useTracking";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import RelatedBlogsByCategory from "@/app/[locale]/_components/RelatedBlogsByCategory";
import type { ToolDef } from "@/lib/tools-registry";
import { USE_CASES, PERSONA_BLOG_CATEGORIES, getUseCaseBySlug } from "@/lib/use-cases";
import useCaseTranscripts from "@/lib/use_case_transcripts.json";

type LearningMaterial = {
  templateId: string;
  title: string;
  description: string;
  /** Cover preview, resolved server-side from the first inspiration
   *  record under the template. May be a relative path to /images/...
   *  or an absolute CDN URL — CdnImage handles both. */
  coverImage?: string;
};

const BULLET_KEYS = ["bullet0", "bullet1", "bullet2", "bullet3", "bullet4", "bullet5", "bullet6"] as const;

// Use cases that have an explainer video pair under /public/video/.
// File naming convention: `use-case-{key}-{en|cn}.mp4`. Extend this map
// when a new pair is uploaded; pages without an entry simply skip the
// video column and the hero text takes the full row width.
const USE_CASE_VIDEO_KEY: Record<string, string> = {
  "for-designers":        "design",
  "for-parents":          "parents",
  "for-creators":         "creators",
  "for-dtc-brands":       "dtc",
  "for-publishers":       "learning-packs",
  "for-programmatic-seo": "seo",
  "for-marketers":        "marketer",
  "for-merch-operators":  "merch",
};

// Aspect ratio per video pair. Most use-case explainers are vertical 9:16
// (phone-shot / Reels-style) — the default. The merch pair is 3:4
// (960x1280) and the learning-packs pair is 16:9 (1920x1080, landscape),
// so each gets its own box to avoid the <video> default object-fit:fill
// stretching. Landscape entries (aspect-video) also widen the hero column
// below. Add an entry here for any future pair whose source aspect isn't 9:16.
const USE_CASE_VIDEO_ASPECT: Record<string, string> = {
  merch: "aspect-[3/4]",
  "learning-packs": "aspect-video",
};
const DEFAULT_VIDEO_ASPECT = "aspect-[9/16]";

// Featured "pitch demo" banners. Some personas have dedicated pre-rendered
// walkthrough surfaces (/ip-merch-demo, /illustrator-demo — noindex pitch
// mode) that show the full multi-stage workflow far better than a generic
// tool card, so we feature them as prominent CTA banner cards below the hero
// instead of a tools grid. A persona can list more than one — /illustrator-
// demo (sketch → print-ready styled series) is the shared JTBD for BOTH merch
// operators and designers, so it appears on both pages. Copy is held here in
// en/zh and locale-picked, mirroring the demo seeds' own EN/ZH-plus-fallback
// localization (lib/ip_merch_demo.ts / lib/illustrator_demo.ts) rather than
// round-tripping a noindex outreach surface through the 10-locale catalog.
type DemoCopy = { eyebrow: string; title: string; subtitle: string; button: string };
type DemoDef = { key: string; href: string; en: DemoCopy; zh: DemoCopy };

const IP_MERCH_DEMO: DemoDef = {
  key: "ip-merch-demo",
  href: "/ip-merch-demo",
  en: {
    eyebrow: "Live demo",
    title: "See the full IP-merch workflow",
    subtitle:
      "One IP brief → locked character canon → 16-piece sticker pack → retail gift-box mockup → full SKU family. The same engine we run with paid factory customers.",
    button: "Open the IP-merch demo",
  },
  zh: {
    eyebrow: "在线演示",
    title: "查看完整 IP 周边设计工作流",
    subtitle:
      "一份 IP 简报 → 锁定角色设定 → 16 张表情贴纸包 → 零售礼盒样机 → 完整 SKU 家族。与我们为付费工厂客户运行的是同一套引擎。",
    button: "打开 IP 周边演示",
  },
};

const ILLUSTRATOR_DEMO: DemoDef = {
  key: "illustrator-demo",
  href: "/illustrator-demo",
  en: {
    eyebrow: "Live demo",
    title: "Turn one sketch into a styled series",
    subtitle:
      "One hand-drawn sketch → 4 finished aesthetic candidates (heritage mineral, ink & watercolor, Q-cute…) → lock a style → batch-render the same subject, print-ready and series-consistent.",
    button: "Open the illustrator demo",
  },
  zh: {
    eyebrow: "在线演示",
    title: "一张草图，生成整套风格系列",
    subtitle:
      "一张手绘草图 → 4 个成品美学候选（矿物重彩 / 水墨淡彩 / Q 版水彩…）→ 锁定风格 → 批量生成同一主题，可直接印刷、系列风格统一。",
    button: "打开插画师演示",
  },
};

const USE_CASE_DEMO: Record<string, DemoDef[]> = {
  "for-merch-operators": [IP_MERCH_DEMO, ILLUSTRATOR_DEMO],
  "for-designers": [ILLUSTRATOR_DEMO],
};

function UseCaseVideo({
  slug,
  videoKey,
  lang,
  aspectClass,
  transcript,
  transcriptLabel,
}: {
  slug: string;
  videoKey: string;
  lang: "en" | "cn";
  /** Tailwind aspect class for the video box (source aspect varies by
   *  pair — 9:16 default, 3:4 for merch). Paired with object-contain so a
   *  mismatched source letterboxes instead of stretching. */
  aspectClass: string;
  /** Locale-picked transcript text. Rendered inside a collapsed
   *  <details> below the video so it stays crawlable by Google
   *  (text inside closed details is indexed) without polluting
   *  the hero's visual rhythm. Empty / missing → no accordion. */
  transcript?: string;
  transcriptLabel: string;
}) {
  // Track video plays so use-case page engagement is measurable. Without
  // this, /use-cases/[slug] looked like 0 key actions in the actions-per-
  // route rollup despite being the primary engagement on these pages.
  const { trackVideoPlay } = useVideoTracking(
    `use-case-${slug}`,
    "use_case_video",
    "cards",
  );
  // CdnVideo rewrites the /video/... path to the GCS bucket
  // (gs://curify-static/video). The local public/video/ files are
  // gitignored — only the CDN copy is served in production. Drop a
  // new pair into public/video/ then run scripts/sync_large_assets.sh.
  //
  // Source videos are vertical (9:16, phone-shot / TikTok-Reels-style),
  // so the container matches that aspect — using aspect-video (16:9)
  // would either letterbox heavily or crop the video.
  const src = `/video/use-case-${videoKey}-${lang}.mp4`;
  // Split on double-newline → paragraph; preserve single newlines as
  // soft breaks via whitespace-pre-line so the CN block structure
  // (multiple short lines per section) survives the render round-trip.
  const paragraphs = transcript
    ? transcript.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm">
        <CdnVideo
          src={src}
          controls
          playsInline
          preload="metadata"
          className={`${aspectClass} w-full bg-black object-contain`}
          onPlay={trackVideoPlay}
        />
      </div>
      {paragraphs.length > 0 && (
        <details className="mt-3 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
          <summary className="cursor-pointer select-none font-medium text-neutral-800 hover:text-purple-700">
            {transcriptLabel}
          </summary>
          <div className="mt-3 space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line leading-relaxed text-neutral-600">
                {p}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function LearningMaterialCard({ material }: { material: LearningMaterial }) {
  const t = useTranslations("actionButtons");
  const requireAuth = useRequireAuth();
  const { trackAction } = useTracking();
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);

  const handleDownload = async () => {
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    if (!requireAuth("download_learning_material")) { isDownloadingRef.current = false; return; }

    try {
      setIsDownloading(true);
      const res = await templatePacksService.downloadPack({ template_id: material.templateId });
      if (!res?.success || !res?.download_url) throw new Error(res?.message || "Missing download_url");
      const a = document.createElement("a");
      a.href = res.download_url;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      trackAction({ contentId: material.templateId, contentType: "nano_inspiration_template_card" as const, viewMode: "list" as const }, "download");
    } catch {
      alert(t("batchDownloadFailed"));
    } finally {
      setIsDownloading(false);
      isDownloadingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {material.coverImage ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <CdnImage
            src={material.coverImage}
            alt={material.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        // Fallback for templates that have no inspiration records yet —
        // a soft purple-tinted swatch with a Download glyph so the card
        // still reads as visual rather than three lines of text.
        <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
          <Download className="h-8 w-8 text-purple-300" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="line-clamp-2 text-sm font-semibold text-neutral-900">{material.title}</div>
        <div className="line-clamp-2 text-xs text-neutral-500">{material.description}</div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="mt-auto inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {isDownloading ? t("downloadingPack") : t("downloadPack")}
        </button>
      </div>
    </div>
  );
}

// Persona → Solution (the 6 in docs/positioning-solutions-and-site-ia.md). Drives
// a small Solution-name eyebrow on the persona hero so a user who clicked a
// home Solution card lands on a page that visibly confirms the same Solution
// (entry → landing consistency). Label text is reused from home.solutions
// (already localized in 10 locales) — no new strings, crafted persona copy
// below is untouched.
const PERSONA_SOLUTION: Record<string, string> = {
  "for-merch-operators": "merch",
  "for-dtc-brands": "merch",
  "for-designers": "design",
  "for-parents": "education",
  "for-esl-learners": "education",
  "for-publishers": "education",
  "for-creators": "video",
  "for-marketers": "marketing",
  "for-programmatic-seo": "marketing",
};

export default function UseCaseClient({
  slug,
  exampleItems,
  tools,
  learningMaterials,
}: {
  slug: string;
  /** Flattened example items for the ExampleImagesGrid (2026-06-29
   *  swap from NanoInspirationRow / template-list UI). Each item is
   *  one rendered inspiration, filtered server-side to this use-case. */
  exampleItems: Array<{
    id: string;
    title: string;
    preview: string;
    templateId: string;
  }>;
  tools: ToolDef[];
  learningMaterials?: LearningMaterial[];
}) {
  const t = useTranslations("useCasePage");
  const tGlobal = useTranslations();
  const tSol = useTranslations("home.solutions");
  const solutionKey = PERSONA_SOLUTION[slug];
  const solutionName = solutionKey ? tSol(`items.${solutionKey}.label` as never) : null;
  const locale = useLocale();
  const title = t(`${slug}.title` as never);
  // P0 #3 — blog categories that match this persona. Drives the
  // "Related reading" block at the bottom. See docs/interconnection.md.
  const relatedBlogCategories = PERSONA_BLOG_CATEGORIES[slug] ?? [];
  // B2B pages get a "Built for teams" badge + a one-line "APIs available
  // on request" note in the hero. Visible packaging = the dev-shop
  // guardrail (see docs/interconnection.md "B2B tier").
  const isB2B = getUseCaseBySlug(slug)?.tier === "b2b";
  // Optional explainer video on the right side of the hero. Only the
  // slugs in USE_CASE_VIDEO_KEY have a video pair under /public/video/.
  const videoKey = USE_CASE_VIDEO_KEY[slug];
  // Optional featured pitch-demo banner cards (see USE_CASE_DEMO). Copy is
  // locale-picked (zh → zh, else en) to match each demo surface's own
  // EN/ZH-plus-fallback localization.
  const demos = (USE_CASE_DEMO[slug] ?? []).map((d) => ({
    key: d.key,
    href: d.href,
    copy: locale === "zh" ? d.zh : d.en,
  }));
  // Share button props — ShareButton auto-prepends curify-ai.com on
  // relative URLs. Tracking uses contentType "page" + slug as
  // contentId so analytics groups shares per persona page.
  const { trackAction } = useTracking();
  const shareTitle = title;
  const shareText = t(`${slug}.subtitle` as never);
  const shareTracking = {
    contentId: slug,
    contentType: "page" as const,
  };
  const handleShareTracked = useCallback(
    () => trackAction(shareTracking, "share"),
    [trackAction, shareTracking],
  );
  // Track featured-demo CTA clicks so page engagement shows up in the
  // actions-per-route rollup (same contentType "page" as share). contentId
  // is `<slug>::<demoKey>` so analytics can tell which demo + which page.
  const handleDemoClick = useCallback(
    (demoKey: string) =>
      trackAction({ contentId: `${slug}::${demoKey}`, contentType: "page" as const }, "click"),
    [trackAction, slug],
  );

  return (
    <main className="mx-auto max-w-[1600px] px-4 pt-3 pb-8 sm:px-6 lg:px-8">
      {/* Hero — text block + optional explainer video CENTERED on the
          page per 2026-06-29 polish. The whole block caps at ~1100px
          and centers horizontally so the eye lands on the hero before
          scanning sideways to the (now narrower) page width. lg+ keeps
          the text-then-video row; smaller stacks vertically. Single
          max-w on the text section keeps title / subtitle / bullets /
          B2B line in one consistent reading column. */}
      <div className="mx-auto mb-10 flex max-w-[1100px] flex-col items-center justify-center gap-8 text-center lg:flex-row lg:items-start lg:gap-16 lg:text-left">
      <section className={videoKey ? "max-w-3xl lg:flex-1" : "w-full"}>
        {solutionName && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-600">
            {solutionName}
          </p>
        )}
        {isB2B && (
          <span className="mb-3 inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-800">
            {tGlobal("interconnection.builtForTeams")}
          </span>
        )}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <div className="flex-shrink-0 pt-1">
            <ShareButton
              url={`/use-cases/${slug}`}
              title={shareTitle}
              text={shareText}
              onShared={handleShareTracked}
            />
          </div>
        </div>
        <p className="mt-3 text-lg font-semibold text-purple-700">
          {t(`${slug}.subtitle` as never)}
        </p>
        <p className="mt-3 text-base text-neutral-600">
          {t(`${slug}.description` as never)}
        </p>

        <ul className="mt-5 space-y-2">
          {BULLET_KEYS.filter((key) => t.has(`${slug}.${key}` as never)).map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="mt-0.5 text-purple-500">✓</span>
              {t(`${slug}.${key}` as never)}
            </li>
          ))}
        </ul>

        {isB2B && (
          <p className="mt-5 text-sm font-medium text-neutral-700">
            <span aria-hidden="true" className="mr-1.5">⚡</span>
            {tGlobal("interconnection.apiAvailable")}{" "}
            <IntlLink
              href="/contact"
              className="font-semibold text-purple-700 underline-offset-2 hover:underline"
            >
              {tGlobal("interconnection.apiContactCTA")}
            </IntlLink>
          </p>
        )}
      </section>

        {videoKey && (
          <div className={`mx-auto w-full lg:mx-0 lg:flex-shrink-0 ${
            (USE_CASE_VIDEO_ASPECT[videoKey] ?? DEFAULT_VIDEO_ASPECT) === "aspect-video"
              ? "max-w-[560px] lg:w-[460px]"   // landscape (16:9) needs a wider column
              : "max-w-[320px] lg:w-[280px]"    // portrait default
          }`}>
            <UseCaseVideo
              slug={slug}
              videoKey={videoKey}
              lang={locale === "zh" ? "cn" : "en"}
              aspectClass={USE_CASE_VIDEO_ASPECT[videoKey] ?? DEFAULT_VIDEO_ASPECT}
              transcript={
                (useCaseTranscripts as Record<string, { en?: string; cn?: string }>)
                  [videoKey]?.[locale === "zh" ? "cn" : "en"]
              }
              transcriptLabel={tGlobal("interconnection.readTranscript")}
            />
          </div>
        )}
      </div>

      {/* Featured pitch-demo CTA cards — for personas with dedicated
          walkthrough surfaces (merch → /ip-merch-demo + /illustrator-demo;
          designer → /illustrator-demo). Sits directly below the hero so it
          reads as the primary next action. One card = full width; two =
          side-by-side on md+. */}
      {demos.length > 0 && (
        <section className="mb-10">
          <div className={`grid gap-4 ${demos.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {demos.map((demo) => (
              <IntlLink
                key={demo.key}
                href={demo.href}
                onClick={() => handleDemoClick(demo.key)}
                className="group flex h-full flex-col rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 transition hover:border-purple-300 hover:shadow-md"
              >
                <div className="flex-grow">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
                    {demo.copy.eyebrow}
                  </div>
                  <div className="text-lg font-bold text-neutral-900">
                    {demo.copy.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                    {demo.copy.subtitle}
                  </p>
                </div>
                <span className="mt-4 inline-flex w-fit items-center justify-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-purple-700">
                  {demo.copy.button}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </IntlLink>
            ))}
          </div>
        </section>
      )}

      {/* Learning Materials (for-parents) or Tools (other use cases) */}
      {learningMaterials && learningMaterials.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("learningMaterialsHeading")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {learningMaterials.map((m) => (
              <LearningMaterialCard key={m.templateId} material={m} />
            ))}
          </div>
        </section>
      ) : tools.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("toolsHeading")}
          </h2>
          <ToolsGrid
            tools={tools}
            gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          />
        </section>
      )}

      {/* Example grid — swap from NanoInspirationRow (template-list UI)
          to ExampleImagesGrid (per-example tiles) on 2026-06-29 so the
          visual matches /topics/<slug> + /search results. */}
      {exampleItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("templatesHeading", { title })}
          </h2>
          <ExampleImagesGrid
            items={exampleItems}
            locale={locale}
            showCaption
          />
        </section>
      )}

      {/* P0 #3 — Related reading from the blog categories that match
          this persona. Sits between the templates grid and the sibling
          persona chips so the page closes with content depth, then a
          cross-link back into other personas. */}
      {relatedBlogCategories.length > 0 && (
        <RelatedBlogsByCategory
          categories={relatedBlogCategories}
          locale={locale}
          max={8}
          heading={tGlobal("interconnection.relatedReading", {
            defaultValue: "Related reading",
          })}
        />
      )}

      {/* Explore other use cases — cross-link to the five sibling
          persona pages. UseCaseChipsRow filters its source list to the
          slugs we pass, in order, and renders nothing if empty. */}
      <section className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="mb-4 text-xl font-bold text-neutral-900">
          {t("exploreOtherHeading")}
        </h2>
        <UseCaseChipsRow
          filterTo={USE_CASES.filter((uc) => uc.slug !== slug).map((uc) => uc.slug)}
        />
      </section>

      {/* Bottom-left share — second chance to share once the reader has
          scrolled the full page. Same ShareButton + tracking pattern as
          the top-right placement so analytics counts both. */}
      <div className="mt-8 flex justify-start">
        <ShareButton
          url={`/use-cases/${slug}`}
          title={shareTitle}
          text={shareText}
          onShared={handleShareTracked}
        />
      </div>
    </main>
  );
}
