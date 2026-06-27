// W1.5 — Prompt → Tool match. Maps each gallery prompt to ONE live
// tool, so the previously-dead-end prompt-detail surface gains an
// outbound link to /tools/* (currently 0 clicks per the 2026-06-26
// audit despite tools being the highest per-page-yield family).
//
// Two-tier match:
//   1. Tag-based override for prompts whose tags have a clear semantic
//      tool match (product → ai-product-photo-generator, style →
//      style-transfer, etc.). Small map — most prompt tags are
//      descriptive/aesthetic (artistic, cozy, etc.) and don't map.
//   2. Default round-robin across live tools, deterministically picked
//      via a simple hash of the prompt id. Distributes authority
//      evenly across the ~10 live tools so no single tool soaks up
//      all 4,117 prompt outbound links.

import { TOOL_REGISTRY, type ToolDef } from "@/lib/tools-registry";

// Live tools — exclude coming_soon. We CAN link to coming_soon pages
// (they render), but it's a poor user experience to recommend a tool
// that doesn't work yet. Live = "create" or "demo".
function getLiveTools(): ToolDef[] {
  return TOOL_REGISTRY.filter(
    (t) => t.status === "create" || t.status === "demo"
  );
}

// Tag → tool slug. Only entries with a CLEAR semantic match. Most
// prompt tags don't appear here; those fall to the round-robin default.
const TAG_TO_TOOL: Record<string, string> = {
  // Image generation: product photos
  product: "ai-product-photo-generator",
  "product-lineup": "ai-product-photo-generator",
  "lifestyle-shot": "ai-product-photo-generator",
  // Style transfer
  style: "style-transfer",
  "style-transfer": "style-transfer",
  // Manga / comic
  manga: "manga-translation",
  comic: "manga-translation",
  // Subtitle / dubbing
  subtitle: "bilingual-subtitles",
  subtitles: "bilingual-subtitles",
  dub: "video-dubbing",
  dubbing: "video-dubbing",
  // ASL / accessibility
  asl: "asl-video-translator",
  "sign-language": "asl-video-translator",
};

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export type PromptToolMatch = {
  toolSlug: string;
  // True if we matched via a tag override, false if round-robin default.
  // Useful for downstream telemetry / UX tuning later.
  matched: boolean;
};

export function getToolForPrompt(
  // Accepts string|number — prompts in nanobanana.json carry numeric ids.
  // Stringified before hashing so round-robin actually distributes
  // (numbers have no .length, which silently made simpleHash return 0
  // and pinned every prompt to sorted[0]).
  promptId: string | number,
  tags: readonly string[]
): PromptToolMatch | null {
  const live = getLiveTools();
  if (live.length === 0) return null;

  for (const tag of tags) {
    const slug = TAG_TO_TOOL[tag.toLowerCase()];
    if (!slug) continue;
    if (live.some((t) => t.slug === slug)) {
      return { toolSlug: slug, matched: true };
    }
  }

  const sorted = [...live].sort((a, b) => a.slug.localeCompare(b.slug));
  const idx = simpleHash(String(promptId)) % sorted.length;
  return { toolSlug: sorted[idx].slug, matched: false };
}
