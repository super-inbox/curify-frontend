"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Loader2, Plus, Wand2, Download } from "lucide-react";
import { userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { productVideoService } from "@/services/productVideo";
import { useTracking } from "@/services/useTracking";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;
const CREDITS_COST = 30;
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 240_000; // 4-min ceiling (render + upload)

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Functional product-video tool surface for /tools/product-video. Structured
 * input: 1–3+ product photos (reuse ReferenceImageUpload, which self-gates the
 * upload behind sign-in) + title / features / price / CTA. Submits to the
 * backend PRODUCT_VIDEO job and polls /projects/{id}/status for the mp4.
 */
export default function ProductVideoGenerate() {
  const rawUser = useAtomValue(userAtom);
  const clientMounted = useAtomValue(clientMountedAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const user = clientMounted ? rawUser : null;
  const { track } = useTracking();

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false]);
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice] = useState("");
  const [cta, setCta] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageUrls = photos.filter((p): p is string => !!p);
  const anyUploading = uploadingSlots.some(Boolean);
  const canGenerate =
    imageUrls.length >= MIN_PHOTOS && productName.trim().length > 0 && !isGenerating && !anyUploading;

  const setPhoto = (i: number, url: string | null) =>
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? url : p)));
  const setSlotUploading = (i: number, v: boolean) =>
    setUploadingSlots((prev) => prev.map((u, idx) => (idx === i ? v : u)));
  const addSlot = () => {
    if (photos.length >= MAX_PHOTOS) return;
    setPhotos((prev) => [...prev, null]);
    setUploadingSlots((prev) => [...prev, false]);
  };

  const poll = async (projectId: string): Promise<string> => {
    const deadline = Date.now() + POLL_MAX_MS;
    await sleep(2000);
    while (Date.now() < deadline) {
      let st;
      try {
        st = await productVideoService.getStatus(projectId);
      } catch {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      const s = (st.status || "").toUpperCase();
      if (s === "COMPLETED" && st.result_url) return st.result_url;
      if (s === "FAILED") throw new Error(st.failure_reason || "Video generation failed. Please try again.");
      await sleep(POLL_INTERVAL_MS);
    }
    throw new Error("This is taking longer than usual — check your workspace in a moment.");
  };

  const handleGenerate = async () => {
    if (!user) {
      setDrawer("signin");
      return;
    }
    if (!canGenerate) return;
    setError(null);
    setResultUrl(null);
    setIsGenerating(true);
    setProgress("Planning your video…");
    try {
      track({ contentId: "product-video:generate", contentType: "tool_card", actionType: "generate" });
      const res = await productVideoService.generate({
        image_urls: imageUrls,
        product_name: productName.trim(),
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
        price: price.trim(),
        cta: cta.trim(),
      });
      if (!res.success || !res.project_id) {
        throw new Error(res.message || "Couldn't start generation.");
      }
      setProgress("Rendering your video — this usually takes 30–60 seconds…");
      const url = await poll(res.project_id);
      setResultUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const fieldCls =
    "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200";

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm">
      {/* Photos */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700">
          Product photos <span className="text-purple-600">*</span>
          <span className="ml-1 font-normal text-neutral-400">(at least {MIN_PHOTOS})</span>
        </span>
        <span className="text-[11px] text-neutral-400">{imageUrls.length}/{photos.length} added</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((_, i) => (
          <ReferenceImageUpload
            key={i}
            variant="compact"
            required={i < MIN_PHOTOS}
            label={`Photo ${i + 1}`}
            signInLabel="Sign in to add photos"
            onChange={(url) => setPhoto(i, url)}
            onUploadingChange={(u) => setSlotUploading(i, u)}
            onRemove={() => setPhoto(i, null)}
          />
        ))}
      </div>
      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={addSlot}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
        >
          <Plus className="h-3.5 w-3.5" /> Add another photo
        </button>
      )}

      {/* Details */}
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">
            Product name <span className="text-purple-600">*</span>
          </label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Premium Wireless Headphones"
            className={fieldCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">
            Key features <span className="font-normal text-neutral-400">(one per line)</span>
          </label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={3}
            placeholder={"Active noise cancellation\n30-hour battery\nComfort-fit design"}
            className={fieldCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$199" className={fieldCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">Call to action</label>
            <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Shop Now" className={fieldCls} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!!user && !canGenerate}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2.5 font-bold text-white shadow-lg transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {isGenerating ? "Generating…" : "Generate product video"}
        {clientMounted && !user && <span className="ml-1 text-xs opacity-80">🔒</span>}
        {clientMounted && user && <span className="ml-1 text-xs opacity-80">· {CREDITS_COST} credits</span>}
      </button>

      {!user && clientMounted && (
        <p className="mt-1.5 text-center text-[11px] text-neutral-500">Sign in to generate — free to start.</p>
      )}
      {user && !canGenerate && !isGenerating && (
        <p className="mt-1.5 text-center text-[11px] text-neutral-500">
          Add at least {MIN_PHOTOS} photos and a product name to generate.
        </p>
      )}

      {progress && (
        <p className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
          <Loader2 className="h-4 w-4 animate-spin" /> {progress}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {resultUrl && (
        <div className="mt-5">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={resultUrl} controls className="mx-auto max-h-[420px] w-auto rounded-2xl border border-neutral-200" />
          <a
            href={resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-center font-semibold text-purple-700 transition-colors hover:bg-purple-100"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      )}
    </div>
  );
}
