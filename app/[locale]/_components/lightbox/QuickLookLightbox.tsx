"use client";

/**
 * Phase 3 — unified quick-look lightbox for the mixed grids (search, gallery,
 * home fused row, "more like this"). Clicking a tile opens an OVERLAY instead of
 * navigating, so browsing momentum is preserved (Canva pattern). Backed by a
 * shallow `?peek=…` URL (history.pushState — no server nav) so it's shareable and
 * the back button closes it. The tile keeps its real <Link href> so crawlers
 * still follow the link graph to the full page.
 *
 * Two content kinds share one shell (info-heavy branch): a template example and
 * a gallery prompt. Generator-demo examples only differ in the CTA label/target.
 * Cold-load (a shared ?peek link opened fresh, before any in-app state) redirects
 * to the canonical full page — the safe, SEO-correct destination.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { X, Sparkles, ExternalLink } from "lucide-react";
import CdnImage from "@/app/[locale]/_components/CdnImage";

export type PeekItem =
  | {
      kind: "example";
      id: string;
      slug: string; // template slug (toSlug(templateId))
      title?: string;
      image: string;
      category?: string;
      params?: Record<string, string>;
      /** false → generator-demo template (CTA becomes "Use this template"). */
      indexable?: boolean;
    }
  | {
      kind: "prompt";
      id: string | number;
      title?: string;
      image: string;
      category?: string;
    };

// ── URL <-> item (compact, path-like so cold-load can reconstruct the page) ──
function encodePeek(item: PeekItem): string {
  return item.kind === "example" ? `e/${item.slug}/${item.id}` : `p/${item.id}`;
}
function fullPagePath(locale: string, item: PeekItem): string {
  const p = locale === "en" ? "" : `/${locale}`;
  return item.kind === "example"
    ? `${p}/nano-template/${item.slug}/example/${encodeURIComponent(item.id)}`
    : `${p}/nano-banana-pro-prompts/${item.id}`;
}
function ctaFor(locale: string, item: PeekItem): { label: string; href: string } {
  const p = locale === "en" ? "" : `/${locale}`;
  if (item.kind === "prompt") {
    return { label: "Try this prompt", href: `${p}/nano-banana-pro-prompts/${item.id}` };
  }
  const qs =
    item.params && Object.keys(item.params).length > 0
      ? `?${new URLSearchParams(item.params).toString()}`
      : "";
  return {
    // generator-demo → the tool is the star; info-heavy → customize this piece.
    label: item.indexable === false ? "Use this template" : "Customize",
    href: `${p}/nano-template/${item.slug}${qs}#reproduce`,
  };
}
/** Rebuild the canonical full-page path from a bare ?peek value (cold load). */
function coldLoadPath(locale: string, peek: string): string | null {
  const parts = peek.split("/");
  const pfx = locale === "en" ? "" : `/${locale}`;
  if (parts[0] === "e" && parts[1] && parts[2]) {
    return `${pfx}/nano-template/${parts[1]}/example/${encodeURIComponent(parts.slice(2).join("/"))}`;
  }
  if (parts[0] === "p" && parts[1]) return `${pfx}/nano-banana-pro-prompts/${parts[1]}`;
  return null;
}

// ── context ──
type Ctx = { open: (item: PeekItem) => void; close: () => void };
const LightboxCtx = createContext<Ctx | null>(null);
export function useLightbox(): Ctx {
  return useContext(LightboxCtx) ?? { open: () => {}, close: () => {} };
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [item, setItem] = useState<PeekItem | null>(null);

  const close = useCallback(() => {
    setItem(null);
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("peek")) {
      window.history.back();
    }
  }, []);

  const open = useCallback(
    (next: PeekItem) => {
      setItem(next);
      const url = new URL(window.location.href);
      url.searchParams.set("peek", encodePeek(next));
      window.history.pushState({ peek: true }, "", url.toString());
    },
    []
  );

  // Back/forward: if the URL no longer carries ?peek, the overlay must close.
  useEffect(() => {
    const onPop = () => {
      if (!new URLSearchParams(window.location.search).has("peek")) setItem(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Cold load: a shared ?peek link opened with no in-app state → send them to
  // the canonical full page (has the real content + more-like-this + SEO).
  useEffect(() => {
    if (item) return;
    const peek = new URLSearchParams(window.location.search).get("peek");
    if (!peek) return;
    const dest = coldLoadPath(locale, peek);
    if (dest) window.location.replace(dest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc + scroll-lock while open.
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, close]);

  return (
    <LightboxCtx.Provider value={{ open, close }}>
      {children}
      {item ? <Overlay item={item} locale={locale} onClose={close} /> : null}
    </LightboxCtx.Provider>
  );
}

function Overlay({
  item,
  locale,
  onClose,
}: {
  item: PeekItem;
  locale: string;
  onClose: () => void;
}) {
  const cta = ctaFor(locale, item);
  const fullHref = fullPagePath(locale, item);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title || "Preview"}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image — appreciate first */}
        <div className="flex items-center justify-center bg-neutral-50 sm:w-1/2">
          <CdnImage
            src={item.image}
            alt={item.title || "Preview"}
            width={800}
            height={1000}
            className="max-h-[45vh] w-auto object-contain sm:max-h-[92vh]"
          />
        </div>

        {/* Meta + actions */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
          {item.category ? (
            <span className="inline-flex w-fit items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {item.category}
            </span>
          ) : null}
          <h2 className="text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
            {item.title || "Untitled"}
          </h2>

          <div className="mt-auto flex flex-col gap-2.5">
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4" /> {cta.label}
            </Link>
            <Link
              href={fullHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Open full page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
