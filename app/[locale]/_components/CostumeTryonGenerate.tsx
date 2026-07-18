"use client";

import { useRef, useState } from "react";
import { Loader2, Upload as UploadIcon, Wand2, Download, Share2, X } from "lucide-react";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import { costumeTryonService } from "@/services/costumeTryon";
import { useTracking } from "@/services/useTracking";

// 3 pre-rendered demo clips (9:16). CdnVideo rewrites these relative /video
// paths to the CDN host. Muted + loop so the row auto-plays as an eye-catcher.
const DEMO_VIDEOS = [
  "/video/costume_tryon/haaland_male_dynasty_tryon.mp4",
  "/video/costume_tryon/haaland_female_dynasty_tryon.mp4",
  "/video/costume_tryon/bellingham_male_dynasty_tryon.mp4",
];

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Anonymous "Chinese costume try-on" video generator for
 * /tools/chinese-costume-tryon. Upload one photo → cinematic dynasty-costume
 * transformation video. NO sign-in required: the raw File is posted straight to
 * /costume-tryon/generate (multipart), bypassing the auth-gated /images/upload
 * flow — so we use a plain file input here instead of the shared
 * ReferenceImageUpload (which gates anon users behind a sign-in CTA).
 */
export default function CostumeTryonGenerate() {
  const { track } = useTracking();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const emailedNotice = email.trim().length > 0;
  const canGenerate = !!file && !isGenerating;

  const onPickFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("That image is over 15MB — please choose a smaller photo.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl(null);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!canGenerate || !file) return;
    setError(null);
    setResultUrl(null);
    setIsGenerating(true);
    setProgress("Dressing you in dynasty silk… this usually takes 1–2 minutes.");
    try {
      track({
        contentId: "chinese-costume-tryon:generate",
        contentType: "tool_card",
        actionType: "generate",
      });
      const res = await costumeTryonService.generate({
        file,
        gender,
        email: email.trim() || undefined,
      });
      // The anon /costume-tryon/generate endpoint returns { project_id } (no
      // `success` flag) — gate on project_id, not a success field that isn't sent.
      if (!res.project_id) {
        throw new Error(res.message || "Couldn't start your costume video.");
      }
      const url = await costumeTryonService.pollResult(res.project_id);
      setResultUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Costume video generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My Chinese dynasty costume video",
          text: "I tried on 5,000 years of Chinese fashion with Curify AI ✨",
          url: resultUrl,
        });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(resultUrl);
      alert("Link copied to clipboard!");
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const genderBtn = (value: "male" | "female", label: string) => (
    <button
      type="button"
      onClick={() => setGender(value)}
      aria-pressed={gender === value}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        gender === value
          ? "bg-white text-purple-700 shadow-sm"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl text-left">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[var(--c1)] sm:text-3xl">
          Try on 5,000 years of Chinese fashion
        </h2>
        <p className="mt-2 text-base text-neutral-600">
          Upload one photo → get a cinematic dynasty-costume transformation video.
        </p>
      </div>

      {/* Demo videos — 9:16, muted/loop autoplay row */}
      <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-4">
        {DEMO_VIDEOS.map((src) => (
          <CdnVideo
            key={src}
            src={src}
            className="aspect-[9/16] w-full rounded-xl border border-neutral-200 bg-black object-cover shadow-sm"
            muted
            loop
            playsInline
            controls
            autoPlay
          />
        ))}
      </div>

      {/* Generator panel — anonymous, no sign-in required */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        {/* Photo picker */}
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          Your photo <span className="text-purple-600">*</span>
        </label>
        {previewUrl ? (
          <div className="relative inline-block overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Your upload" className="block max-h-48 w-auto object-contain" />
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragging) setDragging(true);
            }}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onPickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors ${
              dragging
                ? "border-purple-500 bg-purple-100 ring-2 ring-purple-300"
                : "border-purple-300 bg-purple-50/50 hover:bg-purple-50"
            }`}
          >
            <UploadIcon className="h-6 w-6 text-purple-500" />
            <span className="text-sm font-semibold text-purple-700">
              {dragging ? "Drop your photo to start" : "Upload or drop a portrait photo"}
            </span>
            <span className="text-xs text-neutral-500">Free — no sign-in needed. JPG or PNG, up to 15MB.</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />

        {/* Gender toggle */}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-neutral-700">Costume style</label>
          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
            {genderBtn("female", "Female 👘")}
            {genderBtn("male", "Male 🀄")}
          </div>
        </div>

        {/* Optional email */}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
            Email me my video <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-3 font-bold text-white shadow-lg transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isGenerating ? "Generating…" : "Generate my costume video"}
        </button>
        {!file && (
          <p className="mt-1.5 text-center text-[11px] text-neutral-500">
            Upload a photo to get started — it&apos;s free.
          </p>
        )}

        {progress && (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
            <Loader2 className="h-4 w-4 animate-spin" /> {progress}
          </p>
        )}
        {progress && emailedNotice && (
          <p className="mt-2 text-center text-[11px] text-neutral-500">
            We&apos;ll also email it to you when it&apos;s ready.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {resultUrl && (
          <div className="mt-6">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={resultUrl}
              controls
              autoPlay
              loop
              playsInline
              className="mx-auto aspect-[9/16] max-h-[520px] w-auto rounded-2xl border border-neutral-200 bg-black"
            />
            <div className="mt-3 flex gap-2">
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 text-center font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Download
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-center font-semibold text-purple-700 transition-colors hover:bg-purple-100"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            {emailedNotice && (
              <p className="mt-2 text-center text-[11px] text-neutral-500">
                We&apos;ll email it to you too.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
