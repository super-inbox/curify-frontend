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

function parseBeats(output?: string | null): string[] {
  if (!output) return [];

  return output
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("•"))
    .map((l) => l.replace(/^•\s*/, ""))
    .slice(0, 6);
}

function buildCopyPayload(row: InspirationCardDTO): string {
  return [
    row.source_text && `【信号源】${row.source_text}`,
    row.subtitle && `【主题】${row.subtitle}`,
    row.output_title && `【选题】${row.output_title}`,
    row.inspiration_tags?.length &&
      `【创作视角】${row.inspiration_tags.join(" / ")}`,
    row.video_format && `【形式】${row.video_format}`,
    row.video_duration_sec && `【时长】${row.video_duration_sec}s`,
    row.output && `【拍摄建议】\n${parseBeats(row.output).join("\n")}`
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function mapDTOToUICard(row: InspirationCardDTO): InspirationCardUI {
  return {
    id: row.id,
    lang: row.lang || "zh",

    signal: {
      summary: row.source_text || row.source_title || "",
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
      beats: parseBeats(row.output),
      durationSec: row.video_duration_sec || undefined
    },

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
