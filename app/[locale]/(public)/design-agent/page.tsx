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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DesignAgentClient locale={locale} />;
}
