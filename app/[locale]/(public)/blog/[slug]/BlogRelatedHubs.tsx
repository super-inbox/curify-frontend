// W1.3 — Blog → Topic hub footer row. Channels the blog family's 76%
// site click share into /topics/* — which had 17% sitemap coverage
// before W1.7 + W1.1. Per the audit
// (docs/seo-funnel-audit-2026-06-26.md), the blog page emitted ZERO
// outbound topic-hub links before this ship.
//
// Topic mapping is two-tier:
//   1. Per-slug curated entries for high-traffic blogs (WC, mega-hubs,
//      etc.) — see utils/blog-related-hubs.ts.
//   2. Category-derived defaults for the long tail.
//
// All chips filtered through isFullyLocalizedTopic so users land only
// on topic pages with the full page-render data authored (avoids the
// stub-topic noindex-fallback noise; same pattern as
// HomeDiscoveryStrip + ExampleRelatedTopics).
//
// Tools are NOT surfaced here — BlogCTACard already renders the
// matched tool as a hero CTA card above this row. Adding a second
// tool chip set would be visual noise.

import { getTranslations } from "next-intl/server";

import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import { isFullyLocalizedTopic } from "@/lib/topicRegistry_pure";
import { getRelatedHubsForBlog } from "./utils/blog-related-hubs";

const MAX_CHIPS = 6;

export default async function BlogRelatedHubs({
  locale,
  slug,
  category,
}: {
  locale: string;
  slug: string;
  category?: string | null;
}) {
  const t = await getTranslations({
    locale,
    namespace: "nanoTemplate.blogRelatedHubs",
  });

  const { topicIds } = getRelatedHubsForBlog(slug, category);
  const filtered = topicIds
    .filter(isFullyLocalizedTopic)
    .slice(0, MAX_CHIPS);

  if (filtered.length === 0) return null;

  const navItems = filtered.map((id) => ({ id, isEnabled: true }));

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
