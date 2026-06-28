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
      return { slug: tp.id, path: `/topics/${tp.id}`, label };
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
