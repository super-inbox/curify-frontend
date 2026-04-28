import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { MBTI_META, MBTI_TYPES } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";

import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE ?? "https://cdn.curify-ai.com";

// Rarity stats (population %)
const RARITY: Record<string, number> = {
  INTJ:2, INTP:3, ENTJ:2, ENTP:3,
  INFJ:2, INFP:4, ENFJ:3, ENFP:8,
  ISTJ:12,ISFJ:14,ESTJ:9, ESFJ:12,
  ISTP:5, ISFP:9, ESTP:4, ESFP:9,
};

// Gradient pairs per type
const GRADIENTS: Record<string, [string, string]> = {
  INTJ:["#0f0c29","#302b63"], INTP:["#1a1a2e","#16213e"],
  ENTJ:["#200122","#6f0000"], ENTP:["#0f2027","#203a43"],
  INFJ:["#1a0533","#2d1b69"], INFP:["#0d0d2b","#1a1a4e"],
  ENFJ:["#11998e","#1a1a4e"], ENFP:["#f7971e","#b721ff"],
  ISTJ:["#1c1c1c","#383838"], ISFJ:["#1a3a4a","#0f2031"],
  ESTJ:["#1a1a2e","#4a2040"], ESFJ:["#2b5876","#4e4376"],
  ISTP:["#0f2027","#2c5364"], ISFP:["#1a0533","#4a1942"],
  ESTP:["#7b2d00","#1a0533"], ESFP:["#f7971e","#c90032"],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "INTJ").toUpperCase();
  const name = (searchParams.get("name") ?? "").trim().slice(0, 30);

  if (!(MBTI_TYPES as readonly string[]).includes(type)) {
    return new Response("Invalid type", { status: 400 });
  }

  const meta  = MBTI_META[type as keyof typeof MBTI_META];
  const chars = (mbtiCharacters as Record<string, Array<{name:string;img:string;ip:string}>>)[type] ?? [];
  const shown = chars.slice(0, 3);
  const [g1, g2] = GRADIENTS[type] ?? ["#1a0533", "#2d1b69"];
  const pct = RARITY[type] ?? 4;

  // ✅ Load font from local file system
  const fontPath = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");
  const fontData = await readFile(fontPath);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(150deg, ${g1} 0%, ${g2} 100%)`,
          padding: "56px 60px 48px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#a78bfa", fontSize: 18, letterSpacing: 6, textTransform: "uppercase" }}>
            Visual Personality Test
          </span>
          <span style={{ color: "#6b7280", fontSize: 18, letterSpacing: 2 }}>
            curify.ai
          </span>
        </div>

        {/* MBTI */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
          {name && (
            <div style={{ fontSize: 28, color: "#d8b4fe", fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>
              {name} is
            </div>
          )}
          <div style={{ fontSize: 156, fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: -4 }}>
            {type}
          </div>

          <div style={{ fontSize: 34, color: "#c4b5fd", fontWeight: 700, marginTop: 16 }}>
            {meta.tagline}
          </div>

          <div style={{ fontSize: 20, color: "#9ca3af", marginTop: 14, lineHeight: 1.5, maxWidth: 540 }}>
            {meta.description}
          </div>
        </div>

        {/* Rarity */}
        <div style={{
          display: "flex",
          alignSelf: "flex-start",
          marginTop: 28,
          background: "rgba(167,139,250,0.15)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 999,
          padding: "8px 20px",
        }}>
          <span style={{ color: "#a78bfa", fontSize: 16, fontWeight: 600 }}>
            ✦ Only {pct}% of people share this personality type
          </span>
        </div>

        {/* Characters */}
        <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 32 }}>
          {shown.map((char) => (
            <div key={char.name} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{
                display: "flex",
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: 16,
                overflow: "hidden",
                border: "2px solid rgba(167,139,250,0.3)",
              }}>
                <img
                  src={`${CDN_BASE}${char.img}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt={char.name}
                />
              </div>

              <div style={{ color: "white", fontSize: 15, fontWeight: 700, marginTop: 10 }}>
                {char.name}
              </div>

              <div style={{ color: "#a78bfa", fontSize: 13, marginTop: 2 }}>
                {char.ip}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: 1,
            paddingLeft: 8,
          }}>
            <div style={{ color: "#e5e7eb", fontSize: 19, fontWeight: 700 }}>
              Which personality type are you?
            </div>
            <div style={{ color: "#a78bfa", fontSize: 17, marginTop: 8, fontWeight: 600 }}>
              curify.ai →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}