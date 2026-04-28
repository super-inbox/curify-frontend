"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Check, Lock, Sparkles } from "lucide-react";
import { useAtom } from "jotai";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import type { CharCard } from "@/lib/mbti-data";

export default function PersonalityResultClient({
  mbti,
  locale,
  chars,
}: {
  mbti: string;
  locale: string;
  chars: CharCard[];
}) {
  const [user] = useAtom(userAtom);
  const [, setDrawer] = useAtom(drawerAtom);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerate = (slug: string) => {
    if (!user) { setDrawer("signin"); return; }
    window.open(`/${locale}/nano-template/${slug}`, "_blank");
  };

  const ips = [...new Set(chars.map((c) => c.ip))].slice(0, 4);

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 space-y-4">
      {/* Generate CTA */}
      <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-700">
          {user ? `Generate your ${mbti} card in any universe →` : `Unlock your ${mbti} character card →`}
        </p>
        <div className="flex flex-wrap gap-2">
          {ips.map((ip) => {
            const char = chars.find((c) => c.ip === ip)!;
            return (
              <button
                key={ip}
                type="button"
                onClick={() => handleGenerate(char.templateSlug)}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-purple-300 hover:text-purple-700 transition-colors"
              >
                {!user && <Lock className="h-3 w-3 text-neutral-400" />}
                {ip}
              </button>
            );
          })}
        </div>
        {!user && (
          <p className="mt-2.5 text-xs text-neutral-400">
            Free account required ·{" "}
            <button
              type="button"
              onClick={() => setDrawer("signin")}
              className="underline hover:text-purple-600"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      {/* Share + retake */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Link copied!" : "Share this result"}
        </button>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-purple-50 hover:text-purple-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Take the quiz
        </Link>
      </div>
    </div>
  );
}
