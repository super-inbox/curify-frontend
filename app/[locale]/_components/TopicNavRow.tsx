"use client";

import { useTranslations } from "next-intl";

import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";
import { buildTopicHref } from "@/lib/locale_utils";
import { useClickTracking } from "@/services/useTracking";
import { getTopics, type TopicWithTemplates } from "@/lib/topicRegistry";
import taxonomy from "@/lib/taxonomy.json";

type Props = {
  locale: string;
  activeTopic?: string;
  topics?: string[];
  className?: string;
  showDisabled?: boolean;
  size?: "default" | "small";
};

// Tier-1 → set of its tier-2 children (from taxonomy.json). 'personality'
// also implies 'mbti' (mbti is structurally under character but the
// personality framework is the same concept).
const TIER1_TO_TIER2_CHILDREN: Map<string, Set<string>> = new Map();
for (const [tier1, children] of Object.entries(
  taxonomy.tier2 as Record<string, string[]>
)) {
  TIER1_TO_TIER2_CHILDREN.set(tier1, new Set(children));
}
TIER1_TO_TIER2_CHILDREN.get("personality")?.add("mbti");

// Suppress a tier-1 chip when any of its tier-2 children is in the same
// chip set — the tier-2 is more specific and the tier-1 becomes redundant
// noise on detail pages. Tier-1 pages (/topics/<tier1>) are unaffected
// because templates still carry the tier-1 in topics[]; only the chip
// display drops it.
function suppressRedundantTier1(topicIds: string[]): string[] {
  const inputSet = new Set(topicIds);
  return topicIds.filter((id) => {
    const children = TIER1_TO_TIER2_CHILDREN.get(id);
    if (!children) return true;
    for (const child of children) {
      if (inputSet.has(child)) return false;
    }
    return true;
  });
}

function TopicLink({
  topic,
  href,
  label,
  isActive,
  size,
}: {
  topic: TopicWithTemplates;
  href: string;
  label: string;
  isActive: boolean;
  size: "default" | "small";
}) {
  const trackClick = useClickTracking(topic.id, "topic_capsule" as any);

  return (
    <MetaChipLink
      href={href}
      onClick={trackClick}
      isActive={isActive}
      ariaCurrent={isActive ? "page" : undefined}
      color="blue"
      size={size}
    >
      {label}
    </MetaChipLink>
  );
}

export default function TopicNavRow({
  locale,
  activeTopic,
  topics,
  className,
  showDisabled = true,
  size = "default",
}: Props) {
  const t = useTranslations("topics");

  const sortedTopics = getTopics();

  const filteredIds = topics?.length ? suppressRedundantTier1(topics) : null;
  const visibleTopics = filteredIds
    ? filteredIds
        .map((id) => sortedTopics.find((topic) => topic.id === id))
        .filter((topic): topic is TopicWithTemplates => Boolean(topic))
    : sortedTopics;

  if (!visibleTopics.length) return null;

  const disabledClass =
    size === "small"
      ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      : "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";

  return (
    <div
      className={["flex flex-wrap items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {visibleTopics.map((topic) => {
        const isDisabled = topic.id === "trending" ? false : !topic.isEnabled;
        const isActive = activeTopic === topic.id;

        const href = buildTopicHref(locale, topic.id);
        const label = t(`${topic.id}.displayName`);

        if (isDisabled && showDisabled) {
          return (
            <span
              key={topic.id}
              className={[
                disabledClass,
                "cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400",
              ].join(" ")}
              title="Coming soon"
            >
              {label}
            </span>
          );
        }

        if (isDisabled && !showDisabled) {
          return null;
        }

        return (
          <TopicLink
            key={topic.id}
            topic={topic}
            href={href}
            label={label}
            isActive={isActive}
            size={size}
          />
        );
      })}
    </div>
  );
}