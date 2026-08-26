"use client";

/**
 * Self-serve acrylic standee / keychain factory export.
 *
 * The white-ink plate is the reason this tool exists and the reason the copy
 * leads with it: acrylic is transparent, so colour printed straight onto it
 * reads as a washed tint. Customers do not know they need that plate, and
 * cannot see it — it is white on white.
 */
import { useState } from "react";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { useFactoryExport } from "@/services/useFactoryExport";
import {
  factoryExportService,
  ACRYLIC_EXPORT_CREDITS,
  USD_PER_CREDIT,
} from "@/services/factoryExport";

type Props = {
  /** An already-generated image handed off from elsewhere in the product (see
   *  lib/physical_product_offer.ts). Skips the upload step: making a user download
   *  their own generation and re-upload it is where this handoff would otherwise
   *  die. The backend's _materialize() fetches http(s) URLs as well as bucket
   *  paths, so a signed generation URL works as-is — but signed URLs expire, so
   *  this is a click-now handoff, not a durable link. */
  presetImageUrl?: string | null;
};

export default function AcrylicExportForm({ presetImageUrl }: Props = {}) {
  const [imageUrl, setImageUrl] = useState<string | null>(presetImageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [mm, setMm] = useState(70);
  const [holeMm, setHoleMm] = useState(4);
  const [thickness, setThickness] = useState(3);
  const [wantHole, setWantHole] = useState(true);
  const { phase, error, resultUrl, busy, start } = useFactoryExport();

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-bold text-neutral-900">Make the production files</p>
        <p className="text-sm font-semibold text-purple-800">
          ${(ACRYLIC_EXPORT_CREDITS * USD_PER_CREDIT).toFixed(0)}
          <span className="ml-1.5 font-medium text-neutral-500">
            ({ACRYLIC_EXPORT_CREDITS} credits)
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Front, mirrored back, an opaque white underbase choked 0.25&nbsp;mm so it cannot halo,
        a die cutline with a keychain hole checked against the cut edge, and a spec sheet.
      </p>

      <div className="mt-4">
        {presetImageUrl && imageUrl === presetImageUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={presetImageUrl}
              alt="Your generated artwork"
              className="h-20 w-20 rounded-lg border border-purple-200 bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">
                Using the design you just made
              </p>
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="mt-0.5 text-xs font-medium text-purple-700 underline-offset-2 hover:underline"
              >
                Use a different image
              </button>
            </div>
          </div>
        ) : (
          <ReferenceImageUpload
            variant="full"
            label="Artwork"
            hint="PNG with a transparent or plain background works best."
            replaceLabel="Replace"
            signInLabel="Sign in to upload artwork"
            onChange={(blobUrl: string | null) => setImageUrl(blobUrl)}
            onUploadingChange={setUploading}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Longest side (mm)</span>
          <input type="number" min={10} max={500} value={mm}
            onChange={(e) => setMm(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Thickness (mm)</span>
          <input type="number" min={1} max={10} step={0.5} value={thickness}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Hole ⌀ (mm)</span>
          <input type="number" min={2} max={12} step={0.5} value={holeMm} disabled={!wantHole}
            onChange={(e) => setHoleMm(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400 disabled:bg-neutral-100" />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" checked={wantHole} onChange={() => setWantHole((v) => !v)} />
        Add a keychain hole
        <span className="text-xs text-neutral-500">
          — refused automatically if the piece is too thin to keep a 2&nbsp;mm wall
        </span>
      </label>

      <button
        type="button"
        disabled={!imageUrl || uploading || busy || mm < 10 || mm > 500}
        onClick={() =>
          void start(() =>
            factoryExportService.acrylicExport({
              image_url: imageUrl!,
              mm,
              hole_mm: holeMm,
              thickness_mm: thickness,
              hole: wantHole,
            }),
          )
        }
        className="mt-4 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
      >
        {busy ? "Building files…" : `Export factory files · ${ACRYLIC_EXPORT_CREDITS} credits`}
      </button>
      <p className="mt-2 text-xs text-neutral-500">
        Nothing is charged until the files exist — a failed run costs nothing.
      </p>

      {busy && (
        <p className="mt-3 text-sm text-neutral-600">
          Tracing the cutline, building the white plate and placing the hole.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {phase === "done" && resultUrl && (
        <a href={resultUrl} className="mt-3 inline-block rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white">
          Download production zip →
        </a>
      )}
      {phase === "done" && !resultUrl && (
        <p className="mt-3 text-sm text-neutral-600">Done — the files are in your workspace.</p>
      )}
    </div>
  );
}
