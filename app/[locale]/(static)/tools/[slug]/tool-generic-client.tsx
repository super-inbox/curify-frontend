// app/[locale]/(static)/tools/[slug]/tool-generic-client.tsx
"use client";


import { toTemplateStripCard } from "@/lib/nano_pure";
import { Link } from "@/i18n/navigation";
import { useClientSearchParams } from "@/lib/useClientSearchParams";
import StickerExportForm from "@/app/[locale]/_components/StickerExportForm";
import AcrylicExportForm from "@/app/[locale]/_components/AcrylicExportForm";

import { PRESET_IMAGE_PARAM } from "@/lib/physical_product_offer";
import PackagingMockupForm from "@/app/[locale]/_components/PackagingMockupForm";
import { personasForTool } from "@/lib/tool-personas";
import { useTranslations, useLocale } from "next-intl";
import { useTracking } from "@/services/useTracking";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import {
  userAtom,
  drawerAtom,
  modalAtom,
  createJobContextAtom,
  clientMountedAtom,
} from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import CdnImage from "@/app/[locale]/_components/CdnImage";

// FAQ slots. Widened 5 -> 14 on 2026-09-21: the page that owns `ghost mannequin
// ai` carries 14 questions and uses the block as a long-tail harvester, not a
// support section. Both consumers .filter() on t.has(), so tools authored with
// fewer questions are unaffected.
const FAQ_SLOTS = Array.from({ length: 14 }, (_, i) => i + 1);

// Tools that get the bulk-production callout ("send the list, we return the
// whole set"). Explicit slugs rather than a groupId test, because the copy in
// common.json:bulkCallout is specific — SKUs, characters, locked visual
// direction, die-cut paths and dielines — and is simply untrue for the
// transcript / summarizer / speech tools. The same reasoning picks
// BULK_CALLOUT_CATEGORIES in BlogCTACard.
//
// ⚠️ Read this before expecting leads from it. Measured 2026-09-22, 30d,
// refined cohort: /tools/* draws ~1,200 people, but 993 of them are on
// /tools/asl-video-translator — a tool we CLOSED — and every slug below draws
// between 1 and 17. So this is a structural fix (the site's only attributed
// commercial CTA was missing from its highest-traffic route family) and not a
// lead source at current volumes. The lead volume problem is upstream: the
// commercial tool pages have no traffic, and the page that does have traffic
// sells nothing.
const BULK_CALLOUT_TOOLS = new Set([
  "ai-product-photo-generator",
  "ecommerce-photo",
  "ai-fashion-model-generator",
  "wedding-photo-editing",
  "character-sticker-sheet",
  "mockup",
  "die-cut-sticker-file",
  "acrylic-factory-export",
  "sticker-factory-export",
  "packaging-mockup",
  "style-transfer",
  "brand-direction-explorer",
  "product-video",
]);
const HOWTO_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
import {
  getToolBySlug,
  getSiblingTools,
  TOOL_BLOG_CATEGORIES,
  TOOL_PINNED_BLOGS,
} from "@/lib/tools-registry";
import { getPersonasForTool } from "@/lib/use-cases";
import LanguageSwitchVideoDemo from "@/app/[locale]/_components/LanguageSwitchVideoDemo";
import RelatedBlogsByCategory from "@/app/[locale]/_components/RelatedBlogsByCategory";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import BulkDesignCallout from "@/app/[locale]/_components/BulkDesignCallout";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";
import TemplateStrip from "@/app/[locale]/_components/TemplateStrip";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import EcommercePhotoGenerate, {
  type EcommercePhotoData,
} from "@/app/[locale]/_components/EcommercePhotoGenerate";
import ProductVideoGenerate from "@/app/[locale]/_components/ProductVideoGenerate";
import CostumeTryonGenerate from "@/app/[locale]/_components/CostumeTryonGenerate";
import PhotoRetouchGenerate from "@/app/[locale]/_components/PhotoRetouchGenerate";
import ImpromptuSpeechPractice from "@/app/[locale]/_components/ImpromptuSpeechPractice";
import BrandDirectionExplorerClient from "@/app/[locale]/(public)/brand-direction-explorer/BrandDirectionExplorerClient";
import CreateNewModal from "../CreateNewModal";

