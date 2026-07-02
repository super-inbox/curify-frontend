"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import { useClickTracking, useTracking } from "@/services/useTracking";
import {
  WC_2026_BRACKET,
  FLAG,
  buildDefaultPicks,
  sanitizePicks,
  setPick,
  pairFor,
  championName,
  R16_OFFSET,
  QF_OFFSET,
  SF_OFFSET,
  F_OFFSET,
  type BracketSide,
} from "@/lib/wc_bracket_2026";

// Interactive WC 2026 bracket picker (dark theme, relaxed width).
//
// State: 31-char picks string (H/A/? per game) synced to ?p= query param.
// Picks propagate: R32 winners feed R16 pairs, etc. Locked (real-world)
// R32 results can't be overridden.
//
// Share: fetches /api/wc-bracket-poster?p=<picks> to build a 1080x1920
// watermarked PNG (same pattern as MBTIPosterShare), wraps as a File,
// hands to navigator.share on mobile / anchor download on desktop.

function TeamButton({
  name,
  onClick,
  picked,
  disabled,
  locked,
}: {
  name: string | null;
  onClick?: () => void;
  picked: boolean;
  disabled?: boolean;
  locked?: boolean;
}) {
  const isEmpty = !name;
  const cls = [
    "w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] sm:text-[13px] transition-all border",
    isEmpty
      ? "border-dashed border-white/10 bg-white/[0.02] text-white/30 cursor-default"
      : picked
        ? locked
          ? "border-emerald-400 bg-emerald-500/25 text-white font-bold shadow-inner shadow-emerald-950/40"
          : "border-emerald-400 bg-emerald-500/20 text-white font-semibold shadow-sm"
        : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/60 hover:bg-emerald-500/10 hover:text-white",
    disabled || locked ? "cursor-default" : "cursor-pointer",
  ].join(" ");
  return (
    <button
      type="button"
      onClick={disabled || locked ? undefined : onClick}
      className={cls}
      aria-pressed={picked}
      aria-disabled={disabled || locked}
    >
      <span aria-hidden className="text-base shrink-0 leading-none">
        {name ? FLAG[name] ?? "" : "·"}
      </span>
      <span className="truncate">{name ?? "TBD"}</span>
      {locked && picked ? (
        <span aria-hidden className="ml-auto text-emerald-300 shrink-0 text-[11px]">✓</span>
      ) : null}
    </button>
  );
}

function GameCell({
  home,
  away,
  onPick,
  homePicked,
  awayPicked,
  locked,
  meta,
}: {
  home: string | null;
  away: string | null;
  onPick?: (side: BracketSide) => void;
  homePicked: boolean;
  awayPicked: boolean;
  locked?: boolean;
  meta?: string;
}) {
  return (
    <div className={[
      "flex flex-col gap-1 rounded-lg p-1.5 border",
      locked ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-white/10 bg-white/[0.04]",
    ].join(" ")}>
      {meta ? (
        <div className="text-[10px] font-mono text-slate-400 leading-none">{meta}</div>
      ) : null}
      <TeamButton
        name={home}
        onClick={() => onPick?.("home")}
        picked={homePicked}
        disabled={!home}
        locked={locked}
      />
      <TeamButton
        name={away}
        onClick={() => onPick?.("away")}
        picked={awayPicked}
        disabled={!away}
        locked={locked}
      />
    </div>
  );
}

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="text-center text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
      {label}
    </div>
  );
}

