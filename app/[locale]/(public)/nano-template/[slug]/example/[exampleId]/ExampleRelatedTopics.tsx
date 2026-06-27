// W1.2 — Related topics footer row on example pages. Surfaces broader
// tier-1 / tier-2 topic hubs (and curated "related" entries) reachable
// from the template's declared topics, capped at 8 chips. The existing
// header chip row uses templateTopics ∪ exampleTopics (typically 3-7
// specific topics); this footer adds the BROADER ancestors that
// otherwise have no internal link from example pages.
//
// 17,650 example URLs × ~5 fresh chips = ~88k new internal links
// pointing AT /topics/*. The largest single source of authority
// injection in the W1 indexation rescue plan
// (docs/wedge1-indexation-rescue-scope-2026-06-26.md).
//
// All chips filtered through isFullyLocalizedTopic so users only land
// on topic pages with the full page-render data authored (avoids
// stub-topic noindex-fallback + dev-console warnings; same pattern as
// HomeDiscoveryStrip).

import { getTranslations } from "next-intl/server";

import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import {
  isFullyLocalizedTopic,
  getTier1Ancestor,
  getParentTopic,
  getRelatedTopics,
} from "@/lib/topicRegistry_pure";

const MAX_CHIPS = 8;

export default async function ExampleRelatedTopics({
  locale,
  seedTopics,
}: {
  locale: string;
  // Seed = templateTopics ∪ exampleTopics (the mergedTopics computed in
  // page.tsx). We expand to tier-1 ancestors + tier-2 parents + curated
  // related entries from each seed.
  seedTopics: string[];
}) {
  const t = await getTranslations({
    locale,
    namespace: "nanoTemplate.relatedTopics",
  });

  // Expand: seed topics + tier-1 ancestors + tier-2 parents + curated related.
  // Always include the seed topics themselves so the section reads as a
  // coherent "this example is in:" set rather than a disconnected jump
  // to ancestors only.
  const seen = new Set<string>();
  const expanded: string[] = [];

  const tryAdd = (id: string | undefined) => {
    if (!id) return;
    if (seen.has(id)) return;
    if (!isFullyLocalizedTopic(id)) return;
    seen.add(id);
    expanded.push(id);
  };

  for (const tp of seedTopics) tryAdd(tp);
  for (const tp of seedTopics) tryAdd(getTier1Ancestor(tp));
  for (const tp of seedTopics) tryAdd(getParentTopic(tp));
  for (const tp of seedTopics) {
    for (const r of getRelatedTopics(tp)) {
      if (expanded.length >= MAX_CHIPS) break;
      tryAdd(r);
    }
    if (expanded.length >= MAX_CHIPS) break;
  }

  const trimmed = expanded.slice(0, MAX_CHIPS);
  if (trimmed.length === 0) return null;

  const navItems = trimmed.map((id) => ({ id, isEnabled: true }));

  return (
    <section className="mt-10 border-t border-neutral-200 pt-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-neutral-900">{t("title")}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>
      </div>
      <TopicNavRow locale={locale} allTopics={navItems} showDisabled={false} />
    </section>
  );
}
