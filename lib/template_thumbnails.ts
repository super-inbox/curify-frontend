// Server-safe resolver: a workflow step's href → the linked template's example
// thumbnail (its `og_image` preview). Used to give the home / topic "Design
// workflows" ladder a real example image per step instead of a bare emoji, so a
// visitor can see what each step produces before clicking (2026-08-19).
//
// Reads nano_templates.json (already imported server-side by nano_seo_utils; the
// small ~1.1 MB templates file, NOT the multi-MB inspiration file). Import from
// server components only — see the client-bundle-data-leak guardrail.
import nanoTemplates from "@/public/data/nano_templates.json";
import { CDN_BASE } from "@/lib/constants";

type TemplateCore = { id?: string; og_image?: string };
const ALL = (nanoTemplates as unknown as TemplateCore[]) ?? [];
const OG_BY_ID = new Map<string, string>();
for (const t of ALL) {
  if (t?.id && t.og_image) OG_BY_ID.set(t.id, t.og_image);
}

/**
 * Absolute CDN thumbnail URL for a workflow step, or null when the step doesn't
 * map to a template (e.g. a `/tools/...` step) or the template has no preview.
 * Accepts an href like `/nano-template/<slug>` (locale prefix tolerated).
 */
export function getStepThumbnail(href: string): string | null {
  const m = href.match(/\/nano-template\/([^/?#]+)/);
  if (!m) return null;
  const slug = m[1];
  const og = OG_BY_ID.get(`template-${slug}`);
  if (!og) return null;
  return og.startsWith("http") ? og : `${CDN_BASE}${og}`;
}
