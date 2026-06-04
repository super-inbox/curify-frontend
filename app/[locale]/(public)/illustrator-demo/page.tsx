import type { Metadata } from "next";
import { ILLUSTRATOR_DEMO_SEED } from "@/lib/illustrator_demo";
import IllustratorDemoClient from "./IllustratorDemoClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Illustrator demo — pick a style, scale to a series",
  description:
    "Live demo: a hand-drawn sketch grid → 4 finished aesthetic candidates → lock one style → batch-render the same subject across variations.",
  robots: { index: false, follow: false },
};

export default async function IllustratorDemoPage() {
  return <IllustratorDemoClient seed={ILLUSTRATOR_DEMO_SEED} />;
}
