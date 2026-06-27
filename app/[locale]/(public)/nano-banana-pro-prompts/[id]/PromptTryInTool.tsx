// W1.5 — "Try this prompt in [tool]" CTA on prompt detail pages.
// Routes the previously-dead-end gallery prompt family into /tools/*
// (highest per-page yield family per the 2026-06-26 audit but currently
// receiving 0 outbound links from the 4,117 prompt detail pages).
//
// Match: see promptToolMatch.ts. Either a tag-based override or a
// round-robin default. Either way, every prompt gets ONE outbound link
// to a live tool.

import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { TOOL_REGISTRY } from "@/lib/tools-registry";
import { getToolForPrompt } from "./promptToolMatch";

export default async function PromptTryInTool({
  locale,
  promptId,
  tags,
}: {
  locale: string;
  // nanobanana.json carries numeric ids; matcher stringifies before hashing.
  promptId: string | number;
  tags: readonly string[];
}) {
  const match = getToolForPrompt(promptId, tags);
  if (!match) return null;

  const tool = TOOL_REGISTRY.find((t) => t.slug === match.toolSlug);
  if (!tool) return null;

  // Pull the tool's localized title from the shared "tools.<id>" i18n
  // namespace (matches ToolsGrid + HomeToolsStrip).
  const t = await getTranslations({ locale });
  const sectionT = await getTranslations({
    locale,
    namespace: "nanoTemplate.promptTryInTool",
  });

  let toolTitle = "";
  try {
    toolTitle = (t as unknown as (k: string) => string)(tool.i18n.titleKey);
  } catch {
    toolTitle = tool.slug;
  }

  return (
    <section className="mt-10 border-t border-neutral-200 pt-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-neutral-900">
          {sectionT("title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{sectionT("subtitle")}</p>
      </div>
      <Link
        href={`/tools/${tool.slug}`}
        className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-800 transition hover:border-purple-400 hover:bg-purple-100"
      >
        {sectionT("ctaPrefix")} {toolTitle}
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
