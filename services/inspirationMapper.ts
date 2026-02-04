import { InspirationCardDTO, InspirationCardUI } from "@/types/inspiration";

/**
 * Extracts bullet points from Coze script bodies
 */
function parseBeats(scriptBody?: string | null): string[] {
  if (!scriptBody) return [];
  
  // 1. Try splitting by newlines and filtering for bullet indicators
  const lines = scriptBody.split("\n").map(l => l.trim());
  const bullets = lines
    .filter(l => /^[•\-*]|^镜头\s*\d+/.test(l))
    .map(l => l.replace(/^[•\-*]\s*|^镜头\s*\d+[：:（(]\s*/, ""));

  if (bullets.length > 0) return bullets.slice(0, 6);

  // 2. Fallback: Split by double newlines (paragraphs)
  return scriptBody
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Generates the "Copy to Clipboard" text.
 */
function buildCopyPayload(row: InspirationCardDTO): string {
  const parts = [
    { label: "信号源", val: row.signal_source || row.source_text },
    { label: "来源平台", val: row.source_platforms?.join(" / ") },
    { label: "选题", val: row.output_title ? `"${row.output_title}"` : null },
    { label: "创作视角", val: row.inspiration_tags?.join(" / ") },
    { label: "形式", val: row.video_format },
    { label: "时长", val: row.video_duration_sec ? `${row.video_duration_sec}秒` : null },
    { label: "受众群体", val: row.audiences?.join("、") },
    { label: "配图建议", val: row.prompt },
    { label: "拍摄建议", val: parseBeats(row.output).join("\n") || row.output },
    { label: "自我反馈", val: row.feedback },
    { label: "AI评分", val: row.star_rating ? `${"⭐".repeat(Math.round(row.star_rating))} ${row.star_rating}/5.0` : null },
  ];

  return parts
    .filter(p => p.val) // Only keep fields with values
    .map(p => `【${p.label}】\n${p.val}`)
    .join("\n\n");
}

export function mapDTOToUICard(row: InspirationCardDTO): InspirationCardUI {
  const img = row.image_url?.trim();
  const preview = row.preview_image_url?.trim();
  const copyPayload = buildCopyPayload(row);

  // ✅ choose one canonical share url (permalink best)
  // If you have /[locale]/i/[id], use that. Otherwise fallback to hash.
  const shareUrl = `/i/${row.id}`;

  return {
    id: row.id,
    lang: row.lang || "zh",

    // ✅ add visual.images
    visual: img || preview ? {
      images: [
        {
          image_url: img || preview || "",
          preview_image_url: preview || undefined,
          alt: row.output_title || "preview",
        },
      ],
    } : undefined,

    signal: {
      summary: row.signal_source || row.source_text || row.source_title || "",
      sources: (row.source_platforms || []).map((p) => ({ label: p })),
    },

    translation: {
      tag: row.subtitle || undefined,
      angles: row.inspiration_tags || [],
    },

    hook: { text: row.output_title || "" },

    production: {
      title: "拍摄建议",
      format: row.video_format || undefined,
      beats: parseBeats(row.output),
      durationSec: row.video_duration_sec || undefined,
    },

    rating: row.star_rating ? {
      score: row.star_rating,
      reason: row.scoring_reason || "",
    } : undefined,

    copyPayload,
    shareUrl,
    // ✅ Add actions so existing components work
    actions: {
      copy: { payload: copyPayload },
      share: { url: shareUrl },
    },
  };
}