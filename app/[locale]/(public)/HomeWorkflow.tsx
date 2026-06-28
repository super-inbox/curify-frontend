import { Search, ScanSearch, Sparkles, Printer, Globe, type LucideIcon } from "lucide-react";

/**
 * Workflow strip — the "you're here to finish a job, not make an image" story
 * (per docs/positioning-solutions-and-site-ia.md, Workflow-not-Model framing).
 * Five steps from idea to scaled content, each naming the Curify capability that
 * powers it. Server component (static copy + icons, no interactivity).
 */
type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const STEPS: Step[] = [
  { icon: Search, title: "Find inspiration", desc: "Search the gallery and asset library." },
  { icon: ScanSearch, title: "Understand designs", desc: "Extract reusable subjects, text & style tags." },
  { icon: Sparkles, title: "Create visuals", desc: "Generate from AI templates and prompts." },
  { icon: Printer, title: "Adapt for production", desc: "Typography, print-ready files & product mockups." },
  { icon: Globe, title: "Scale globally", desc: "Translate, localize & distribute via SEO + API." },
];

export default function HomeWorkflow() {
  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          One workflow, end to end.
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          From a single idea to production-ready content, in any language.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className="relative flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-neutral-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm font-bold text-neutral-900">{s.title}</span>
              <span className="text-xs leading-snug text-neutral-600">{s.desc}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
