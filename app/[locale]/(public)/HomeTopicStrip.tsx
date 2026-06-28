// Canva-style topic strip mounted near the top of the home page —
// alternative visual treatment to the existing pill-based
// HomeDiscoveryStrip (which stays below for now, side-by-side, until
// the operator decides on a swap).
//
// Picks the top 12 topics by template count (the same authority/breadth
// proxy HomeDiscoveryStrip uses). Filters to fully-localized topics so
// the destination /topics/<slug> page doesn't trigger missing-message
// warnings.

import { getTranslations } from "next-intl/server";

import TopicStrip from "@/app/[locale]/_components/TopicStrip";
import { getTopics } from "@/lib/topicRegistry";
import { isFullyLocalizedTopic } from "@/lib/topicRegistry_pure";

const TOPIC_LIMIT = 12;

// Slug → destination override. When a topic slug maps to a stronger
// use-case destination, redirect there instead of the generic
// /topics/<slug> hub. The slug is still used for color + thumbnail
// (so the tile keeps its identity), only the click target changes.
//
// Order matters: a slug present here takes precedence over /topics/<slug>.
const HOME_PATH_OVERRIDES: Record<string, string> = {
  // /topics/design exists but the use-case landing converts better on
  // the operator-targeted designer audience (multi-template workflow
  // pitch instead of a flat topic grid). 2026-06-29 swap per operator.
  design: "/use-cases/for-designers",
};

export default async function HomeTopicStrip({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const tDiscovery = await getTranslations({ locale, namespace: "home.discovery" });

  const items = getTopics()
    .filter((tp) => tp.isEnabled && isFullyLocalizedTopic(tp.id))
    .sort((a, b) => b.templateCount - a.templateCount)
    .slice(0, TOPIC_LIMIT)
    .map((tp) => {
      const labelKey = `topics.${tp.id}.displayName`;
      const label = t.has(labelKey) ? t(labelKey) : tp.id;
      const path = HOME_PATH_OVERRIDES[tp.id] ?? `/topics/${tp.id}`;
      return { slug: tp.id, path, label };
    });

  return (
    <div className="mt-8 w-full max-w-[1400px]">
      <TopicStrip
        items={items}
        locale={locale}
        heading={tDiscovery("topicsTitle")}
        trackPrefix="home-topic-strip"
      />
    </div>
  );
}
