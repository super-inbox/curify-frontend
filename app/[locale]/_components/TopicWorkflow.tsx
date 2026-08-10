import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";
import { makeSafeTranslator } from "@/lib/locale_utils";
import type { TopicWorkflowConfig } from "@/lib/topic_workflows";

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
          {topicHref ? (
            <Link
              href={getCanonicalPath(locale, topicHref)}
              className="shrink-0 whitespace-nowrap text-sm font-semibold text-purple-700 hover:text-purple-900"
            >
              {t("topicWorkflows.seeFull") || "See full workflow →"}
            </Link>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>

        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {config.steps.map((s) => {
            const name = t(`${base}.steps.${s.key}.name`) || s.name;
            const desc = t(`${base}.steps.${s.key}.desc`) || s.desc;
            const cta = t(`${base}.steps.${s.key}.cta`) || s.cta;
            return (
              <li key={s.key} className="h-full">
                <Link
                  href={getCanonicalPath(locale, s.href)}
                  className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-3.5 transition hover:border-purple-300 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                      {s.n}
                    </span>
                    <span className="text-lg" aria-hidden>
                      {s.emoji}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">{name}</span>
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600">{desc}</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-purple-700">
                    {cta} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
