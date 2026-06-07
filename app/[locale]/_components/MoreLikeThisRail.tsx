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
          width AND shape: the hero row is lg:grid-cols-6 with rail at
          col-span-2, and the below-hero grid is xl:grid-cols-6 — so
          rail cards are the same width as the below-hero cards on xl
          viewports. Each card mirrors the ExampleImagesGrid shell
          (rounded-3xl border, aspect-[3/4] image) so the rail and the
          below-hero grid look like one continuous gallery. */}
      <ul className="grid grid-cols-2 gap-3">
        {shown.map((item, i) => (
          <li key={item.href + ":" + i}>
            <Link
              href={item.href}
              className="group block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label={item.alt}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <CdnImage
                  src={item.src}
                  alt={item.alt}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {item.title ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-6 text-[10px] font-medium leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="line-clamp-2">{item.title}</span>
                  </div>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
