// lib/tool-page-guard.ts
import { getToolBySlug } from "@/lib/tools-registry";

// NOTE: adjust relative path as needed based on your repo structure.
// This assumes messages/<locale>/home.json exists.
export async function resolveToolNamespaceOr404(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return { tool: null as any, hasNamespace: false };

  // Always check EN home.json as the source-of-truth for "page exists"
  // (matches your requirement)
  const enHome = (await import(`@/messages/en/home.json`)).default as Record<string, any>;

  const ns = tool.namespace;
  const block = enHome?.[ns];

  // "page exists" iff namespace object exists
  if (!block || typeof block !== "object") {
    return { tool, hasNamespace: false };
  }

  return { tool, hasNamespace: true };
}