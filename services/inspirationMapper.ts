// api/inspirationMapper.ts
import { InspirationCardDTO } from "./inspiration";

/**
 * Stable UI-facing schema
 * Your client should ONLY depend on this.
 */
export interface InspirationCardUI {
  id: string;
  lang: string;

  signal: {
    summary: string;
    sources: { label: string; url?: string }[];
  };

  translation: {
    tag?: string;
    angles: string[];
  };

  hook: {
    text: string;
  };

  production: {
    title: string;
    format?: string;
    beats: string[];
    durationSec?: number;
  };

  // NEW: Quality rating from AI
  rating?: {
    score: number;  // 0-5
    reason: string;
  };

  actions: {
    copy: {
      label: string;
      payload: string;
    };
    share: {
      label: string;
      url: string;
    };
  };

  // keep visual but empty for now
  visual: {
    images: [];
  };
}

/**
 * Parse beats/script suggestions from script_body
 * Updated to handle new Coze JSON output structure
 */
function parseBeats(scriptBody?: string | null): string[] {
  if (!scriptBody) return [];

  // Try to extract beats from structured script
  const beats: string[] = [];
  
  // Look for bullet points or numbered items
  const lines = scriptBody.split("\n").map((l) => l.trim());
  
  for (const line of lines) {
    // Match bullets (•, -, *) or numbered items
    if (line.match(/^[•\-*]\s+/) || line.match(/^镜头\s*\d+/)) {
      beats.push(line.replace(/^[•\-*]\s+/, "").replace(/^镜头\s*\d+[：:（(]\s*/, ""));
    }
  }
  
  // If no structured beats found, try to split by key sections
  if (beats.length === 0) {
    const sections = scriptBody.split(/\n\n+/);
    return sections
      .filter(s => s.trim().length > 0)
      .map(s => s.trim())
      .slice(0, 6);
  }
  
  return beats.slice(0, 6);
}

/**
 * Build comprehensive copy payload for users
 * Updated to use new field structure: signal_source, script_body
 */
function buildCopyPayload(row: InspirationCardDTO): string {
  const sections: string[] = [];
  
  // Signal Source (NEW: dedicated field)
  if (row.signal_source) {
    sections.push(`【信号源】\n${row.signal_source}`);
  } else if (row.source_text) {
    sections.push(`【信号源】\n${row.source_text}`);
  }
  
  // Source Platforms
  if (row.source_platforms?.length) {
    sections.push(`【来源平台】\n${row.source_platforms.join(" / ")}`);
  }
  
  // Hook/Title
  if (row.output_title) {
    sections.push(`【选题】\n"${row.output_title}"`);
  }
  
  // Creative Angles
  if (row.inspiration_tags?.length) {
    sections.push(`【创作视角】\n${row.inspiration_tags.join(" / ")}`);
  }
  
  // Video Format
  if (row.video_format) {
    sections.push(`【形式】\n${row.video_format}`);
  }
  
  // Duration
  if (row.video_duration_sec) {
    sections.push(`【时长】\n${row.video_duration_sec}秒`);
  }
  
  // Target Audience
  if (row.audiences?.length) {
    sections.push(`【受众群体】\n${row.audiences.join("、")}`);
  }
  
  // Image Prompt (if available)
  if (row.prompt) {
    sections.push(`【配图建议】\n${row.prompt}`);
  }
  
  // Script/Production Beats (output = script_body from Coze)
  if (row.output) {
    const beats = parseBeats(row.output);
    if (beats.length > 0) {
      sections.push(`【拍摄建议】\n${beats.join("\n")}`);
    } else {
      sections.push(`【拍摄建议】\n${row.output}`);
    }
  }
  
  // Feedback
  if (row.feedback) {
    sections.push(`【自我反馈】\n${row.feedback}`);
  }
  
  // Star Rating (NEW)
  if (row.star_rating) {
    sections.push(`【AI评分】\n${"⭐".repeat(Math.round(row.star_rating))} ${row.star_rating}/5.0`);
  }
  
  return sections.join("\n\n");
}

/**
 * Map backend DTO to UI-friendly card structure
 * Updated for new schema: signal_source, star_rating, review_status
 */
export function mapDTOToUICard(row: InspirationCardDTO): InspirationCardUI {
  return {
    id: row.id,
    lang: row.lang || "zh",

    signal: {
      // Use dedicated signal_source field (NEW), fallback to source_text
      summary: row.signal_source || row.source_text || row.source_title || "",
      sources: (row.source_platforms || []).map((p) => ({ label: p }))
    },

    translation: {
      tag: row.subtitle || undefined,
      angles: row.inspiration_tags || []
    },

    hook: {
      text: row.output_title || ""
    },

    production: {
      title: "拍摄建议",
      format: row.video_format || undefined,
      beats: parseBeats(row.output),  // output = script_body from Coze
      durationSec: row.video_duration_sec || undefined
    },

    // NEW: Include star rating if available
    rating: row.star_rating ? {
      score: row.star_rating,
      reason: row.scoring_reason || ""
    } : undefined,

    actions: {
      copy: {
        label: "复制灵感",
        payload: buildCopyPayload(row)
      },
      share: {
        label: "分享",
        url: `/inspiration-hub#${row.id}`
      }
    },

    visual: {
      images: [] // explicitly empty for now
    }
  };
}