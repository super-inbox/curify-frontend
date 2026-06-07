import Link from "next/link";
import CdnImage from "./CdnImage";

// Vertical rail of small thumbnails — surfaces next to the hero on lg+
// screens so the example / prompt detail pages can show "more like this"
// images without the user scrolling. Hidden on mobile (the existing
// below-hero "More like this" section serves that audience).
//
// Each item: title + thumbnail src + click target. The component does
// NOT know whether items are template examples or prompt-gallery items —
// callers normalize the shape so the rail stays presentation-only.

export type RailItem = {
  href: string;
  src: string;
  alt: string;
  title?: string;
};

type Props = {
  items: RailItem[];
  heading?: string;
  /** Max thumbnails to render (default 8 — fills a 2×4 grid). Extras are dropped. */
  limit?: number;
};

export default function MoreLikeThisRail({ items, heading = "More like this", limit = 8 }: Props) {
  const shown = items.slice(0, limit);
  if (shown.length === 0) return null;
  return (
    <aside className="hidden lg:flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
        {heading}
      </h2>
      {/* Two-column grid so the rail cards match the below-hero grid card
          width: the hero row is lg:grid-cols-6 with rail at col-span-2,
          and the below-hero grid is xl:grid-cols-6 — so 2 rail cols at
          1/3 hero width ≈ 2/6 of the page = same card width as the
          below-hero 6-col grid on xl viewports. */}
      <ul className="grid grid-cols-2 gap-3">
        {shown.map((item, i) => (
          <li key={item.href + ":" + i}>
            <Link
              href={item.href}
              className="group relative block aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 transition hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label={item.alt}
            >
              <CdnImage
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.title ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-6 text-[10px] font-medium leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="line-clamp-2">{item.title}</span>
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
