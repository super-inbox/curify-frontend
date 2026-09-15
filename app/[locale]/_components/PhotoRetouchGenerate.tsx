"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload as UploadIcon, Wand2, Download, X, Check } from "lucide-react";
import { photoRetouchService, PENDING, type RetouchGate } from "@/services/photoRetouch";
import { useTracking } from "@/services/useTracking";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

/**
 * Anonymous photo editing for /tools/wedding-photo-editing. Upload one frame →
 * flyaways removed, skin evened, colour neutralised, framing untouched.
 *
 * Two deliberate choices, both from the 2026-09-15 demand pass:
 *
 * 1. NO SIGN-IN. This page exists because the offer had no inbound surface —
 *    a photographer with the need searched, and found only competitors. A signup
 *    wall in front of the first try rebuilds the wall we are removing.
 * 2. THE BEFORE/AFTER IS PRESS-AND-HOLD, and the gate results are shown. The
 *    buyer's stated acceptance test, in their own words, is "actually edit the
 *    photo, not recreate it" — so the surface has to let them check that, the
 *    way a retoucher checks: toggle the layer and watch what moves.
 */
export default function PhotoRetouchGenerate() {
  const { track } = useTracking();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [gates, setGates] = useState<RetouchGate[] | null>(null);
  const [applied, setApplied] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isGenerating]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canGenerate = !!file && emailValid && !isGenerating;

  const onPickFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("That image is over 25MB — please choose a smaller file.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl(null);
    setGates(null);
    setApplied(null);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setGates(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!canGenerate || !file) return;
    setError(null);
    setPending(false);
    setResultUrl(null);
    setElapsed(0);
    setIsGenerating(true);
    try {
      track({
        contentId: "wedding-photo-editing:generate",
        contentType: "tool_card",
        actionType: "generate",
      });
      const { project_id } = await photoRetouchService.generate({
        file,
        email: email.trim(),
      });
      if (!project_id) throw new Error("Could not start the edit. Please try again.");
      const done = await photoRetouchService.pollResult(project_id);
      setResultUrl(done.result_url ?? null);
      setGates(done.gates ?? null);
      if (done.regions_applied != null && done.regions_planned != null) {
        setApplied([done.regions_applied, done.regions_planned]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (msg === PENDING) setPending(true);
      else setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const mmss = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="mt-8 w-full max-w-3xl mx-auto text-left">
      {/* upload */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onPickFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-[#5a50e5] bg-[#5a50e5]/5" : "border-gray-300 hover:border-[#5a50e5]"
          }`}
        >
          <UploadIcon className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="font-semibold">Drop one photo here, or click to choose</p>
          <p className="text-sm text-gray-500 mt-1">JPG or PNG, up to 25MB. One frame at a time.</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* result on top, original underneath; press and hold to compare */}
          <img
            src={resultUrl && !showingOriginal ? resultUrl : previewUrl}
            alt={resultUrl ? "Edited photo" : "Your photo"}
            className="w-full max-h-[70vh] object-contain select-none"
            draggable={false}
          />
          {resultUrl && (
            <button
              type="button"
              onPointerDown={() => setShowingOriginal(true)}
              onPointerUp={() => setShowingOriginal(false)}
              onPointerLeave={() => setShowingOriginal(false)}
              className="absolute left-3 bottom-3 rounded-md bg-black/70 text-white text-xs font-mono px-3 py-1.5 tracking-wide"
            >
              {showingOriginal ? "ORIGINAL" : "HOLD TO COMPARE"}
            </button>
          )}
          {!isGenerating && (
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove photo"
              className="absolute right-3 top-3 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />

      {/* email + action */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com — we'll send the edited file"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a50e5]/40"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold text-white bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isGenerating ? `Editing… ${mmss}` : "Edit this photo"}
        </button>
      </div>

      {isGenerating && (
        <p className="mt-3 text-sm text-gray-600">
          Retouching runs region by region — flyaways, skin, eyes, garment — so it takes about
          two to three minutes. You can close this tab; the finished file goes to{" "}
          <span className="font-medium">{email.trim()}</span>.
        </p>
      )}

      {pending && (
        <p className="mt-3 text-sm text-amber-700">
          Still working. It is taking longer than usual, but the edit will finish and land in your
          inbox — you can close this tab.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* what was actually done — the buyer's acceptance test is "edit it, don't recreate it" */}
      {resultUrl && (
        <div className="mt-5 rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">
              Done{applied ? ` — ${applied[0]} of ${applied[1]} planned regions edited` : ""}
            </p>
            <a
              href={resultUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-[#5a50e5] text-[#5a50e5] px-4 py-2 text-sm font-semibold hover:bg-[#5a50e5]/5"
            >
              <Download className="w-4 h-4" /> Download full resolution
            </a>
          </div>
          {gates && gates.length > 0 && (
            <>
              <p className="mt-3 text-xs text-gray-500">
                Every edit is checked against the same measurements a studio retoucher would use.
                Your framing, your background and your garments are untouched by construction — only
                the regions listed above were sent to the model.
              </p>
              <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {gates.map((g) => (
                  <li key={g.id} className="flex items-start gap-2 text-xs font-mono">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-none ${g.pass ? "text-emerald-600" : "text-red-500"}`}
                    />
                    <span className={g.pass ? "text-gray-600" : "text-red-600"}>
                      {g.label} — {g.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
