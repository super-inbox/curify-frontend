import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";
import RunWorkflowComingSoon from "./RunWorkflowComingSoon";
import WorkflowStepLink from "./WorkflowStepLink";
import { makeSafeTranslator } from "@/lib/locale_utils";
import type { TopicWorkflowConfig } from "@/lib/topic_workflows";
import { requiresDirection } from "@/lib/agent/direction";
import { getStepThumbnail } from "@/lib/template_thumbnails";

/**
 * Guided commerce-workflow ladder for the merch / product topic pages — the
 * deliverable-ladder analogue of BrandWorkflow. Config-driven (see
 * lib/topic_workflows.ts); each step links to the shipped template that
 * produces it. Copy is localized via the `topicWorkflows.<key>` message
 * namespace (messages/<locale>/home.json), with the config's English strings
 * as inline fallbacks so it renders even before a locale is translated.
 */
export default async function TopicWorkflow({
  locale,
  config,
  topicHref,
}: {
  locale: string;
  config: TopicWorkflowConfig;
  /** When set, the heading links to the topic page carrying the full guided
   *  version (used on the home "Design workflows" section). */
  topicHref?: string;
}) {
  const tRoot = await getTranslations({ locale });
  const t = makeSafeTranslator(tRoot);
  const base = `topicWorkflows.${config.key}`;

  const heading = t(`${base}.heading`) || config.heading;
  const subtitle = t(`${base}.subtitle`) || config.subtitle;

  return (
    <section className="mt-5">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-neutral-900">
            {topicHref ? (
              <Link
                href={getCanonicalPath(locale, topicHref)}
                className="hover:text-purple-700"
              >
                {heading}
              </Link>
            ) : (
              heading
            )}
          </h2>
          {/* Primary action sits top-right, where the "see full workflow" link
              used to be: running the ladder is the point of the section, and a
              secondary navigation link competing for that slot buried it. */}
          {/* Resolves to an in-place coming-soon message instead of routing to
              /design-agent, which is not ready. Clicks are tracked as demand
              signal per domain — see RunWorkflowComingSoon. */}
          <RunWorkflowComingSoon domain={config.domain} />
        </div>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>

        {/* Copy states cost, and only promises a direction step where one
            actually fires. It previously claimed "you confirm the creative
            direction first" on every ladder, which is false for education (no
            gate) and for any run that arrives with a reference image. */}
        <p className="mt-1 text-xs text-neutral-500">
          {t("topicWorkflows.runAllHint") ||
            `Review the brief first — ${config.steps.length} steps, ~${config.steps.length * 10} credits${
              requiresDirection(config.domain, false)
                ? ", and you pick a creative direction before anything is generated"
                : ""
            }. Or start from any single step below.`}
        </p>

        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {config.steps.map((s) => {
            const name = t(`${base}.steps.${s.key}.name`) || s.name;
            const desc = t(`${base}.steps.${s.key}.desc`) || s.desc;
            const cta = t(`${base}.steps.${s.key}.cta`) || s.cta;
            return (
              <li key={s.key} className="h-full">
                <WorkflowStepLink
                  href={getCanonicalPath(locale, s.href)}
                  trackId={`home-workflow-step:${config.domain}:${s.key}`}
                  n={s.n}
                  emoji={s.emoji}
                  thumbnail={getStepThumbnail(s.href)}
                  name={name}
                  desc={desc}
                  cta={cta}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
