"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import ProgressiveCdnImage from "@/app/[locale]/_components/ProgressiveCdnImage";
import ExampleVideoPlayer from "../../example/[exampleId]/ExampleVideoPlayer";
import { useTracking } from "@/services/useTracking";

type Slide = {
  id: string;
  title: string;
  templateId: string;
  imageUrl: string;
  previewImageUrl?: string;
  videoUrl?: string;
};

type Props = {
  slides: Slide[];
  initialIndex: number;
  locale: string;
  slug: string;
  media: "image" | "video";
};

export default function CarouselClient({
  slides,
  initialIndex,
  locale,
  slug,
  media,
}: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // Set to false to skip the slide-track transition for one frame — used
  // when wrapping around so the carousel doesn't visibly fly across every
  // slide between the edges.
  const [animate, setAnimate] = useState(true);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragStartX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const trackedSlides = useRef<Set<string>>(new Set());
  const { track } = useTracking();

  const slide = slides[index];

  const goTo = useCallback(
    (next: number) => {
      const len = slides.length;
      if (len === 0) return;
      const wrapped = ((next % len) + len) % len;
      const isWrap = Math.abs(wrapped - index) > 1;
      if (isWrap) setAnimate(false);
      setIndex(wrapped);
      setDragX(0);
    },
    [slides.length, index]
  );

  // Re-enable transitions one frame after a wrap so subsequent moves animate.
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const close = useCallback(() => {
    if (!slide) {
      router.push(`/${locale}/nano-template/${slug}`);
      return;
    }
    router.push(
      `/${locale}/nano-template/${slug}/example/${encodeURIComponent(slide.id)}`
    );
  }, [router, locale, slug, slide]);

  // Body scroll lock while in carousel
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keep URL in sync with current slide so the link is shareable, but use
  // history.replaceState (not router.push) so back-button exits the carousel
  // rather than walking through every slide.
  useEffect(() => {
    if (!slide) return;
    const url = `/${locale}/nano-template/${slug}/carousel/${encodeURIComponent(slide.id)}?media=${media}`;
    window.history.replaceState(null, "", url);
  }, [slide, locale, slug, media]);

  // Track view per unique slide visited
  useEffect(() => {
    if (!slide) return;
    if (trackedSlides.current.has(slide.id)) return;
    trackedSlides.current.add(slide.id);
    track({
      contentId: `${slide.templateId}:${slide.id}`,
      contentType: "nano_inspiration_example_grid",
      actionType: "view",
      viewMode: "cards",
    });
  }, [slide, track]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, goTo]);

  // Touch swipe (ported from the previous in-grid Lightbox)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
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
    const raw = e.touches[0].clientX - dragStartX.current;
    setDragX(raw);
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

  if (!slide) return null;

  const exampleHref = `/${locale}/nano-template/${slug}/example/${encodeURIComponent(slide.id)}`;
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const trackBrowse = (suffix: "prev" | "next" | "dot") => {
    track({
      contentId: `${slide.templateId}:${slide.id}:${suffix}`,
      contentType: "prev_next",
      actionType: "click",
      viewMode: "cards",
    });
  };
  const trackViewPrompt = () => {
    track({
      contentId: `${slide.templateId}:${slide.id}`,
      contentType: "nano_inspiration_example_grid",
      actionType: "click",
      viewMode: "cards",
    });
  };

  return (
    // Click anywhere outside an interactive element or media → go to prompt page.
    // Internal media + buttons stop propagation so they keep their own behavior.
    <div className="fixed inset-0 z-50 flex flex-col bg-black" onClick={close}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm text-white/60">
          {index + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
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
            transition: isDragging || !animate
              ? "none"
              : "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        >
          {slides.map((s, i) => {
            const isActive = i === index;
            return (
              <div
                key={s.id}
                className="flex h-full items-center justify-center"
                style={{ width: `${100 / slides.length}%` }}
              >
                {Math.abs(i - index) <= 1 && (
                  <div
                    className="relative flex h-full w-full items-center justify-center p-2"
                    onClick={stopPropagation}
                  >
                    {media === "video" && s.videoUrl ? (
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
                    ) : (
                      <ProgressiveCdnImage
                        previewSrc={s.previewImageUrl}
                        fullSrc={s.imageUrl}
                        alt={s.title || s.id}
                        className="h-full w-full object-contain select-none"
                        priority={isActive}
                        noZoom
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop prev/next arrows — always rendered (carousel wraps) */}
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

      {/* Footer: dots + view-prompt link */}
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
        <Link
          href={exampleHref}
          onClick={(e) => {
            e.stopPropagation();
            trackViewPrompt();
          }}
          className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-neutral-900 shadow backdrop-blur-sm hover:bg-white"
        >
          View prompt →
        </Link>
      </div>
    </div>
  );
}
