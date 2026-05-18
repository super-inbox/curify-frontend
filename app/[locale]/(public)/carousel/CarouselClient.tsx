"use client";

// Unified carousel client used by both flavors of the /carousel/* routes:
//   - /[locale]/carousel/template-example/[slug]/[exampleId]?media=image|video
//   - /[locale]/carousel/prompt-gallery/[id]
//
// The two routes share gestures, swipe physics, image zoom, header, and
// share affordance. Three things diverge per slide kind:
//   1. URL replaceState path (sync the address bar to the active slide so
//      back-button exits the carousel rather than walking slides one by one).
//   2. Close-navigation target (template-example closes to the example
//      detail page; prompt-gallery closes to the prompt detail page).
//   3. Sidebar + footer content (template-example shows the reproduce
//      sidebar; prompt-gallery has no sidebar and adds a Copy prompt
//      button to the footer instead).
//
// Both surfaces are noindex; SEO weight lives at the detail page each
// canonicals to.

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Copy, Share, X } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import ExampleVideoPlayer from "@/app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/ExampleVideoPlayer";
import ExampleRightColumn from "@/app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/ExampleRightColumn";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import PromptRightColumn from "./PromptRightColumn";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";
import { useTracking } from "@/services/useTracking";
import { useIsMobileLikeDevice } from "@/lib/device";
import { toSlug } from "@/lib/nano_utils";
import type { TemplateParameter } from "@/lib/nano_utils";
import type { ExistingExampleRef } from "@/lib/editDistance";

const PROMPT_PLACEHOLDER_IMAGE = "/images/default-prompt-image.jpg";

function normalizePromptImage(raw?: string | null): string {
  if (!raw) return PROMPT_PLACEHOLDER_IMAGE;
  if (raw.includes("static/images/")) return raw.replace("/static/images/", "/images/");
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/") || raw.startsWith("http")) return raw;
  return `/${raw}`;
}

// Plain <img> with preview→full progressive swap. Avoids next/image so the
// rendered bounding box matches the visible image — clicks on dark padding
// bubble to the backdrop close handler rather than being captured by the img.
function ProgressiveSlideImage({
  previewSrc,
  fullSrc,
  alt,
  onFullLoaded,
}: {
  previewSrc?: string;
  fullSrc: string;
  alt: string;
  onFullLoaded?: () => void;
}) {
  const [src, setSrc] = useState<string>(previewSrc || fullSrc);
  useEffect(() => {
    setSrc(previewSrc || fullSrc);
    if (!fullSrc) return;
    if (fullSrc === previewSrc) {
      onFullLoaded?.();
      return;
    }
    const img = new window.Image();
    img.src = toCdnUrl(fullSrc);
    img.onload = () => {
      setSrc(fullSrc);
      onFullLoaded?.();
    };
  }, [previewSrc, fullSrc, onFullLoaded]);

  return (
    <img
      src={toCdnUrl(src)}
      alt={alt}
      draggable={false}
      className="max-h-full max-w-full select-none"
    />
  );
}

function ZoomableSlideImage({
  previewSrc,
  fullSrc,
  alt,
  onScaleChange,
}: {
  previewSrc?: string;
  fullSrc: string;
  alt: string;
  onScaleChange: (scale: number) => void;
}) {
  const [fullLoaded, setFullLoaded] = useState(false);
  const handleFullLoaded = useCallback(() => setFullLoaded(true), []);
  const [scale, setScale] = useState(1);

  const handleTransform = useCallback(
    (_ref: unknown, state: { scale: number }) => {
      setScale(state.scale);
      onScaleChange(state.scale);
    },
    [onScaleChange]
  );

  const isZoomed = scale > 1.001;

  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={5}
      disabled={!fullLoaded}
      doubleClick={{ mode: "toggle", step: 1.5, disabled: !fullLoaded }}
      pinch={{ disabled: !fullLoaded }}
      wheel={{ step: 0.2, disabled: !fullLoaded }}
      onTransform={handleTransform}
      panning={{ disabled: !fullLoaded || !isZoomed, velocityDisabled: true }}
    >
      <TransformComponent
        wrapperClass="!h-full !w-full !flex !items-center !justify-center"
        contentClass="!flex !items-center !justify-center"
      >
        <ProgressiveSlideImage
          previewSrc={previewSrc}
          fullSrc={fullSrc}
          alt={alt}
          onFullLoaded={handleFullLoaded}
        />
      </TransformComponent>
    </TransformWrapper>
  );
}

