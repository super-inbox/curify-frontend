"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import PromptBreakdown from "@/app/[locale]/_components/PromptBreakdown";
import PromptPreviewBlock from "@/app/[locale]/_components/PromptPreviewBlock";
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
  actionBar: ReactNode;
  prompt: string;
  trackingId?: string;
  breadcrumbs?: BreadcrumbItem[];
  metaChips?: ReactNode;
  description?: string;
  promptVariant?: "breakdown" | "preview";
  promptParams?: Record<string, string | number | boolean | null | undefined>;
  prevNext?: PrevNextNav | null;
  className?: string;
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
  prompt,
  trackingId,
  breadcrumbs,
  metaChips,
  description,
  promptVariant = "preview",
  promptParams,
  prevNext,
  className,
}: ExamplePromptHeroProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <section className={["relative", className].filter(Boolean).join(" ")}>
        <DesktopPrevNext prevNext={prevNext} trackingId={trackingId} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-stretch">
          <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm lg:h-[520px]">
            {image}
          </div>

          <div className="flex flex-col gap-4 lg:min-h-[520px]">
            {metaChips ? (
              <div className="flex flex-wrap items-center gap-2">{metaChips}</div>
            ) : null}

            <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
              {title}
            </h1>

            {description ? (
              <p className="whitespace-pre-line text-sm leading-6 text-neutral-600">
                {description}
              </p>
            ) : null}

            <section aria-labelledby="prompt-heading" className="flex flex-col">
              <h2
                id="prompt-heading"
                className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
              >
                Prompt
              </h2>

              {promptVariant === "breakdown" ? (
                <PromptBreakdown prompt={prompt} params={promptParams ?? {}} />
              ) : (
                <PromptPreviewBlock
                  text={prompt}
                  collapsedRows={3}
                  expandable={true}
                  containerClassName="rounded-2xl border border-neutral-200 bg-neutral-50"
                  preClassName="text-neutral-800"
                  expandLabel="Show full prompt"
                  collapseLabel="Show less"
                />
              )}
            </section>

            <div className="mt-auto">{actionBar}</div>
          </div>
        </div>
      </section>

      <MobilePrevNext prevNext={prevNext} trackingId={trackingId} />
    </>
  );
}