import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { MBTI_META, MBTI_TYPES } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE ?? "https://cdn.curify-ai.com";

const RARITY: Record<string, number> = {
  INTJ:2, INTP:3, ENTJ:2, ENTP:3,
  INFJ:2, INFP:4, ENFJ:3, ENFP:8,
  ISTJ:12,ISFJ:14,ESTJ:9, ESFJ:12,
  ISTP:5, ISFP:9, ESTP:4, ESFP:9,
};

// Light-mode palette per type
const PALETTE: Record<string, { bg: string; typeColor: string; accent: string; badgeBg: string; badgeBorder: string }> = {
  INTJ: { bg:"#f8f5ff", typeColor:"#2d1b69", accent:"#7c3aed", badgeBg:"#ede9fe", badgeBorder:"#8b5cf6" },
  INTP: { bg:"#f0f4ff", typeColor:"#1e3a8a", accent:"#3b82f6", badgeBg:"#dbeafe", badgeBorder:"#60a5fa" },
  ENTJ: { bg:"#fff5f5", typeColor:"#7c0000", accent:"#dc2626", badgeBg:"#fee2e2", badgeBorder:"#f87171" },
  ENTP: { bg:"#f0f9ff", typeColor:"#0c4a6e", accent:"#0284c7", badgeBg:"#e0f2fe", badgeBorder:"#38bdf8" },
  INFJ: { bg:"#faf5ff", typeColor:"#3b0764", accent:"#7c3aed", badgeBg:"#f3e8ff", badgeBorder:"#a855f7" },
  INFP: { bg:"#f0f4ff", typeColor:"#1e1b4b", accent:"#4f46e5", badgeBg:"#e0e7ff", badgeBorder:"#818cf8" },
  ENFJ: { bg:"#f0fdf4", typeColor:"#064e3b", accent:"#059669", badgeBg:"#d1fae5", badgeBorder:"#34d399" },
  ENFP: { bg:"#fff7ed", typeColor:"#7c2d12", accent:"#ea580c", badgeBg:"#ffedd5", badgeBorder:"#fb923c" },
  ISTJ: { bg:"#f8f9fa", typeColor:"#1a1a2e", accent:"#4b5563", badgeBg:"#f3f4f6", badgeBorder:"#9ca3af" },
  ISFJ: { bg:"#f0f9ff", typeColor:"#1a3a4a", accent:"#0369a1", badgeBg:"#e0f2fe", badgeBorder:"#38bdf8" },
  ESTJ: { bg:"#f5f3ff", typeColor:"#1a1a2e", accent:"#7c3aed", badgeBg:"#ede9fe", badgeBorder:"#8b5cf6" },
  ESFJ: { bg:"#eff6ff", typeColor:"#1e3a8a", accent:"#2563eb", badgeBg:"#dbeafe", badgeBorder:"#60a5fa" },
  ISTP: { bg:"#f0f9ff", typeColor:"#0c4a6e", accent:"#0284c7", badgeBg:"#e0f2fe", badgeBorder:"#38bdf8" },
  ISFP: { bg:"#fdf4ff", typeColor:"#4a044e", accent:"#a21caf", badgeBg:"#fae8ff", badgeBorder:"#d946ef" },
  ESTP: { bg:"#fff5f5", typeColor:"#450a0a", accent:"#dc2626", badgeBg:"#fee2e2", badgeBorder:"#f87171" },
  ESFP: { bg:"#fff7ed", typeColor:"#7c2d12", accent:"#ea580c", badgeBg:"#ffedd5", badgeBorder:"#fb923c" },
};

// Pre-compute watermark tile positions (tiled at -30deg like the watermark script)
const WATERMARK_TILES = (() => {
  const tiles: { left: number; top: number }[] = [];
  for (let row = -1; row < 9; row++) {
    for (let col = -1; col < 6; col++) {
      tiles.push({
        left: col * 220 + (row % 2) * 110,
        top:  row * 160,
      });
    }
  }
  return tiles;
})();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "INTJ").toUpperCase();
  const name = (searchParams.get("name") ?? "").trim().slice(0, 30);

  if (!(MBTI_TYPES as readonly string[]).includes(type)) {
    return new Response("Invalid type", { status: 400 });
  }

  const meta   = MBTI_META[type as keyof typeof MBTI_META];
  const chars  = (mbtiCharacters as Record<string, Array<{name:string;img:string;ip:string}>>)[type] ?? [];
  const shown  = chars.slice(0, 3);
  const pct    = RARITY[type] ?? 4;
  const pal    = PALETTE[type] ?? PALETTE.INTJ;

  const fontPath = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");
  const fontData = await readFile(fontPath);

  const IMG_H = 260;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: pal.bg,
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Tiled "curify" watermark layer (behind content) ── */}
        {WATERMARK_TILES.map((tile, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: tile.left,
              top: tile.top,
              transform: "rotate(-30deg)",
              opacity: 0.07,
              fontSize: 30,
              fontWeight: 700,
              color: pal.accent,
              display: "flex",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            curify
          </div>
        ))}

        {/* ── Content (above watermark) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "56px 60px 48px",
            position: "relative",
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: pal.accent, fontSize: 16, letterSpacing: 5, textTransform: "uppercase" }}>
              Visual Personality Test
            </span>
            <span style={{ color: "#9ca3af", fontSize: 16, letterSpacing: 2 }}>
              curify.ai
            </span>
          </div>

          {/* Name line */}
          {name ? (
            <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: pal.accent, fontWeight: 600, letterSpacing: 0.3 }}>
              {name} is
            </div>
          ) : (
            <div style={{ display: "flex", marginTop: 48 }} />
          )}

          {/* Type + tagline + description */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: name ? 10 : 0 }}>
            <div style={{ display: "flex", fontSize: 152, fontWeight: 900, color: pal.typeColor, lineHeight: 0.88, letterSpacing: -4 }}>
              {type}
            </div>
            <div style={{ display: "flex", fontSize: 32, color: pal.accent, fontWeight: 700, marginTop: 18 }}>
              {meta.tagline}
            </div>
            <div style={{ display: "flex", fontSize: 19, color: "#6b7280", marginTop: 12, lineHeight: 1.5, maxWidth: 540 }}>
              {meta.description}
            </div>
          </div>

          {/* Rarity badge */}
          <div style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: 24,
            background: pal.badgeBg,
            border: `1px solid ${pal.badgeBorder}`,
            borderRadius: 999,
            padding: "7px 18px",
          }}>
            <span style={{ color: pal.accent, fontSize: 15, fontWeight: 600 }}>
              ✦ Only {pct}% of people share this personality type
            </span>
          </div>

          {/* Characters row */}
          <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 28 }}>
            {shown.map((char) => (
              <div key={char.name} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{
                  display: "flex",
                  width: "100%",
                  height: IMG_H,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `2px solid ${pal.badgeBorder}`,
                }}>
                  <img
                    src={`${CDN_BASE}${char.img}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt={char.name}
                  />
                </div>
                <div style={{ display: "flex", color: pal.typeColor, fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                  {char.name}
                </div>
                <div style={{ display: "flex", color: pal.accent, fontSize: 12, marginTop: 2 }}>
                  {char.ip}
                </div>
              </div>
            ))}

            {/* CTA column */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1, paddingLeft: 8 }}>
              <div style={{ display: "flex", color: pal.typeColor, fontSize: 18, fontWeight: 700 }}>
                Which personality type are you?
              </div>
              <div style={{ display: "flex", color: pal.accent, fontSize: 16, marginTop: 8, fontWeight: 600 }}>
                curify.ai →
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 700 }],
    }
  );
}