// ── Slide types ────────────────────────────────────────────────────────────

export type TemplateExampleSlide = {
  kind: "template-example";
  id: string;
  title: string;
  category: string;
  templateId: string;
  imageUrl: string;
  previewImageUrl?: string;
  videoUrl?: string;
  params: Record<string, string>;
  topics: string[];
};

export type PromptGallerySlide = {
  kind: "prompt-gallery";
  id: string | number;
  title: string;
  imageUrl: string;
  prompt: string;
  tags: string[];
  description?: string;
};

type Slide = TemplateExampleSlide | PromptGallerySlide;

// ── Props ──────────────────────────────────────────────────────────────────

type TemplateExampleProps = {
  mode: "template-example";
  slides: TemplateExampleSlide[];
  initialIndex: number;
  locale: string;
  siteUrl: string;
  slug: string;
  media: "image" | "video";
  templateTopics: string[];
  templateParameters: TemplateParameter[];
  templateAllowGeneration: boolean;
  templateBatch: boolean;
  basePrompt: string;
  existingExamples: ExistingExampleRef[];
  // If set (the grid passes its own page URL via ?from=…), close
  // returns the user there instead of the per-example detail page.
  closeHref?: string;
  // Raw comma-separated id list as it arrived in the URL. Persisted on
  // every URL sync so refresh / share keeps the grid sequence intact.
  gridIds?: string;
};

type PromptGalleryProps = {
  mode: "prompt-gallery";
  slides: PromptGallerySlide[];
  initialIndex: number;
  locale: string;
  siteUrl: string;
};

type Props = TemplateExampleProps | PromptGalleryProps;

// ── Component ──────────────────────────────────────────────────────────────

