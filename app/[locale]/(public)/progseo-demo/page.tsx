import type { Metadata } from "next";
import { PROGSEO_QUERIES } from "@/lib/progseo_demo";
import ProgSeoDemoClient from "./ProgSeoDemoClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ProgSEO demo — long-tail SEO image generation",
  description:
    "Live demo: type a long-tail SEO query, see Curify match it to template(s), and generate a unique image.",
  robots: { index: false, follow: false },
};

export default async function ProgSeoDemoPage() {
  return <ProgSeoDemoClient entries={PROGSEO_QUERIES} />;
}
