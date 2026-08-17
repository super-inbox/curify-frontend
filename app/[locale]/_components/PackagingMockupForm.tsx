"use client";

/**
 * Self-serve dieline → 3D packaging mockup.
 *
 * W×H×D are REQUIRED, not optional. The model invents the fold when the
 * proportion is unstated and defaults to a near-cube — the 仁寿 carton
 * (117×114×39, a flat 3:3:1 box) came back cubic until the ratio was written
 * into the prompt. See docs/packaging-mockup-pipeline.md.
 *
 * ⚠️ Depth is the one people get wrong: it is the narrow END panel's short
 * side, not half the box. The hint says so rather than assuming.
 */
import { useState } from "react";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { useFactoryExport } from "@/services/useFactoryExport";
import { factoryExportService, PACKAGING_MOCKUP_CREDITS } from "@/services/factoryExport";

export default function PackagingMockupForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [w, setW] = useState(117);
  const [h, setH] = useState(114);
  const [d, setD] = useState(39);
  const [angle, setAngle] = useState<"45" | "front">("45");
  const { phase, error, resultUrl, busy, start } = useFactoryExport();

  const ok = [w, h, d].every((v) => v > 0 && v <= 2000);

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-bold text-neutral-900">Fold your dieline into a 3D box</p>
        <p className="text-sm font-semibold text-purple-800">{PACKAGING_MOCKUP_CREDITS} credits</p>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Upload the flat dieline and give the real box size. The proportions come from your
        numbers, not from a guess — that is the difference between your box and a generic cube.
      </p>

      <div className="mt-4">
        <ReferenceImageUpload
          variant="full"
          label="Dieline"
          // Honest about the current limit rather than letting a .ai upload fail
          // silently: the image upload path does not accept vector files yet.
          hint="Rasterized dieline (PNG/JPG) for now — .ai and PDF upload is not supported yet."
          replaceLabel="Replace"
          signInLabel="Sign in to upload a dieline"
          onChange={(blobUrl: string | null) => setImageUrl(blobUrl)}
          onUploadingChange={setUploading}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {([
          ["Width (mm)", w, setW, ""],
          ["Height (mm)", h, setH, ""],
          ["Depth (mm)", d, setD, "the narrow end panel's short side"],
        ] as const).map(([label, val, set, note]) => (
          <label key={label} className="block">
            <span className="text-xs font-semibold text-neutral-700">{label}</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400"
            />
            {note && <span className="mt-1 block text-[11px] text-neutral-500">{note}</span>}
          </label>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        {(["45", "front"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAngle(a)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
              angle === a
                ? "border-purple-400 bg-purple-50 text-purple-800"
                : "border-neutral-200 text-neutral-700"
            }`}
          >
            {a === "45" ? "45° three-quarter" : "Front-on"}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!imageUrl || uploading || busy || !ok}
        onClick={() =>
          void start(() =>
            factoryExportService.packagingMockup({
              image_url: imageUrl!,
              w_mm: w,
              h_mm: h,
              d_mm: d,
              angle,
            }),
          )
        }
        className="mt-4 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
      >
        {busy ? "Folding the box…" : `Make the mockup · ${PACKAGING_MOCKUP_CREDITS} credits`}
      </button>
      <p className="mt-2 text-xs text-neutral-500">
        Nothing is charged until the image exists — a failed run costs nothing.
      </p>

      {busy && <p className="mt-3 text-sm text-neutral-600">Rendering the folded box…</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {phase === "done" && resultUrl && (
        <a href={resultUrl} className="mt-3 inline-block rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white">
          Download mockup →
        </a>
      )}
      {phase === "done" && !resultUrl && (
        <p className="mt-3 text-sm text-neutral-600">Done — the image is in your workspace.</p>
      )}
    </div>
  );
}
