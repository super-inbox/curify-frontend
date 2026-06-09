import type { Metadata } from "next";
import { IP_MERCH_DEMO_SEED } from "@/lib/ip_merch_demo";
import IpMerchDemoClient from "./IpMerchDemoClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IP-merch demo — one brief, four stages, full SKU family",
  description:
    "Walkthrough of the 4-template Curify stack for IP-merch design: character canon → 16-piece sticker pack → retail gift-box mockup → full SKU family. Same engine we run with paid factory customers.",
  robots: { index: false, follow: false },
};

export default function IpMerchDemoPage() {
  return <IpMerchDemoClient seed={IP_MERCH_DEMO_SEED} />;
}