// Map the existing "deep.usecases.X" subsection keys to the persona slugs
// they describe, so each subsection's h3 becomes a link to the matching
// /use-cases/<persona> landing page. Wraps a static text section in a
// cross-link without rewriting the i18n content.
// Destinations live in lib/tool-personas.ts — see the note there on why the
// old single hard-coded map sent almost every tool to a parents page.

export default function ToolGenericClient({
  slug,
  generateData,
  relatedTemplateCards,
}: {
  slug: string;
  // Template data for "generate"-action tools (ecommerce-photo), loaded
  // server-side and threaded down so the client never imports the templates JSON.
  generateData?: EcommercePhotoData;
  // Curated related-template cards for the image-gen tools, built server-side
  // in page.tsx (small serialized array — no templates JSON in the client bundle).
  relatedTemplateCards?: NanoInspirationCardType[];
}) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const ucPersonas = personasForTool(slug);
  // Handoff from a completed generation (lib/physical_product_offer.ts):
  // ?image=<signed url> pre-fills the exporter so the user is not asked to
  // re-upload artwork they just made here.
  const presetImageUrl = useClientSearchParams()?.get(PRESET_IMAGE_PARAM) ?? null;
  const t = useTranslations(tool.namespace);
  const tGlobal = useTranslations();
  // Locale string needed by RelatedBlogsByCategory and (less directly) for
  // future per-locale routing inside the linked use-case headers.
  const locale = useLocale();

  // P0 #1 interconnection data — all server-deterministic, derived from
  // the tool slug. See docs/interconnection.md.
  const siblingTools = getSiblingTools(slug, 3);
  const personas = getPersonasForTool(slug);
  const relatedBlogCategories = TOOL_BLOG_CATEGORIES[slug] ?? [];
  const pinnedBlogSlugs = TOOL_PINNED_BLOGS[slug] ?? [];

  const user = useAtomValue(userAtom);
  const clientMounted = useAtomValue(clientMountedAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const setCreateJobCtx = useSetAtom(createJobContextAtom);
  const { trackAction } = useTracking();

  const handleTryItClick = () => {
    if (tool.action?.type !== "modal") return;

    // Track the hero "Create" click — same tool_card content_type used
    // by the ToolsGrid (related-tools / use-cases) and the /tools
    // landing page so admin can fold all surfaces under one tool dim.
    trackAction(
      { contentId: tool.id, contentType: "tool_card", viewMode: "cards" },
      "click",
    );

    if (!user) {
      setDrawer("signin");
      return;
    }

    setCreateJobCtx({ toolId: tool.id, slug: tool.slug, job_type: tool.job_type });
    setModalState("add");
  };

  const demo = tool.demo;

  // The image2image `generate` tool renders the 3-column reproduce workbench,
  // which is cramped at max-w-5xl — give that page a relaxed (still centered)
  // main so the 3 workflow columns have room to breathe. Other tools stay
  // max-w-5xl.
  const wideMain = tool.action?.type === "generate";

  return (
    <main
      className={`${wideMain ? "max-w-[1600px]" : "max-w-5xl"} mx-auto pt-20 px-6 py-12 text-[var(--c2)]`}
    >
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">{t("title")}</h1>
      <p className="text-lg mb-6">{t("description")}</p>

      {demo?.type === "language_switch" ? (
        <LanguageSwitchVideoDemo
          ariaLabel={t("demo.aria")}
          caption={t("demo.caption")}
          nowPlayingText={(label) => t("demo.nowPlaying", { lang: label })}
          languages={demo.languages}
          defaultLang={demo.defaultLang}
        />
      ) : demo?.type === "single_video" ? (
        <>
          {/* Dual cap so BOTH orientations stay reasonable and centered:
              max-w-2xl (672px) bounds landscape width; max-h-[70vh] bounds
              portrait height (9:16 workflow demos are 1080×1920 — without a
              height cap a 672px-wide portrait video renders ~1200px tall and
              dominates the page). w-auto lets the video keep its aspect ratio
              within whichever bound binds first. */}
          <CdnVideo
            className="w-auto max-w-2xl max-h-[70vh] mx-auto rounded-xl shadow mb-4"
            controls
            poster={demo.poster}
            src={demo.src}
          />
          <p className="text-sm text-gray-500 mb-8 text-center">{t("example")}</p>
        </>
      ) : demo?.type === "single_image" ? (
        <>
          {/* For tools whose output is a still image (product photo, character
              card, infographic). Same max-w-2xl cap so a 1024-wide
              template gallery image doesn't dominate the page. */}
          <CdnImage
            className="w-full max-w-2xl mx-auto rounded-xl shadow mb-4"
            src={demo.src}
            alt={demo.alt || t("title")}
          />
          <p className="text-sm text-gray-500 mb-8 text-center">{t("example")}</p>
        </>
      ) : null}

      <div id="reproduce" className="mt-8 scroll-mt-24 text-center">
        {tool.action?.type === "generate" && generateData ? (
          // Real inline image2image tool: 3-column workbench (upload → generate
          // → designer pack), same as the image2image template-detail pages.
          <EcommercePhotoGenerate locale={locale} data={generateData} />
        ) : tool.action?.type === "product_video" ? (
          // Real inline product-video tool: structured input → PRODUCT_VIDEO job.
          <ProductVideoGenerate />
        ) : tool.action?.type === "brand_direction" ? (
          // One-line brief → three preset creative directions → generate the
          // chosen visual. Moved here from the standalone
          // /brand-direction-explorer route on 2026-08-12 (301 in next.config).
          <BrandDirectionExplorerClient locale={locale} />
        ) : tool.action?.type === "sticker_export" ? (
          // Self-serve factory export — the first surface that actually calls
          // POST /design-tools/*. Charges 20 credits, stated before the click.
          <StickerExportForm />
        ) : tool.action?.type === "acrylic_export" ? (
          <AcrylicExportForm presetImageUrl={presetImageUrl} />
        ) : tool.action?.type === "packaging_mockup" ? (
          <PackagingMockupForm />
        ) : tool.action?.type === "impromptu_practice" ? (
          // Random topic → 30s prep → 90s webcam take → playback/download.
          // Fully client-side; no job, no credits, no sign-in.
          <ImpromptuSpeechPractice />
        ) : tool.action?.type === "photo_retouch" ? (
          // Anonymous photo editing: upload one frame → edited file, no sign-in.
          // Its own multipart endpoint, like costume_tryon below.
          <PhotoRetouchGenerate />
        ) : tool.action?.type === "costume_tryon" ? (
          // Anonymous viral costume try-on: upload one photo → dynasty-costume
          // transformation mp4. No sign-in required (own multipart endpoint).
          <CostumeTryonGenerate />
        ) : tool.status === "create" && tool.action?.type === "modal" ? (
          <button
            onClick={handleTryItClick}
            className="mt-4 text-white px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer relative text-lg"
            type="button"
          >
            {tGlobal("tools.create")}
            {clientMounted && !user && (
              <span className="ml-2 text-xs opacity-80">🔒</span>
            )}
          </button>
        ) : (
          <p className="text-blue-600 font-semibold italic text-lg">
            {tGlobal("tools.coming_soon")}
          </p>
        )}
      </div>

      {/* Related templates — 1-2 rows of on-intent template cards directly below
          the inline workflow, to give visitors more to try and lift conversion. */}
      {relatedTemplateCards && relatedTemplateCards.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">
            {tGlobal("interconnection.relatedTemplates")}
          </h2>
          <TemplateStrip
            cards={relatedTemplateCards.map(toTemplateStripCard)}
            trackPrefix="tool-related-templates"
            maxRows={8}
          />
        </section>
      )}

      {/* Bulk-production CTA. Sits directly under the tool (and its related
          templates) because that is the moment "I need forty of these, not
          one" lands, and because it is the only CTA on the site that carries
          ?source= into /contact -- so a lead from here arrives naming the tool
          that produced it instead of as an anonymous Trial Request.
          No `subject`: the tool title ("AI Fashion Model Generator") reads
          badly inside "Need the whole {subject} set", and the generic headline
          is already correct in all ten locales. */}
      {BULK_CALLOUT_TOOLS.has(slug) && (
        <section className="mt-16">
          <BulkDesignCallout source={`tool/${slug}`} />
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("why.title")}</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>{t("why.point1")}</li>
          <li>{t("why.point2")}</li>
          <li>{t("why.point3")}</li>
          <li>{t("why.point4")}</li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("faq.title")}</h2>

        {FAQ_SLOTS
          .filter((i) => (t as any).has(`faq.q${i}`) && (t as any).has(`faq.a${i}`))
          .map((i) => (
            <div key={i}>
              <p className="text-base mb-2 font-medium">{t(`faq.q${i}` as never)}</p>
              <p className="text-sm text-gray-600 mb-4">{t(`faq.a${i}` as never)}</p>
            </div>
          ))}

        {/* FAQPage JSON-LD — rich results for the tool's FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_SLOTS
                .filter((i) => (t as any).has(`faq.q${i}`) && (t as any).has(`faq.a${i}`))
                .map((i) => ({
                  "@type": "Question",
                  name: t(`faq.q${i}` as never),
                  acceptedAnswer: { "@type": "Answer", text: t(`faq.a${i}` as never) },
                })),
            }),
          }}
        />

        {/* HowTo — sourced from the deep.how block every tool namespace already
            carries, so this costs no new copy. Emitted only when the steps exist. */}
        {(t as any).has("deep.how.p1") && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: t("deep.how.title"),
                step: HOWTO_SLOTS
                  .filter((i) => (t as any).has(`deep.how.p${i}`))
                  .map((i, idx) => ({
                    "@type": "HowToStep",
                    position: idx + 1,
                    text: t(`deep.how.p${i}` as never),
                  })),
              }),
            }}
          />
        )}

        {/* WebApplication + Offer. Honest: these tools are genuinely free. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("title"),
              description: t("description"),
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </section>

      <section className="mt-20 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.what.title")}</h2>
          <p className="text-base">{t("deep.what.p1")}</p>
          <p className="text-base">{t("deep.what.p2")}</p>
          <p className="text-base">{t("deep.what.p3")}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.how.title")}</h2>
          <p className="text-base">{t("deep.how.p1")}</p>
          <p className="text-base">{t("deep.how.p2")}</p>
          <p className="text-base">{t("deep.how.p3")}</p>
          <p className="text-base">{t("deep.how.p4")}</p>
          <p className="text-base">{t("deep.how.p5")}</p>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.usecases.title")}</h2>

          {/* Each subsection header is now a link to the matching
              /use-cases/<persona> landing page so the prose "Who Uses
              X?" block gains the same persona-fan-out the chip row
              below adds. USECASE_SECTION_TO_PERSONA holds the mapping. */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${ucPersonas.creators}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.creatorsTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.creatorsBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${ucPersonas.education}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.educationTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.educationBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${ucPersonas.business}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.businessTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.businessBody")}</p>
          </div>

          {/* Persona chips — inverse lookup of USE_CASES[].toolSlugs (every
              persona that lists this tool). Folded into the "Who Uses X"
              section so the prose narrative and the chip-level fan-out
              live as one cohesive surface instead of duplicate headings. */}
          {personas.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <UseCaseChipsRow filterTo={personas} />
            </div>
          )}
        </div>
      </section>

      {/* P0 #1c — sibling tools in the same group. Reuses ToolsGrid in a
          2-up layout to match the rest of the page width. */}
      {siblingTools.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--c1)]">
            {tGlobal("interconnection.relatedTools", {
              defaultValue: "Related tools",
            })}
          </h2>
          <ToolsGrid
            tools={siblingTools}
            gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        </section>
      )}

      {/* P0 #1a — related reading from the blog categories the
          tool maps to. Renders nothing if no posts match. */}
      {relatedBlogCategories.length > 0 && (
        <RelatedBlogsByCategory
          categories={relatedBlogCategories}
          locale={locale}
          max={3}
          pinnedSlugs={pinnedBlogSlugs}
          heading={tGlobal("interconnection.relatedReading", {
            defaultValue: "Related reading",
          })}
        />
      )}

      <CreateNewModal />
    </main>
  );
}