export default function BracketClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialPicks = useMemo(() => sanitizePicks(searchParams.get("p")), [searchParams]);
  const [picks, setPicks] = useState<string>(initialPicks);
  const [name, setName] = useState<string>("");
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "done">("idle");

  const { track } = useTracking();

  // Push picks to URL (replace, not push, so back-button behavior stays sane)
  useEffect(() => {
    const defaults = buildDefaultPicks();
    const isDefault = picks === defaults;
    const params = new URLSearchParams(searchParams.toString());
    if (isDefault) params.delete("p");
    else params.set("p", picks);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks]);

  const trackReset = useClickTracking("wc-bracket:reset", "topic_capsule", "cards");
  const trackClearPending = useClickTracking("wc-bracket:clear-pending", "topic_capsule", "cards");

  const handleR32 = useCallback((slot: number, side: BracketSide) => {
    setPicks((p) => setPick(p, "r32", slot, side));
  }, []);
  const handleR16 = useCallback((slot: number, side: BracketSide) => {
    setPicks((p) => setPick(p, "r16", slot, side));
  }, []);
  const handleQF = useCallback((slot: number, side: BracketSide) => {
    setPicks((p) => setPick(p, "qf", slot, side));
  }, []);
  const handleSF = useCallback((slot: number, side: BracketSide) => {
    setPicks((p) => setPick(p, "sf", slot, side));
  }, []);
  const handleF = useCallback((side: BracketSide) => {
    setPicks((p) => setPick(p, "f", 0, side));
  }, []);

  const champ = championName(picks);

  const posterUrl = useMemo(() => {
    const qs = new URLSearchParams();
    if (picks !== buildDefaultPicks()) qs.set("p", picks);
    if (name.trim()) qs.set("name", name.trim());
    const suffix = qs.toString();
    return `/api/wc-bracket-poster${suffix ? `?${suffix}` : ""}`;
  }, [picks, name]);

  const handleShare = useCallback(async () => {
    const shareText = champ
      ? `${name.trim() ? `${name.trim()}'s` : "My"} World Cup 2026 bracket — I've got ${FLAG[champ] ?? ""} ${champ} winning it all. Fill yours → curify.ai/wc-bracket`
      : `Fill out your 2026 World Cup bracket → curify.ai/wc-bracket`;

    // Mobile: native share sheet with a File (poster PNG)
    if (typeof navigator !== "undefined" && (navigator as { canShare?: unknown }).canShare) {
      setShareStatus("loading");
      try {
        const res = await fetch(posterUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const file = new File([blob], "my-wc-bracket.png", { type: "image/png" });
        const canShareFiles = (navigator as { canShare: (data: unknown) => boolean }).canShare({ files: [file] });
        if (canShareFiles) {
          await (navigator as { share: (data: unknown) => Promise<void> }).share({
            files: [file],
            title: "My World Cup 2026 bracket",
            text: shareText,
          });
          track({ contentId: picks, contentType: "page", actionType: "share" });
          setShareStatus("done");
          setTimeout(() => setShareStatus("idle"), 2500);
          return;
        }
      } catch {
        // fall through to anchor download
      }
    }

    // Desktop / fallback: anchor download
    track({ contentId: picks, contentType: "page", actionType: "download" });
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = "my-wc-bracket.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShareStatus("done");
    setTimeout(() => setShareStatus("idle"), 2500);
  }, [champ, name, picks, posterUrl, track]);

  const handleReset = useCallback(() => {
    trackReset();
    setPicks(buildDefaultPicks());
  }, [trackReset]);

  const handleClearPending = useCallback(() => {
    trackClearPending();
    setPicks((p) => {
      const chars = p.split("");
      WC_2026_BRACKET.r32.forEach((g, i) => {
        if (g.result === null) chars[i] = "?";
      });
      for (let i = R16_OFFSET; i < 31; i++) chars[i] = "?";
      return chars.join("");
    });
  }, [trackClearPending]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
          <span aria-hidden>⚽</span>
          <span>FIFA World Cup 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Fill your bracket.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
          Tap a team to send them through — winners auto-advance. Real R32 results are locked ✓; the rest is your call. Share your final bracket as a poster in one tap.
        </p>
      </header>

      {/* Champion banner */}
      <div className="mb-5 sm:mb-6 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/5 p-4 sm:p-5 shadow-lg shadow-amber-950/30 backdrop-blur-sm">
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-amber-300">
          Your champion
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-2xl sm:text-4xl font-black text-white">
          {champ ? (
            <>
              <span aria-hidden className="text-3xl sm:text-5xl">{FLAG[champ] ?? "🏆"}</span>
              <span>{champ}</span>
              <span aria-hidden className="ml-1 text-2xl sm:text-3xl">🏆</span>
            </>
          ) : (
            <span className="text-slate-400 text-lg sm:text-xl font-semibold">
              Pick your way through to crown a champion
            </span>
          )}
        </div>
      </div>

      {/* Bracket grid */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-emerald-950/30 p-3 sm:p-5 shadow-xl shadow-emerald-950/40 backdrop-blur">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          <ColumnHeader label={WC_2026_BRACKET.labels.r32} />
          <ColumnHeader label={WC_2026_BRACKET.labels.r16} />
          <ColumnHeader label={WC_2026_BRACKET.labels.qf} />
          <ColumnHeader label={WC_2026_BRACKET.labels.sf} />
          <ColumnHeader label={WC_2026_BRACKET.labels.f} />
        </div>

        <div className="mt-2 grid grid-cols-5 gap-2 sm:gap-3 auto-rows-[minmax(0,1fr)]">
          {/* R32 column */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {WC_2026_BRACKET.r32.map((g, i) => (
              <GameCell
                key={`r32-${i}`}
                home={g.home}
                away={g.away}
                homePicked={picks[i] === "H"}
                awayPicked={picks[i] === "A"}
                onPick={(side) => handleR32(i, side)}
                locked={g.result !== null}
                meta={`${g.date} · ${g.time}`}
              />
            ))}
          </div>

          {/* R16 */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {Array.from({ length: 8 }, (_, s) => {
              const [h, a] = pairFor("r16", s, picks);
              return (
                <div key={`r16-${s}`} className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={picks[R16_OFFSET + s] === "H"}
                    awayPicked={picks[R16_OFFSET + s] === "A"}
                    onPick={(side) => handleR16(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* QF */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {Array.from({ length: 4 }, (_, s) => {
              const [h, a] = pairFor("qf", s, picks);
              return (
                <div key={`qf-${s}`} className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={picks[QF_OFFSET + s] === "H"}
                    awayPicked={picks[QF_OFFSET + s] === "A"}
                    onPick={(side) => handleQF(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* SF */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {Array.from({ length: 2 }, (_, s) => {
              const [h, a] = pairFor("sf", s, picks);
              return (
                <div key={`sf-${s}`} className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={picks[SF_OFFSET + s] === "H"}
                    awayPicked={picks[SF_OFFSET + s] === "A"}
                    onPick={(side) => handleSF(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* Final */}
          <div className="flex flex-col">
            {(() => {
              const [h, a] = pairFor("f", 0, picks);
              return (
                <div className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={picks[F_OFFSET] === "H"}
                    awayPicked={picks[F_OFFSET] === "A"}
                    onPick={handleF}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
              Add your name to the poster
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional — leave blank for &quot;My bracket&quot;"
              maxLength={30}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>

          <button
            type="button"
            onClick={handleShare}
            disabled={shareStatus === "loading"}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40 transition-all hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60"
          >
            {shareStatus === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Preparing…</>
            ) : shareStatus === "done" ? (
              <><Download className="h-4 w-4" /> Ready!</>
            ) : (
              <><ImageIcon className="h-4 w-4" /> Share as poster</>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClearPending}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white focus:outline-none"
          >
            Clear my picks
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white focus:outline-none"
            title="Reset to real R32 results only, everything else blank"
          >
            Reset
          </button>
          <span className="text-[11px] text-slate-500 ml-auto">
            R32 results reflect data through {new Date().toISOString().slice(0, 10)} · Locale: {locale}
          </span>
        </div>
      </div>
    </div>
  );
}
