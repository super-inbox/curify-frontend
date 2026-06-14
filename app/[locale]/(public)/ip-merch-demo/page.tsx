import type { Metadata } from "next";
import { getIpMerchSeed } from "@/lib/ip_merch_demo";
import IpMerchDemoClient from "./IpMerchDemoClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Localized metadata. English authoritative; zh for the merch/factory audience;
// other locales fall back to English. noindex (pitch-mode surface).
const META: Record<string, { title: string; description: string }> = {
  en: {
    title: "IP-merch demo — one brief, four stages, full SKU family",
    description:
      "Walkthrough of the 4-template Curify stack for IP-merch design: character canon → 16-piece sticker pack → retail gift-box mockup → full SKU family. Same engine we run with paid factory customers.",
  },
  zh: {
    title: "IP 周边设计演示 —— 一份简报，四个阶段，完整 SKU 家族",
    description:
      "Curify 四模板 IP 周边设计工作流演示：锁定角色设定 → 16 张表情贴纸包 → 零售礼盒样机 → 完整 SKU 家族。与我们为付费工厂客户运行的是同一套引擎。",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale || "en").toLowerCase().split("-")[0];
  const m = META[lang] ?? META.en;
  return { ...m, robots: { index: false, follow: false } };
}

export default async function IpMerchDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <IpMerchDemoClient seed={getIpMerchSeed(locale)} />;
}
