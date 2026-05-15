"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { etsyPacksService } from "@/services/etsyPacks";

type Props = {
  sku: string;
  /** Per-listing attribution code from the ?c= query param. Passed
   * through to the server for analytics; not used for auth. */
  code?: string | null;
  /** Per-SKU secret from the ?t= query param when the registry entry
   * has a non-null `secret`. Backend verifies. */
  token?: string | null;
};

export default function DownloadButton({ sku, code, token }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleClick() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await etsyPacksService.getDownloadUrl(sku, { code, token });
      // Navigate directly — Azure serves the zip with
      // Content-Disposition: attachment so the browser saves rather
      // than rendering. Using window.location.href (not _blank) so
      // popup blockers don't interfere.
      window.location.href = res.signed_url;
      // Re-arm the button in case the user wants to re-download.
      setTimeout(() => setState("idle"), 2000);
    } catch (err: any) {
      console.error("[etsy-pack-download]", err);
      setState("error");
      setErrorMsg(
        err?.message?.includes("429")
          ? "Too many download attempts. Please wait a few minutes and try again."
          : "Could not fetch download link. Please try again or contact support."
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center gap-3 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing your download…
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download your pack
          </>
        )}
      </button>
      {state === "error" && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
