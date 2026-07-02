import type { Metadata } from "next";
import { Suspense } from "react";
import BracketClient from "./BracketClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "Fill your 2026 World Cup bracket | Curify";
  const description =
    "Interactive World Cup 2026 bracket picker. Tap teams to advance them through R16, QF, SF, and the Final. Share your prediction with a single link.";
  const path = locale === "en" ? "/wc-bracket" : `/${locale}/wc-bracket`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://curify-ai.com${path}`,
      type: "website",
    },
    alternates: { canonical: path },
  };
}

export default async function WcBracketPage({ params }: Props) {
  const { locale } = await params;
  return (
    <main className="min-h-screen bg-neutral-50">
      <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading bracket…</div>}>
        <BracketClient locale={locale} />
      </Suspense>
    </main>
  );
}
