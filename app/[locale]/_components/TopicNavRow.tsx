"use client";

import { useTranslations } from "next-intl";

import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";
import { buildTopicHref } from "@/lib/locale_utils";
import { useClickTracking } from "@/services/useTracking";
import { getTopics, type TopicWithTemplates } from "@/lib/topicRegistry";

type Props = {
  locale: string;
  activeTopic?: string;
  topics?: string[];
  className?: string;
  showDisabled?: boolean;
  size?: "default" | "small";
};

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

  const visibleTopics = topics?.length
    ? topics
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