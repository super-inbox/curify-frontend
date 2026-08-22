"use client";

// Shared post-generation export panel.
//
// WHY THIS EXISTS: four surfaces produce a generated image and each offered a
// different, non-overlapping subset of what to do next, with no shared code —
// ReproduceWorkbench had resize/print-ready/9-grid but no download bar and no
// factory export; ExampleGeneratePanel had download/share/remix but no reformat;
// GalleryReproduceSurface had download only; DesignAgentClient had factory export
// but no download. Which surface you happened to generate on silently decided what
// you were allowed to do with the result.
//
// It also fixes a present-then-refuse pattern: the workbench renders its
// result-dependent tiles unconditionally and then answers a click with "Generate a
// result first, then add a print bleed." This component only ever renders when a
// result exists, so the offer and the capability cannot disagree.
//
// Grouped by what the user is trying to do, cheapest first:
//   Reformat    — free, client-side canvas work, no credits, no backend
//   Manufacture — paid, the differentiated output, price stated before the click
//
// "Keep" (download / share / remix) deliberately stays with each surface's
// existing UnifiedActionBar rather than being duplicated here.

import { useCallback, useState } from "react";
import { Crop, Scissors, LayoutGrid, Loader2, Download, Package } from "lucide-react";

import {
  resizeToSocialBundle,
  makePrintReady,
  sliceIntoGrid,
  downloadVariant,
  type ResizedVariant,
} from "@/lib/resize_bundle";
import {
  offersPhysicalProduct,
  acrylicOfferHref,
  stickerOfferHref,
} from "@/lib/physical_product_offer";
import {
  STICKER_EXPORT_CREDITS,
  ACRYLIC_EXPORT_CREDITS,
  USD_PER_CREDIT,
} from "@/lib/pricing";
import { useTracking, type TrackingTarget } from "@/services/useTracking";

type Props = {
  /** The finished result. Component renders nothing without one — that is the point. */
  imageUrl: string | null | undefined;
  locale: string;
  /** Gates the Manufacture group: the exporters trace a silhouette, so they need a
   *  single cut-outable subject. An infographic or map traces into nonsense. */
  templateId?: string | null;
  tracking?: TrackingTarget;
  className?: string;
};

const usd = (credits: number) => `$${(credits * USD_PER_CREDIT).toFixed(0)}`;

export default function PostGenerationExports({
  imageUrl,
  locale,
  templateId,
  tracking,
  className,
}: Props) {
  const { trackAction } = useTracking();
  const [busy, setBusy] = useState<string | null>(null);
  const [variants, setVariants] = useState<ResizedVariant[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, fn: () => Promise<ResizedVariant[]>) => {
      if (busy || !imageUrl) return;
      setBusy(key);
      setNote(null);
      if (tracking) trackAction(tracking, "download");
      try {
        setVariants(await fn());
      } catch {
        // Canvas work needs CORS on the asset; see lib/resize_bundle header.
        setNote("Couldn't process this image in the browser. Try downloading it first.");
      } finally {
        setBusy(null);
      }
    },
    [busy, imageUrl, tracking, trackAction],
  );

  if (!imageUrl) return null;

  const canManufacture = offersPhysicalProduct(templateId);

  const reformat = [
    {
      key: "resize",
      label: "Resize for socials",
      hint: "1:1 · 4:5 · 9:16 · 16:9",
      icon: Crop,
      go: () => resizeToSocialBundle(imageUrl),
    },
    {
      key: "print-ready",
      label: "Make print-ready",
      hint: "Adds a bleed margin",
      icon: Scissors,
      go: async () => [await makePrintReady(imageUrl)],
    },
    {
      key: "ig-grid",
      label: "Instagram 9-grid",
      hint: "9 separate tiles",
      icon: LayoutGrid,
      go: () => sliceIntoGrid(imageUrl, 3, 3),
    },
  ];

  const btn =
    "flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm " +
    "font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-50 " +
    "disabled:cursor-not-allowed disabled:opacity-50";
  const groupLabel = "mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500";

  return (
    <div className={className ?? "mt-4 flex flex-col gap-4"}>
      <div>
        <p className={groupLabel}>Reformat · free</p>
        <div className="flex flex-wrap gap-2">
          {reformat.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                disabled={!!busy}
                onClick={() => run(f.key, f.go)}
                className={btn}
                title={f.hint}
              >
                {busy === f.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 text-neutral-500" />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {variants.length > 0 && (
        <div>
          <p className={groupLabel}>Ready to download</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => downloadVariant(v)}
                className={btn}
              >
                <Download className="h-4 w-4 text-neutral-500" />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {canManufacture && (
        <div>
          <p className={groupLabel}>Manufacture · production files</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={stickerOfferHref(locale, imageUrl)}
              onClick={() => tracking && trackAction(tracking, "click")}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-purple-100"
            >
              <Scissors className="h-4 w-4 text-purple-700" />
              Die-cut sticker file
              <span className="font-bold text-purple-800">
                {usd(STICKER_EXPORT_CREDITS)}
              </span>
            </a>
            <a
              href={acrylicOfferHref(locale, imageUrl)}
              onClick={() => tracking && trackAction(tracking, "click")}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-purple-100"
            >
              <Package className="h-4 w-4 text-purple-700" />
              Acrylic charm
              <span className="font-bold text-purple-800">
                {usd(ACRYLIC_EXPORT_CREDITS)}
              </span>
            </a>
          </div>
        </div>
      )}

      {note && <p className="text-xs text-neutral-500">{note}</p>}
    </div>
  );
}
