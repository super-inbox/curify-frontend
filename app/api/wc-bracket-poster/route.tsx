import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  WC_2026_BRACKET,
  FLAG,
  sanitizePicks,
  pairFor,
  championName,
  R16_OFFSET,
  QF_OFFSET,
  SF_OFFSET,
  F_OFFSET,
} from "@/lib/wc_bracket_2026";

// GET /api/wc-bracket-poster?p=<31-char picks>&name=<optional>
//
// 1080 x 1920 portrait poster capturing the bracket state, watermarked
// with tiled "curify" text (same visual language as the MBTI poster
// share flow — MBTIPosterShare / api/personality-poster).
//
// Layout: header → 5-column bracket → champion callout → CTA.

export const runtime = "nodejs";

// ── Watermark tiles (same construction as MBTI poster) ─────────────
const WATERMARK_TILES = (() => {
  const tiles: { left: number; top: number; colorIndex: number }[] = [];
  for (let row = -1; row < 20; row++) {
    for (let col = -1; col < 7; col++) {
      tiles.push({ left: col * 220 + (row % 2) * 110, top: row * 160, colorIndex: (row + col) % 2 });
    }
  }
  return tiles;
})();
const WATERMARK_COLORS = ["#34d399", "#fbbf24"] as const; // emerald-400, amber-400 (on dark bg)

function renderWatermarkTiles() {
  return WATERMARK_TILES.map((tile, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: tile.left,
        top: tile.top,
        transform: "rotate(-30deg)",
        opacity: 0.08,
        fontSize: 34,
        fontWeight: 800,
        color: WATERMARK_COLORS[tile.colorIndex],
        display: "flex",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      curify
    </div>
  ));
}

// Palette (dark theme, matches the /wc-bracket page)
const BG_DARK   = "#0b1a13";      // deepest emerald-black
const BG_MID    = "#0f2a1e";      // slightly lighter
const EMERALD   = "#10b981";      // primary accent
const GOLD      = "#f59e0b";      // champion accent
const OFF_WHITE = "#f5f5f4";
const MUTED     = "#94a3b8";
const CARD_BG   = "rgba(255,255,255,0.05)";
const CARD_BG_LOCKED = "rgba(16,185,129,0.10)";
const CARD_BG_PICKED = "rgba(16,185,129,0.22)";

type Cell = {
  home: string | null;
  away: string | null;
  pickedHome: boolean;
  pickedAway: boolean;
  locked?: boolean;
};

function TeamRow({ name, picked, locked }: { name: string | null; picked: boolean; locked?: boolean }) {
  const bg = picked ? (locked ? "rgba(16,185,129,0.32)" : CARD_BG_PICKED) : "transparent";
  const color = picked ? OFF_WHITE : name ? "#cbd5e1" : "#64748b";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 6px",
      borderRadius: 6,
      background: bg,
      fontSize: 14,
      fontWeight: picked ? 700 : 500,
      color,
      overflow: "hidden",
      whiteSpace: "nowrap",
    }}>
      <span style={{ display: "flex", fontSize: 16 }}>{name ? FLAG[name] ?? "·" : "·"}</span>
      <span style={{ display: "flex", overflow: "hidden", textOverflow: "ellipsis" }}>
        {name ?? "TBD"}
      </span>
    </div>
  );
}

function GameCell({ home, away, pickedHome, pickedAway, locked }: Cell) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      padding: 4,
      borderRadius: 8,
      background: locked ? CARD_BG_LOCKED : CARD_BG,
      border: `1px solid ${locked ? "rgba(16,185,129,0.30)" : "rgba(255,255,255,0.10)"}`,
      minHeight: 0,
    }}>
      <TeamRow name={home} picked={pickedHome} locked={locked} />
      <TeamRow name={away} picked={pickedAway} locked={locked} />
    </div>
  );
}

