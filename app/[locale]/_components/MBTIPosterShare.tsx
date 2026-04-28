"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import type { MBTIType } from "@/lib/mbti-meta";
import { MBTI_META } from "@/lib/mbti-meta";
import { useTracking } from "@/services/useTracking";

const CAPTIONS: Record<string, string> = {
  INTJ: "Rare. Strategic. Always 10 steps ahead. 🧠",
  INTP: "The mind that never stops asking 'but why?' 🔍",
  ENTJ: "Born to lead, built to win. 🚀",
  ENTP: "I don't argue — I upgrade the conversation. ⚡",
  INFJ: "The rarest type. Vision meets empathy. 🌟",
  INFP: "Small in noise. Large in impact. 🌙",
  ENFJ: "The one who makes everyone feel seen. ✨",
  ENFP: "Pure energy. Infinite ideas. Zero boring days. 🌈",
  ISTJ: "Reliable. Precise. Absolutely unshakeable. 🏔",
  ISFJ: "The quiet force that holds everything together. 🛡",
  ESTJ: "Gets things done. Every single time. 📋",
  ESFJ: "The person everyone calls when things go wrong. 💛",
  ISTP: "Cool head. Sharp hands. Zero drama. 🔧",
  ISFP: "Living art. Feeling everything. Sharing beauty. 🎨",
  ESTP: "Born for the moment. Thrives in the chaos. 🔥",
  ESFP: "The reason the room lights up. 🎉",
};

export default function MBTIPosterShare({ mbti, locale }: { mbti: MBTIType; locale: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [name, setName] = useState("");
  const { track } = useTracking();

  const meta = MBTI_META[mbti];
  const namePrefix = name.trim() ? `${name.trim()} got` : "I got";
  const caption = `${namePrefix} ${mbti} — ${meta.tagline}!\n\n${CAPTIONS[mbti] ?? ""}\n\nFind out your personality type 👉 curify.ai/${locale}/personality/${mbti}`;

  const handleShare = async () => {
    setStatus("loading");
    track({ contentId: mbti, contentType: "mbti_quiz", actionType: "share" });

    try {
      const nameParam = name.trim() ? `&name=${encodeURIComponent(name.trim())}` : "";
      const res = await fetch(`/api/personality-poster?type=${mbti}${nameParam}`);
      if (!res.ok) throw new Error(`Poster API returned ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `${mbti}-personality.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `I'm ${mbti} — ${meta.tagline}`, text: caption });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mbti}-personality-card.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const previewUrl = name.trim()
    ? `/api/personality-poster?type=${mbti}&name=${encodeURIComponent(name.trim())}`
    : `/api/personality-poster?type=${mbti}`;

  return (
    <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50/60 p-4">
      {/* Poster preview + name input row */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Your personality poster"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800 mb-1.5">Your shareable poster is ready</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add your name (optional)"
            maxLength={30}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        disabled={status === "loading"}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
      >
        {status === "loading" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
        ) : status === "done" ? (
          <><Download className="h-4 w-4" /> Saved!</>
        ) : status === "error" ? (
          <>Failed — try again</>
        ) : (
          <><ImageIcon className="h-4 w-4" /> Save &amp; Share Poster</>
        )}
      </button>

      <p className="mt-2 text-center text-[11px] text-neutral-400">
        Caption is pre-written — just paste &amp; post
      </p>
    </div>
  );
}
