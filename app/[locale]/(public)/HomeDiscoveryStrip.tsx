// Two chip rows rendered at the bottom of the home page so the
// homepage finally links to /topics/* and /use-cases/* — the W1
// indexation rescue from docs/wedge1-indexation-rescue-scope-2026-06-26.md.
// Before this, the audit found the home had ZERO outbound links to
// either family, which explained the 17% indexation rate on 1,740
// topic hubs and the 10% rate on 100 use-case pages.
//
// Topic chips are picked server-side by template count (the proxy for
// authority + breadth), capped at 36 — wide enough to flow PageRank
// across the tier-1/2/3 surface, narrow enough to avoid the
// Helpful-Content thin-link risk Canva/Pinterest can absorb but a
// smaller site can't.

import { getTranslations } from "next-intl/server";

import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import { getTopics } from "@/lib/topicRegistry";
import { isFullyLocalizedTopic } from "@/lib/topicRegistry_pure";

const TOPIC_LIMIT = 36;

export default async function HomeDiscoveryStrip({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.discovery" });

  // Filter to FULLY-localized topics (have .title in messages/en/topics.json),
  // not just LOCALIZED (which only requires the top-level entry to exist).
  // The 27 stub topics with only .displayName render fine as chips but trip a
  // missing-message warning on the destination topic page when it tries
  // topics.<slug>.title — caught + falls back, but noisy in dev.
  const topics = getTopics()
    .filter((tp) => tp.isEnabled && isFullyLocalizedTopic(tp.id))
    .sort((a, b) => b.templateCount - a.templateCount)
    .slice(0, TOPIC_LIMIT)
    .map((tp) => ({ id: tp.id, isEnabled: tp.isEnabled }));

  return (
    <section className="mt-12 w-full max-w-[1400px]">
      <div className="mb-3 pl-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
          {t("topicsTitle")}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{t("topicsSubtitle")}</p>
      </div>
      <TopicNavRow locale={locale} allTopics={topics} showDisabled={false} />

      <div className="mt-10 mb-3 pl-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
          {t("useCasesTitle")}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{t("useCasesSubtitle")}</p>
      </div>
      <UseCaseChipsRow />
    </section>
  );
}