function evenSpacedColumn(cells: Cell[], flex: number) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      flex,
      gap: 4,
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <GameCell {...c} />
        </div>
      ))}
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const picks = sanitizePicks(searchParams.get("p"));
  const name = (searchParams.get("name") ?? "").trim().slice(0, 30);
  const champ = championName(picks);

  const fontPath = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");
  const fontData = await readFile(fontPath);

  // R32 column
  const r32Cells: Cell[] = WC_2026_BRACKET.r32.map((g, i) => ({
    home: g.home,
    away: g.away,
    pickedHome: picks[i] === "H",
    pickedAway: picks[i] === "A",
    locked: g.result !== null,
  }));

  // R16
  const r16Cells: Cell[] = Array.from({ length: 8 }, (_, s) => {
    const [h, a] = pairFor("r16", s, picks);
    return {
      home: h,
      away: a,
      pickedHome: picks[R16_OFFSET + s] === "H",
      pickedAway: picks[R16_OFFSET + s] === "A",
    };
  });

  // QF
  const qfCells: Cell[] = Array.from({ length: 4 }, (_, s) => {
    const [h, a] = pairFor("qf", s, picks);
    return {
      home: h,
      away: a,
      pickedHome: picks[QF_OFFSET + s] === "H",
      pickedAway: picks[QF_OFFSET + s] === "A",
    };
  });

  // SF
  const sfCells: Cell[] = Array.from({ length: 2 }, (_, s) => {
    const [h, a] = pairFor("sf", s, picks);
    return {
      home: h,
      away: a,
      pickedHome: picks[SF_OFFSET + s] === "H",
      pickedAway: picks[SF_OFFSET + s] === "A",
    };
  });

  // Final
  const [fh, fa] = pairFor("f", 0, picks);
  const fCells: Cell[] = [{
    home: fh,
    away: fa,
    pickedHome: picks[F_OFFSET] === "H",
    pickedAway: picks[F_OFFSET] === "A",
  }];

  const namePrefix = name ? `${name}'s` : "My";

  return new ImageResponse(
    (
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: `linear-gradient(180deg, ${BG_DARK} 0%, ${BG_MID} 100%)`,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
        color: OFF_WHITE,
      }}>
        {/* Tiled watermark */}
        {renderWatermarkTiles()}

        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "44px 40px 36px",
          position: "relative",
        }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", fontSize: 40 }}>⚽</span>
              <span style={{ display: "flex", color: EMERALD, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700 }}>
                FIFA World Cup 2026
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 900, marginTop: 6, letterSpacing: -1 }}>
              {namePrefix} bracket
            </div>
          </div>

          {/* Champion banner */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            marginBottom: 20,
            borderRadius: 14,
            background: champ ? `linear-gradient(90deg, rgba(245,158,11,0.20), rgba(234,179,8,0.05))` : "rgba(255,255,255,0.04)",
            border: `2px solid ${champ ? GOLD : "rgba(255,255,255,0.10)"}`,
          }}>
            <span style={{ display: "flex", fontSize: 44 }}>🏆</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>
                Champion
              </span>
              {champ ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34, fontWeight: 900, marginTop: 2 }}>
                  <span>{FLAG[champ] ?? ""}</span>
                  <span>{champ}</span>
                </div>
              ) : (
                <span style={{ display: "flex", color: MUTED, fontSize: 20, marginTop: 2, fontWeight: 600 }}>
                  Pending — finish the bracket
                </span>
              )}
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            {[WC_2026_BRACKET.labels.r32, WC_2026_BRACKET.labels.r16, WC_2026_BRACKET.labels.qf, WC_2026_BRACKET.labels.sf, WC_2026_BRACKET.labels.f].map((label) => (
              <div key={label} style={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                color: EMERALD,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Bracket grid */}
          <div style={{
            display: "flex",
            flex: 1,
            gap: 8,
            padding: 8,
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 0,
          }}>
            {evenSpacedColumn(r32Cells, 1)}
            {evenSpacedColumn(r16Cells, 1)}
            {evenSpacedColumn(qfCells, 1)}
            {evenSpacedColumn(sfCells, 1)}
            {evenSpacedColumn(fCells, 1)}
          </div>

          {/* Footer CTA */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}>
            <span style={{ display: "flex", color: OFF_WHITE, fontSize: 18, fontWeight: 700 }}>
              Fill yours →
            </span>
            <span style={{ display: "flex", color: EMERALD, fontSize: 20, fontWeight: 800, letterSpacing: 2 }}>
              curify.ai/wc-bracket
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 700 }],
    },
  );
}
