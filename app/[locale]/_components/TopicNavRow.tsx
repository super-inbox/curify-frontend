"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import allTopics from "@/public/data/topics.json";
import { buildTopicHref } from "@/lib/locale_utils";
import { useClickTracking } from "@/services/useTracking";

type TopicRecord = {
  id: string;
  icon?: string;
  priority?: number;
  keywords?: string[];
};

type Props = {
  locale: string;
  activeTopic?: string;
  topics?: string[];
  className?: string;
  showDisabled?: boolean;
  size?: "default" | "small";
};

const DISABLED_TOPICS = new Set(["gaming", "career"]);

function getSortedTopics(): TopicRecord[] {
  return [...(allTopics as TopicRecord[])].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );
}

function getTrendingHref(locale: string) {
  return locale === "en" ? "/inspiration-hub" : `/${locale}/inspiration-hub`;
}

function TopicLink({
  topic,
  href,
  label,
  isActive,
  pillClassName,
}: {
  topic: TopicRecord;
  href: string;
  label: string;
  isActive: boolean;
  pillClassName: string;
}) {
  const trackClick = useClickTracking(topic.id, "topic_capsule");

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        pillClassName,
        isActive
          ? "border border-blue-200 bg-blue-600 text-white transition hover:bg-blue-700"
          : "border border-blue-100 bg-blue-50 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100",
      ].join(" ")}
      onClick={trackClick}
    >
      {label}
    </Link>
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

  const sortedTopics = getSortedTopics();

  const visibleTopics = topics?.length
    ? topics
        .map((id) => sortedTopics.find((topic) => topic.id === id))
        .filter((topic): topic is TopicRecord => Boolean(topic))
    : sortedTopics;

  if (!visibleTopics.length) return null;

  const pillClassName =
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
        const isDisabled = DISABLED_TOPICS.has(topic.id);
        const isActive = activeTopic === topic.id;

        const href =
          topic.id === "trending"
            ? getTrendingHref(locale)
            : buildTopicHref(locale, topic.id);

        const label = t(`${topic.id}.displayName`);

        if (isDisabled && showDisabled) {
          return (
            <span
              key={topic.id}
              className={[
                pillClassName,
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
            pillClassName={pillClassName}
          />
        );
      })}
    </div>
  );
}