export default function CarouselClient(props: Props) {
  const router = useRouter();
  const isMobileDevice = useIsMobileLikeDevice();
  const { mode, slides, locale, siteUrl } = props;
  const [index, setIndex] = useState(props.initialIndex);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");
  const [promptCopied, setPromptCopied] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragStartX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const trackedSlides = useRef<Set<string | number>>(new Set());
  const { track } = useTracking();

  const slide: Slide | undefined = slides[index];

  const goTo = useCallback(
    (next: number) => {
      const len = slides.length;
      if (len === 0) return;
      const wrapped = ((next % len) + len) % len;
      const isWrap = Math.abs(wrapped - index) > 1;
      if (isWrap) setAnimate(false);
      setIndex(wrapped);
      setDragX(0);
      setZoomScale(1);
      setPromptCopied(false);
    },
    [slides.length, index]
  );

  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // Close handler — if the entry-point grid handed us its own URL via
  // ?from=, navigate back there (so a /topics or /search user lands
  // back on the page they were browsing). Otherwise fall back to the
  // underlying detail page of the active slide, or the parent listing
  // if no slide for some reason.
  const close = useCallback(() => {
    if (mode === "template-example") {
      const tProps = props as TemplateExampleProps;
      if (tProps.closeHref) {
        router.push(tProps.closeHref);
        return;
      }
    }
    if (!slide) {
      const fallback =
        mode === "template-example"
          ? `/${locale}/nano-template/${(props as TemplateExampleProps).slug}`
          : `/${locale}/nano-banana-pro-prompts`;
      router.push(fallback);
      return;
    }
    if (mode === "template-example") {
      const tProps = props as TemplateExampleProps;
      router.push(
        `/${locale}/nano-template/${tProps.slug}/example/${encodeURIComponent(slide.id as string)}`
      );
    } else {
      router.push(`/${locale}/nano-banana-pro-prompts/${slide.id}`);
    }
  }, [router, locale, slide, mode, props]);

  // Body scroll lock while in carousel
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Sync URL to the active slide (replaceState so back-button exits the
  // carousel rather than walking through every slide). Slides can span
  // templates (grid-context mode), so derive the slug from the current
  // slide's templateId rather than the entry-point slug. Preserve ids
  // and from so refresh / share keeps both the sequence and close target.
  useEffect(() => {
    if (!slide) return;
    let url: string;
    if (mode === "template-example") {
      const tProps = props as TemplateExampleProps;
      const slideSlug = toSlug((slide as TemplateExampleSlide).templateId);
      const params = new URLSearchParams();
      params.set("media", tProps.media);
      if (tProps.closeHref) {
        params.set("from", tProps.closeHref);
      }
      if (tProps.gridIds) {
        params.set("ids", tProps.gridIds);
      }
      url = `/${locale}/carousel/template-example/${slideSlug}/${encodeURIComponent(slide.id as string)}?${params.toString()}`;
    } else {
      url = `/${locale}/carousel/prompt-gallery/${slide.id}`;
    }
    window.history.replaceState(null, "", url);
  }, [slide, locale, mode, props]);

  // Track view per unique slide visited
  useEffect(() => {
    if (!slide) return;
    if (trackedSlides.current.has(slide.id)) return;
    trackedSlides.current.add(slide.id);
    if (mode === "template-example") {
      track({
        contentId: `${(slide as TemplateExampleSlide).templateId}:${slide.id}`,
        contentType: "nano_inspiration_example_grid",
        actionType: "view",
        viewMode: "cards",
      });
    } else {
      track({
        contentId: String(slide.id),
        contentType: "nano_gallery",
        actionType: "view",
        viewMode: "cards",
      });
    }
  }, [slide, track, mode]);

  // Keyboard navigation. Ignore arrow keys while focus is in an editable
  // field (the reproduce sidebar's inputs/selects) so the user can move
  // the cursor without flipping slides. Escape always closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editable =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if (e.key === "Escape") close();
      else if (!editable && e.key === "ArrowRight") goTo(index + 1);
      else if (!editable && e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, goTo]);

  // Touch swipe — suppressed when the active image is zoomed or when more
  // than one finger is on the surface (those belong to the zoom library).
  const onTouchStart = (e: React.TouchEvent) => {
    if (zoomScale > 1 || e.touches.length > 1) {
      isHorizontalSwipe.current = false;
      setIsDragging(false);
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (zoomScale > 1 || e.touches.length > 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (
      isHorizontalSwipe.current === null &&
      (Math.abs(dx) > 4 || Math.abs(dy) > 4)
    ) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontalSwipe.current) return;
    e.preventDefault();
    setDragX(e.touches[0].clientX - dragStartX.current);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!isHorizontalSwipe.current) {
      setDragX(0);
      return;
    }
    const threshold = window.innerWidth * 0.25;
    if (dragX < -threshold) goTo(index + 1);
    else if (dragX > threshold) goTo(index - 1);
    else setDragX(0);
  };

  // Per-slide URL used by share + footer link (the detail page url).
  const detailPageUrl = useMemo(() => {
    if (!slide) return "";
    if (mode === "template-example") {
      const tProps = props as TemplateExampleProps;
      return `${siteUrl}/${locale}/nano-template/${tProps.slug}/example/${encodeURIComponent(slide.id as string)}`;
    }
    return `${siteUrl}/${locale}/nano-banana-pro-prompts/${slide.id}`;
  }, [slide, mode, locale, siteUrl, props]);

  const trackViewDetail = () => {
    if (!slide) return;
    if (mode === "template-example") {
      track({
        contentId: `${(slide as TemplateExampleSlide).templateId}:${slide.id}`,
        contentType: "nano_inspiration_example_grid",
        actionType: "click",
        viewMode: "cards",
      });
    } else {
      track({
        contentId: String(slide.id),
        contentType: "nano_gallery",
        actionType: "click",
        viewMode: "cards",
      });
    }
  };

  const trackBrowse = (suffix: "prev" | "next" | "dot") => {
    if (!slide) return;
    const contentId =
      mode === "template-example"
        ? `${(slide as TemplateExampleSlide).templateId}:${slide.id}:${suffix}`
        : `${slide.id}:${suffix}`;
    track({
      contentId,
      contentType: "prev_next",
      actionType: "click",
      viewMode: "cards",
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slide) return;
    if (mode === "template-example") {
      track({
        contentId: `${(slide as TemplateExampleSlide).templateId}:${slide.id}`,
        contentType: "nano_inspiration_example_grid",
        actionType: "share",
        viewMode: "cards",
      });
    } else {
      track({
        contentId: String(slide.id),
        contentType: "nano_gallery",
        actionType: "share",
        viewMode: "cards",
      });
    }
    const shareData = { title: slide.title || "Curify AI", url: detailPageUrl };
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        setShareStatus("shared");
        setTimeout(() => setShareStatus("idle"), 2000);
        return;
      } catch {
        // canceled
      }
    }
    try {
      await navigator.clipboard.writeText(detailPageUrl);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slide || slide.kind !== "prompt-gallery" || !slide.prompt) return;
    track({
      contentId: String(slide.id),
      contentType: "nano_gallery",
      actionType: "copy",
      viewMode: "cards",
    });
    try {
      await navigator.clipboard.writeText(slide.prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!slide) return null;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const onBackdropClick = () => {
    trackViewDetail();
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black" onClick={onBackdropClick}>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <span className="text-sm text-white/60">
            {index + 1} / {slides.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label={shareStatus === "copied" ? "Link copied" : "Share"}
              title={shareStatus === "copied" ? "Link copied" : "Share"}
            >
              {shareStatus === "copied" ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Share className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                trackViewDetail();
                close();
              }}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slide track */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex h-full"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(calc(${(-index * 100) / slides.length}% + ${dragX / slides.length}px))`,
              transition:
                isDragging || !animate
                  ? "none"
                  : "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
            }}
          >
            {slides.map((s, i) => {
              const isActive = i === index;
              const fullSrc =
                s.kind === "prompt-gallery" ? normalizePromptImage(s.imageUrl) : s.imageUrl;
              const previewSrc =
                s.kind === "template-example" ? s.previewImageUrl : undefined;

              return (
                <div
                  key={s.id}
                  className="flex h-full items-center justify-center"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  {Math.abs(i - index) <= 1 && (
                    <div
                      className="relative flex h-full w-full items-center justify-center p-2"
                      onClick={(e) => {
                        if (e.target !== e.currentTarget) e.stopPropagation();
                      }}
                    >
                      {mode === "template-example" &&
                      (props as TemplateExampleProps).media === "video" &&
                      s.kind === "template-example" &&
                      s.videoUrl ? (
                        <ExampleVideoPlayer
                          key={s.id}
                          templateId={s.templateId}
                          exampleId={s.id}
                          videoUrl={s.videoUrl}
                          posterUrl={s.previewImageUrl ?? s.imageUrl}
                          title={s.title}
                          active={isActive}
                          autoPlay
                        />
                      ) : isActive && isMobileDevice ? (
                        <ZoomableSlideImage
                          key={s.id}
                          previewSrc={previewSrc}
                          fullSrc={fullSrc}
                          alt={s.title || String(s.id)}
                          onScaleChange={setZoomScale}
                        />
                      ) : (
                        <ProgressiveSlideImage
                          previewSrc={previewSrc}
                          fullSrc={fullSrc}
                          alt={s.title || String(s.id)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop prev/next arrows — carousel wraps so always show. */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  trackBrowse("prev");
                  goTo(index - 1);
                }}
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:flex"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  trackBrowse("next");
                  goTo(index + 1);
                }}
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:flex"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Footer: dots + per-mode actions */}
        <div className="shrink-0 flex flex-col items-center gap-3 px-4 py-4">
          {slides.length > 1 && slides.length <= 12 && (
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (i !== index) trackBrowse("dot");
                    goTo(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {mode === "template-example" ? (
            <Link
              href={`/${locale}/nano-template/${(props as TemplateExampleProps).slug}`}
              onClick={(e) => {
                e.stopPropagation();
                trackViewDetail();
              }}
              className="rounded-full border-2 border-purple-500 bg-white/90 px-5 py-2 text-sm font-bold text-purple-700 shadow backdrop-blur-sm hover:bg-white hover:border-purple-600"
            >
              Visit template →
            </Link>
          ) : (
            // Desktop has the rich PromptRightColumn sidebar with Copy +
            // View affordances; hide the duplicate buttons here on lg+.
            <div className="flex items-center gap-2 lg:hidden" onClick={stopPropagation}>
              {slide.kind === "prompt-gallery" && slide.prompt && (
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                  aria-label="Copy prompt text"
                >
                  {promptCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy prompt
                    </>
                  )}
                </button>
              )}
              <Link
                href={`/${locale}/nano-banana-pro-prompts/${slide.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  trackViewDetail();
                }}
                className="rounded-full border-2 border-purple-500 bg-white/90 px-4 py-1.5 text-xs font-bold text-purple-700 shadow hover:bg-white"
              >
                View prompt →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right: info sidebar — desktop only. Per-mode content. */}
      {mode === "template-example" && slide.kind === "template-example" && (
        <aside
          className="hidden lg:flex lg:w-80 xl:w-96 shrink-0 flex-col overflow-y-auto bg-white text-neutral-900"
          onClick={stopPropagation}
        >
          <div className="px-4 py-4">
            <ExampleRightColumn
              key={slide.id}
              showHeader
              chipTopics={(props as TemplateExampleProps).templateTopics}
              chipExampleTopics={slide.topics}
              chipCategory={slide.category}
              title={slide.title}
              templateId={slide.templateId}
              slug={(props as TemplateExampleProps).slug}
              locale={locale}
              parameters={(props as TemplateExampleProps).templateParameters}
              allowGeneration={(props as TemplateExampleProps).templateAllowGeneration}
              initialParams={slide.params}
              exampleId={slide.id}
              basePrompt={(props as TemplateExampleProps).basePrompt}
              batchEnabled={(props as TemplateExampleProps).templateBatch}
              examplePageUrl={detailPageUrl}
              existingExamples={(props as TemplateExampleProps).existingExamples}
            />
            {/* Use-case chips — visible inside the carousel overlay (which
                covers SiteTopBar / EntryBar entirely). Drops the leading
                "I am a..." label since the sidebar is space-constrained. */}
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <UseCaseChipsRow showQuestion={false} />
            </div>
          </div>
        </aside>
      )}

      {mode === "prompt-gallery" && slide.kind === "prompt-gallery" && (
        <aside
          className="hidden lg:flex lg:w-80 xl:w-96 shrink-0 flex-col overflow-y-auto bg-white text-neutral-900"
          onClick={stopPropagation}
        >
          <div className="px-4 py-4">
            <PromptRightColumn
              key={slide.id}
              promptId={slide.id}
              locale={locale}
              title={slide.title}
              description={slide.description}
              prompt={slide.prompt}
              tags={slide.tags}
            />
          </div>
        </aside>
      )}
    </div>
  );
}
