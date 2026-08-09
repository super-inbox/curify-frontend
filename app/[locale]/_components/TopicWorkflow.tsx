import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";
import type { TopicWorkflowConfig } from "@/lib/topic_workflows";

/**
 * Guided commerce-workflow ladder for the merch / product topic pages — the
 * deliverable-ladder analogue of BrandWorkflow. Config-driven (see
 * lib/topic_workflows.ts); each step links to the shipped template that
 * produces it. Server component, no client JS.
 */
export default function TopicWorkflow({
  locale,
  config,
}: {
  locale: string;
  config: TopicWorkflowConfig;
}) {
  return (
    <section className="mt-5">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900">{config.heading}</h2>
        <p className="mt-1 text-sm text-neutral-600">{config.subtitle}</p>

        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {config.steps.map((s) => (
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
                  <span className="text-sm font-semibold text-neutral-900">{s.name}</span>
                </div>
                <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600">{s.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-purple-700">
                  {s.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
