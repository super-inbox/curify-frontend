"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import DescriptionClamp from "@/app/[locale]/_components/DescriptionClamp";
import PromptBreakdown from "@/app/[locale]/_components/PromptBreakdown";
import PromptPreviewBlock from "@/app/[locale]/_components/PromptPreviewBlock";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import { useClickTracking } from "@/services/useTracking";

type PrevNextLink = {
  href: string;
  label?: string;
};

type PrevNextNav = {
  prev: PrevNextLink;
  next: PrevNextLink;
  index?: number;
  total?: number;
};

type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

type ExamplePromptHeroProps = {
  title: string;
  image: ReactNode;
  actionBar?: ReactNode;
  beforePrompt?: ReactNode;
  rightColumnContent?: ReactNode;
  prompt: string;
  trackingId?: string;
  breadcrumbs?: BreadcrumbItem[];
  metaChips?: ReactNode;
  description?: string;
  promptVariant?: "breakdown" | "preview";
  promptParams?: Record<string, string | number | boolean | null | undefined>;
  promptCollapsedMaxHeight?: number;
  prevNext?: PrevNextNav | null;
  className?: string;
  /**
   * If set, render a `UseCaseChipsRow` below the prompt block, scoped to
   * these use-case slugs. Only fires on the default right-column path
   * (when `rightColumnContent` is not provided) — so on /nano-banana-pro-
   * prompts/[id] but not on the example page (which renders its own
   * right column via ExampleRightColumn).
   */
  useCaseFilter?: readonly string[];
  /**
   * Optional sidebar rail rendered to the right of the image + prompt
   * pair on lg+. Hidden on mobile by the rail itself — the existing
   * below-hero "More like this" / "Related Images" section already
   * serves smaller viewports. Pass a `<MoreLikeThisRail items={…} />`
   * (or any compatible aside) — when present, the hero shifts into a
   * 5-col outer grid (image+prompt span 4, rail spans 1).
   */
  moreLikeThisRail?: ReactNode;
};

function DesktopPrevNext({ prevNext, trackingId }: { prevNext?: PrevNextNav | null; trackingId?: string }) {
  const trackPrev = useClickTracking(`${trackingId ?? "unknown"}:prev`, "prev_next");
  const trackNext = useClickTracking(`${trackingId ?? "unknown"}:next`, "prev_next");

  if (!prevNext) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center lg:flex">
        <Link
          href={prevNext.prev.href}
          aria-label={prevNext.prev.label || "Previous"}
          onClick={trackPrev}
          className="pointer-events-auto inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/85 text-base text-neutral-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-neutral-900"
        >
          &lt;
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center justify-end lg:flex">
        <Link
          href={prevNext.next.href}
          aria-label={prevNext.next.label || "Next"}
          onClick={trackNext}
          className="pointer-events-auto inline-flex h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/85 text-base text-neutral-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-neutral-900"
        >
          &gt;
        </Link>
      </div>
    </>
  );
}

function MobilePrevNext({ prevNext, trackingId }: { prevNext?: PrevNextNav | null; trackingId?: string }) {
  const trackPrev = useClickTracking(`${trackingId ?? "unknown"}:prev`, "prev_next");
  const trackNext = useClickTracking(`${trackingId ?? "unknown"}:next`, "prev_next");

  if (!prevNext) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
      <Link
        href={prevNext.prev.href}
        onClick={trackPrev}
        className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
      >
        ← Prev
      </Link>

      {typeof prevNext.index === "number" && typeof prevNext.total === "number" ? (
        <span className="text-xs font-medium text-neutral-500">
          {prevNext.index + 1} / {prevNext.total}
        </span>
      ) : (
        <span />
      )}

      <Link
        href={prevNext.next.href}
        onClick={trackNext}
        className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
      >
        Next →
      </Link>
    </div>
  );
}

function BreadcrumbLink({ item }: { item: BreadcrumbItem }) {
  const trackClick = useClickTracking(item.href ?? "breadcrumb", "breadcrumb");
  return (
    <Link href={item.href!} onClick={trackClick} className="hover:text-neutral-800">
      {item.label}
    </Link>
  );
}

