import Link from "next/link";
import topics from "@/public/data/topics.json";
import { buildTopicHref, getTopicLabel } from "@/lib/locale_utils";

type TopicRecord = {
  id: string;
  icon?: string;
  priority?: number;
  keywords?: string[];
};

type Props = {
  locale: string;
  translateTopics: (key: string) => string;
  activeTopic?: string;
};

const DISABLED_TOPICS = new Set(["gaming", "career"]);

function getSortedTopics(): TopicRecord[] {
  return [...(topics as TopicRecord[])].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );
}

function getTrendingHref(locale: string) {
  return locale === "en" ? "/inspiration-hub" : `/${locale}/inspiration-hub`;
}

export default function TopicNavRow({
  locale,
  translateTopics,
  activeTopic,
}: Props) {
  const sortedTopics = getSortedTopics();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {sortedTopics.map((topic) => {
        const isDisabled = DISABLED_TOPICS.has(topic.id);
        const isActive = activeTopic === topic.id;

        const href =
          topic.id === "trending"
            ? getTrendingHref(locale)
            : buildTopicHref(locale, topic.id);

        const label = getTopicLabel(topic.id, translateTopics);

        if (isDisabled) {
          return (
            <span
              key={topic.id}
              className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-400 cursor-not-allowed"
              title="Coming soon"
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={topic.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-full border border-blue-200 bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
                : "rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}