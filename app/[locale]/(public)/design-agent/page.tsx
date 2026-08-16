import type { Metadata } from "next";
import DesignAgentClient from "./DesignAgentClient";

// Design-agent demo. Kept noindex: it is an internal architecture demo, not an
// SEO surface, and it dispatches real (credit-consuming) generation jobs.
export const metadata: Metadata = {
  title: "Design Agent — Curify",
  description:
    "Describe a design task with text and an optional reference image; the agent routes it, shows its plan, and executes it step by step.",
  robots: { index: false, follow: false },
};

export default async function DesignAgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ workflow?: string; q?: string }>;
}) {
  const { locale } = await params;
  // Context handed over by a one-click workflow entry (topic page / home
  // ladder). `workflow` names a ladder in WORKFLOWS_BY_DOMAIN and is validated
  // server-side in buildAgentPlan; `q` seeds the brief for the fallback path.
  const { workflow, q } = await searchParams;
  return <DesignAgentClient locale={locale} initialWorkflow={workflow} initialQuery={q} />;
}