function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="contents">
            {item.href && !isLast ? (
              <BreadcrumbLink item={item} />
            ) : (
              <span
                className={
                  isLast
                    ? "line-clamp-1 font-medium text-neutral-800"
                    : undefined
                }
              >
                {item.label}
              </span>
            )}

            {!isLast ? <span>/</span> : null}
          </div>
        );
      })}
    </nav>
  );
}

export default function ExamplePromptHero({
  title,
  image,
  actionBar,
  beforePrompt,
  rightColumnContent,
  prompt,
  trackingId,
  breadcrumbs,
  metaChips,
  description,
  promptVariant = "preview",
  promptParams,
  promptCollapsedMaxHeight,
  prevNext,
  className,
  useCaseFilter,
  moreLikeThisRail,
}: ExamplePromptHeroProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Page header — H1 and topic capsules sit on the same row so the
          hoisted header is a single horizontal band above the hero,
          letting the image card / right-column collapse to their content
          height. Wraps on narrow viewports. */}
      <header className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
          {title}
        </h1>
        {metaChips ? (
          <div className="flex flex-wrap items-center gap-2">{metaChips}</div>
        ) : null}
      </header>

      <section className={["relative", className].filter(Boolean).join(" ")}>
        <DesktopPrevNext prevNext={prevNext} trackingId={trackingId} />

        {/* Outer grid: when moreLikeThisRail is supplied, allocate 4 cols
            (of 6) for the image + reproduction pair and 2 cols for the
            rail. The 4/2 split lines the rail card width up with the
            below-hero xl:grid-cols-6 card grid — 2 rail cols out of 6
            page cols = same card width as the below-hero 6-col grid on
            xl viewports. Without a rail the outer grid collapses to a
            single column. */}
        <div className={moreLikeThisRail ? "lg:grid lg:grid-cols-6 lg:gap-6" : ""}>
          <div className={moreLikeThisRail ? "lg:col-span-4" : ""}>
            {/* Inner 2-col: image card sized at 85% of the prior hero
                width (1.05fr → 0.89fr) and pinned to a fixed 440 px
                height on lg+ so the example page and the gallery prompt
                page render the image at the same size regardless of
                right-column content or image aspect ratio. Items-stretch
                still aligns the right column to match for the typical
                case (right col < 440); for the rare heavy-params
                template the row grows past 440, the image card stays
                440 and aligns to the top of its grid cell. */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.89fr)_minmax(0,1.2fr)] lg:items-stretch">
              <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm lg:h-[440px] lg:self-start">
                {image}
              </div>

              <div className="flex flex-col gap-4 lg:justify-center">
                {rightColumnContent ? rightColumnContent : (
                  <>
                    {description ? (
                      <DescriptionClamp text={description} lines={2} />
                    ) : null}

                    {beforePrompt}

                    <section aria-labelledby="prompt-heading" className="flex flex-col">
                      <h2
                        id="prompt-heading"
                        className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
                      >
                        Prompt
                      </h2>

                      {promptVariant === "breakdown" ? (
                        <PromptBreakdown prompt={prompt} params={promptParams ?? {}} collapsedMaxHeight={promptCollapsedMaxHeight} />
                      ) : (
                        <PromptPreviewBlock
                          text={prompt}
                          collapsedRows={1}
                          expandable={true}
                          containerClassName="rounded-2xl border border-neutral-200 bg-neutral-50"
                          preClassName="text-neutral-800"
                          expandLabel="Show full prompt"
                          collapseLabel="Show less"
                        />
                      )}
                    </section>

                    {actionBar}

                    {useCaseFilter && useCaseFilter.length > 0 && (
                      <div className="border-t border-neutral-100 pt-3">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Use this prompt for
                        </div>
                        <UseCaseChipsRow filterTo={useCaseFilter} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {moreLikeThisRail ? (
            <div className="lg:col-span-2">{moreLikeThisRail}</div>
          ) : null}
        </div>
      </section>

      <MobilePrevNext prevNext={prevNext} trackingId={trackingId} />
    </>
  );
}