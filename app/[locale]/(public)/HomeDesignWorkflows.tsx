import { getTranslations } from "next-intl/server";
import { makeSafeTranslator } from "@/lib/locale_utils";
import { HOME_WORKFLOWS } from "@/lib/topic_workflows";
import TopicWorkflow from "@/app/[locale]/_components/TopicWorkflow";

/**
 * Home "Design workflows" section — renders each commerce / design workflow
 * (brand, edtech, merch, e-commerce, packaging) in the SAME ladder shape used
 * on the topic pages (TopicWorkflow), with the heading linking to the topic
 * page that carries the full guided version. Server component (TopicWorkflow
 * is async) — passed into HomeClient as a prop from the home page.
 */
export default async function HomeDesignWorkflows({ locale }: { locale: string }) {
  const tRoot = await getTranslations({ locale });
  const t = makeSafeTranslator(tRoot);

  return (
    <section className="mt-12 w-full max-w-[1600px]">
      <div className="pl-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
          {t("home.workflowRows.title") || "Design workflows"}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {t("home.workflowRows.subtitle") ||
            "Chain our templates into a complete deliverable — pick a workflow to start."}
        </p>
      </div>

      <div className="mt-1 space-y-1">
        {HOME_WORKFLOWS.map(({ config, topicHref }) => (
          <TopicWorkflow
            key={config.key}
            locale={locale}
            config={config}
            topicHref={topicHref}
          />
        ))}
      </div>
    </section>
  );
}
