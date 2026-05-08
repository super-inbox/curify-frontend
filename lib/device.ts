"use client";

import { useEffect, useState } from "react";

/**
 * True on touch-first devices (phones, tablets) — based on the
 * "Android|iPhone|iPad|iPod|Mobile" UA fragment OR the
 * `(pointer: coarse)` media query (Android Chromebooks, hybrid
 * laptops in tablet mode).
 *
 * Synchronous read of `navigator` / `window.matchMedia` — safe at
 * runtime in the browser, returns `false` during SSR.
 */
export function isMobileLikeDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || coarsePointer;
}

/**
 * Reactive variant of `isMobileLikeDevice` — returns `false` during
 * SSR (so server output matches a desktop default), then flips on the
 * client after mount and re-renders when the pointer media query
 * changes (e.g. user docks a tablet to a keyboard).
 */
export function useIsMobileLikeDevice(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const apply = () => setIsMobile(isMobileLikeDevice());
    apply();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return isMobile;
}

/**
 * Column count for the standard `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`
 * card grid used across the site (NanoInspirationRow, ExampleImagesGrid).
 * Returns a desktop-default during SSR; updates on resize after mount.
 */
export function useGridCols(): number {
  const [cols, setCols] = useState(5);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      setCols(w >= 1024 ? 5 : w >= 640 ? 3 : 2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}
