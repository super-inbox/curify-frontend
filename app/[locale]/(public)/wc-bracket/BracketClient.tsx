"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useClickTracking } from "@/services/useTracking";
import {
  WC_2026_BRACKET,
  FLAG,
  buildDefaultPicks,
  sanitizePicks,
  setPick,
  r32WinnerName,
  pairFor,
  r16Winner,
  qfWinner,
  sfWinner,
  championName,
  R16_OFFSET,
  QF_OFFSET,
  SF_OFFSET,
  F_OFFSET,
  type BracketSide,
} from "@/lib/wc_bracket_2026";

// Interactive WC 2026 bracket picker.
//
// State: 31-char picks string (H/A/? per game) synced to ?p= query param.
// Picks propagate: R32 winners feed R16 pairs, etc. Locked (real-world)
// R32 results can't be overridden.
//
// Share: navigator.share on mobile → falls back to clipboard copy on
// desktop or unsupported browsers.

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
    "w-full flex items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] sm:text-[11px] transition-all border",
    isEmpty
      ? "border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 cursor-default"
      : picked
        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-sm"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-emerald-400 hover:bg-emerald-50/50",
    disabled || locked ? "cursor-default" : "cursor-pointer",
    locked && picked ? "border-emerald-600" : "",
  ].join(" ");
  return (
    <button
      type="button"
      onClick={disabled || locked ? undefined : onClick}
      className={cls}
      aria-pressed={picked}
      aria-disabled={disabled || locked}
    >
      <span aria-hidden className="text-sm shrink-0">
        {name ? FLAG[name] ?? "" : "·"}
      </span>
      <span className="truncate">
        {name ?? "TBD"}
      </span>
      {locked && picked ? <span aria-hidden className="ml-auto text-emerald-600 shrink-0">✓</span> : null}
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
    <div className="flex flex-col gap-0.5 rounded-lg border border-neutral-200 bg-white/85 p-1 shadow-sm">
      {meta ? (
        <div className="mb-0.5 text-[9px] font-mono text-neutral-500 leading-none">{meta}</div>
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

export default function BracketClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialPicks = useMemo(() => sanitizePicks(searchParams.get("p")), [searchParams]);
  const [picks, setPicks] = useState<string>(initialPicks);

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
  const trackShare = useClickTracking("wc-bracket:share", "topic_capsule", "cards");
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

  const champion = championName(picks);

  const [shareStatus, setShareStatus] = useState<string>("");
  const handleShare = useCallback(async () => {
    trackShare();
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = champion
      ? `My World Cup 2026 bracket — I've got ${FLAG[champion] ?? ""} ${champion} winning it all. Fill yours →`
      : `Fill out your 2026 World Cup bracket →`;
    try {
      if (typeof navigator !== "undefined" && (navigator as { share?: unknown }).share) {
        await (navigator as { share: (data: unknown) => Promise<void> }).share({
          title: "My World Cup 2026 bracket",
          text: shareText,
          url: shareUrl,
        });
        setShareStatus("Shared!");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("Link copied");
      } else {
        setShareStatus("Copy the URL to share");
      }
    } catch {
      // user cancelled — no-op
    }
    setTimeout(() => setShareStatus(""), 2000);
  }, [champion, trackShare]);

  const handleReset = useCallback(() => {
    trackReset();
    setPicks(buildDefaultPicks());
  }, [trackReset]);

  const handleClearPending = useCallback(() => {
    trackClearPending();
    setPicks((p) => {
      // Blank R32 for pending (result === null); keep locked ones; blank all downstream
      const chars = p.split("");
      WC_2026_BRACKET.r32.forEach((g, i) => {
        if (g.result === null) chars[i] = "?";
      });
      // Blank everything downstream (they'll re-derive)
      for (let i = R16_OFFSET; i < 31; i++) chars[i] = "?";
      return chars.join("");
    });
  }, [trackClearPending]);

  return (
    <div className="mx-auto max-w-[900px] px-3 py-6 sm:px-4 sm:py-8">
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Fill your World Cup 2026 bracket
        </h1>
        <p className="mt-1.5 text-sm text-neutral-600">
          Tap a team to pick — winners auto-advance. Real R32 results are locked ✓; the rest is yours to call.
        </p>
      </header>

      {/* Champion banner */}
      <div className="mb-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 p-3 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
          Your champion
        </div>
        <div className="mt-1 flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-neutral-900">
          {champion ? (
            <>
              <span aria-hidden>{FLAG[champion] ?? "🏆"}</span>
              <span>{champion}</span>
              <span aria-hidden className="ml-1 text-lg">🏆</span>
            </>
          ) : (
            <span className="text-neutral-400 text-base font-medium">
              Pick your way through to crown a champion
            </span>
          )}
        </div>
      </div>

      {/* Bracket grid — 5 columns, mobile-scrollable */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-yellow-50/40 p-2 sm:p-3">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          <ColumnHeader label={WC_2026_BRACKET.labels.r32} />
          <ColumnHeader label={WC_2026_BRACKET.labels.r16} />
          <ColumnHeader label={WC_2026_BRACKET.labels.qf} />
          <ColumnHeader label={WC_2026_BRACKET.labels.sf} />
          <ColumnHeader label={WC_2026_BRACKET.labels.f} />
        </div>

        {/* Rows */}
        <div className="mt-1 grid grid-cols-5 gap-1 sm:gap-2 auto-rows-[minmax(0,1fr)]">
          {/* R32 column: 16 cells stacked */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {WC_2026_BRACKET.r32.map((g, i) => {
              const pickedH = picks[i] === "H";
              const pickedA = picks[i] === "A";
              const locked = g.result !== null;
              return (
                <GameCell
                  key={`r32-${i}`}
                  home={g.home}
                  away={g.away}
                  homePicked={pickedH}
                  awayPicked={pickedA}
                  onPick={(side) => handleR32(i, side)}
                  locked={locked}
                  meta={`${g.date} · ${g.time}`}
                />
              );
            })}
          </div>

          {/* R16 column: 8 cells, each spanning 2 R32 rows */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {Array.from({ length: 8 }, (_, s) => {
              const [h, a] = pairFor("r16", s, picks);
              const pickedH = picks[R16_OFFSET + s] === "H";
              const pickedA = picks[R16_OFFSET + s] === "A";
              return (
                <div
                  key={`r16-${s}`}
                  className="flex-1 flex items-center"
                  style={{ minHeight: 0 }}
                >
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={pickedH}
                    awayPicked={pickedA}
                    onPick={(side) => handleR16(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* QF column: 4 cells */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {Array.from({ length: 4 }, (_, s) => {
              const [h, a] = pairFor("qf", s, picks);
              const pickedH = picks[QF_OFFSET + s] === "H";
              const pickedA = picks[QF_OFFSET + s] === "A";
              return (
                <div key={`qf-${s}`} className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={pickedH}
                    awayPicked={pickedA}
                    onPick={(side) => handleQF(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* SF column: 2 cells */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {Array.from({ length: 2 }, (_, s) => {
              const [h, a] = pairFor("sf", s, picks);
              const pickedH = picks[SF_OFFSET + s] === "H";
              const pickedA = picks[SF_OFFSET + s] === "A";
              return (
                <div key={`sf-${s}`} className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={pickedH}
                    awayPicked={pickedA}
                    onPick={(side) => handleSF(s, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* Final column: 1 cell */}
          <div className="flex flex-col">
            {(() => {
              const [h, a] = pairFor("f", 0, picks);
              const pickedH = picks[F_OFFSET] === "H";
              const pickedA = picks[F_OFFSET] === "A";
              return (
                <div className="flex-1 flex items-center">
                  <GameCell
                    home={h}
                    away={a}
                    homePicked={pickedH}
                    awayPicked={pickedA}
                    onPick={handleF}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Share my bracket
        </button>
        <button
          type="button"
          onClick={handleClearPending}
          className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        >
          Clear my picks
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          title="Reset to real R32 results only, everything else blank"
        >
          Reset
        </button>
        {shareStatus ? (
          <span className="text-xs font-medium text-emerald-700">{shareStatus}</span>
        ) : null}
      </div>

      <p className="mt-3 text-[11px] text-neutral-500">
        Confirmed R32 results reflect data through {new Date().toISOString().slice(0, 10)}. Locale: {locale}.
      </p>
    </div>
  );
}

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
      {label}
    </div>
  );
}
