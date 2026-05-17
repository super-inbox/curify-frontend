"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SearchBar from "@/app/[locale]/_components/SearchBar";
import LocaleSwitcher from "@/app/[locale]/_components/LocaleSwitcher";
import EntryBar from "@/app/[locale]/_components/EntryBar";

export default function SiteTopBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isBlogPage =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === `/${locale}/blog` ||
    pathname.startsWith(`/${locale}/blog/`);

  // Hide the EntryBar (tier-1 topic capsules + use-case chip row) on
  // template-detail, example-detail, and gallery-prompt-detail pages —
  // those have their own in-page topic chips / use-case chips in the
  // hero header, so the EntryBar duplicates them. Keep SearchBar and
  // LocaleSwitcher visible.
  const hideEntryBar =
    /\/nano-template\/[^/]+/.test(pathname) ||
    /\/nano-banana-pro-prompts\/\d+(?:\/|$)/.test(pathname);

  // On every other page, auto-fold the EntryBar when the reader scrolls
  // down (so the row collapses out of the sticky bar and gives the
  // reading area more room) and re-show it on scroll up or near the top.
  // SearchBar + LocaleSwitcher always stay visible.
  //
  // Implementation: RAF-throttled scroll handler with a same-direction
  // accumulator. Inertial bounces / touchpad rubber-banding produce a
  // single gesture that registers as alternating up/down deltas — naive
  // direction detection would flap the state and flash the bar. The
  // accumulator only flips state when cumulative motion exceeds the
  // TRIGGER threshold in one direction, and resets to zero on reversal.
  const [entryBarFolded, setEntryBarFolded] = useState(false);
  const lastYRef = useRef(0);
  const accumRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (isBlogPage || hideEntryBar) return;
    lastYRef.current = window.scrollY;
    accumRef.current = 0;

    const TOP_FLOOR = 50;
    const TRIGGER = 30;

    const tick = () => {
      rafRef.current = null;
      const y = window.scrollY;
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y < TOP_FLOOR) {
        accumRef.current = 0;
        setEntryBarFolded(false);
        return;
      }

      // Reset accumulator on direction reversal so a brief jitter in
      // the opposite direction can't accidentally drive past TRIGGER.
      if (
        (accumRef.current > 0 && delta < 0) ||
        (accumRef.current < 0 && delta > 0)
      ) {
        accumRef.current = delta;
      } else {
        accumRef.current += delta;
      }

      if (accumRef.current > TRIGGER) setEntryBarFolded(true);
      else if (accumRef.current < -TRIGGER) setEntryBarFolded(false);
    };

    const onScroll = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isBlogPage, hideEntryBar]);

  if (isBlogPage) return null;

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur px-4 pt-3 pb-4">
      {/* LocaleSwitcher lives in the SearchBar row so that hiding the
          EntryBar collapses the sticky-bar height instead of leaving
          an empty mt-3 row blocking the page content below. */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <SearchBar locale={locale} />
        </div>
        <LocaleSwitcher />
      </div>
      {/* EntryBar is absolutely positioned just below the SearchBar row
          rather than living in the sticky bar's flow. Toggling its
          visibility no longer changes the sticky bar's height, so the
          page content below never reflows — which was the source of the
          scroll-up flash. Pure conditional render with no transition:
          the bar snaps in/out, no slide, no dissolve. */}
      {!hideEntryBar && !entryBarFolded && (
        <div className="absolute left-0 right-0 top-full px-4 pb-3 bg-[#FDFDFD]/95 backdrop-blur">
          <EntryBar locale={locale} />
        </div>
      )}
    </div>
  );
}
