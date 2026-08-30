"use client";

/**
 * Self-serve die-cut sticker factory export.
 *
 * First surface that actually calls POST /design-tools/*. The three factory
 * pipelines have shipped with credit gating and endpoints for days while every
 * tool card routed to a contact form, so the backend was finished and
 * unreachable.
 *
 * Two rules carried over from the workflow-entry audit:
 *  - the price is stated BEFORE the click, not discovered after (a spend must
 *    never be a surprise);
 *  - nothing is dispatched until the user presses the button — arriving on the
 *    page spends nothing.
 */
import { useCallback, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import {
  factoryExportService,
  STICKER_EXPORT_CREDITS,
  USD_PER_CREDIT,
} from "@/services/factoryExport";

type Phase = "idle" | "running" | "done" | "failed";

const POLL_MS = 4000;
const MAX_POLLS = 75; // ~5 min: tracing + CMYK convert is CPU-bound, not instant

type Props = {
  /** Already-generated image handed off from a result surface — see
   *  lib/physical_product_offer.ts. Skips the upload step so the user is not
   *  asked to re-upload artwork they just made here. */
  presetImageUrl?: string | null;
};

export default function StickerExportForm({ presetImageUrl }: Props = {}) {
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);

  const [imageUrl, setImageUrl] = useState<string | null>(presetImageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [mm, setMm] = useState(60);
  const [cutMm, setCutMm] = useState(3);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const pollRef = useRef<number>(0);

  const run = useCallback(async () => {
    if (!imageUrl) return;
    if (!user) {
      setDrawer("signin");
      return;
    }
    setPhase("running");
    setError(null);
    setZipUrl(null);
    pollRef.current = 0;

    let projectId: string | undefined;
    try {
      const res = await factoryExportService.stickerExport({
        image_url: imageUrl,
        mm,
        cut_mm: cutMm,
      });
      projectId = res.project_id;
      if (!res.success || !projectId) throw new Error(res.message || "Could not start the export.");
    } catch (e) {
      // Backend rejects insufficient credits and out-of-range sizes BEFORE
      // creating a project, so this message is actionable rather than generic.
      setPhase("failed");
      setError(e instanceof Error ? e.message : "Could not start the export.");
      return;
    }

    const tick = async () => {
      pollRef.current += 1;
      try {
        const st = await factoryExportService.getProjectStatus(projectId!);
        if (st.status === "COMPLETED") {
          setZipUrl(st.result_url ?? null);
          setPhase("done");
          return;
        }
        if (st.status === "FAILED") {
          setPhase("failed");
          setError(st.failure_reason || "The export failed. Try a PNG with a clear subject.");
          return;
        }
      } catch {
        /* transient — keep polling until the cap */
      }
      if (pollRef.current >= MAX_POLLS) {
        setPhase("failed");
        // The job may still finish server-side; say so instead of implying loss.
        setError("Still running — check your workspace in a minute; the job continues server-side.");
        return;
      }
      window.setTimeout(tick, POLL_MS);
    };
    window.setTimeout(tick, POLL_MS);
  }, [imageUrl, user, setDrawer, mm, cutMm]);

  const busy = phase === "running";

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-bold text-neutral-900">Make the production files</p>
        {/* Lead with dollars. A credit count means nothing to someone holding a
            printer's quote; the dollar figure is the number they compare against
            the $50-150 a printer charges to prep the same file. Credits stay
            visible because credits are what actually get deducted. Both are
            derived from lib/pricing.ts, so neither goes stale on a reprice — the
            prose here deliberately names no figure for the same reason. */}
        <p className="text-sm font-semibold text-purple-800">
          ${(STICKER_EXPORT_CREDITS * USD_PER_CREDIT).toFixed(0)}
          <span className="ml-1.5 font-medium text-neutral-500">
            ({STICKER_EXPORT_CREDITS} credits)
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Upload artwork with a clear subject. You get 300&nbsp;DPI transparent art, a die-cut
        line, a CMYK PDF, a preview and a spec sheet — as one zip. Files a factory
        accepts as-is; most printers charge $50–150 to prepare the same thing.
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Production files aren&apos;t covered by free signup credits.
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Longest side (mm)</span>
          <input
            type="number"
            min={10}
            max={500}
            value={mm}
            onChange={(e) => setMm(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Cut offset (mm)</span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={cutMm}
            onChange={(e) => setCutMm(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={!imageUrl || uploading || busy || mm < 10 || mm > 500}
        onClick={() => void run()}
        className="mt-4 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
      >
        {busy
          ? "Building files…"
          : `Export factory files · $${(STICKER_EXPORT_CREDITS * USD_PER_CREDIT).toFixed(0)}`}
      </button>
      <p className="mt-2 text-xs text-neutral-500">
        Nothing is charged until the files exist — a failed run costs nothing.
      </p>

      {phase === "running" && (
        <p className="mt-3 text-sm text-neutral-600">
          Tracing the cutline and converting to CMYK. This takes up to a minute.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {phase === "done" && zipUrl && (
        <a
          href={zipUrl}
          className="mt-3 inline-block rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white"
        >
          Download production zip →
        </a>
      )}
      {phase === "done" && !zipUrl && (
        <p className="mt-3 text-sm text-neutral-600">
          Done — the files are in your workspace.
        </p>
      )}
    </div>
  );
}
