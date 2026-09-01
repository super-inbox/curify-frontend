import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { pickClientMessages, NON_BLOG_CLIENT_NAMESPACES } from "@/lib/client-messages";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

import SiteShell from "../_layout_components/SiteShell";

/**
 * Statically-rendered half of the public site.
 *
 * Renders the same chrome as `(public)` (both delegate to `SiteShell`) but
 * touches NO dynamic API — no `headers()`, no `cookies()`. That is the entire
 * point of the group: reading a request header anywhere in a segment tree opts
 * every route beneath it into dynamic rendering, and the `(public)` layout's
 * `headers()` call was silently defeating the `revalidate = false` +
 * `generateStaticParams` these pages already declare. Prod served every URL
 * `cache-control: private, no-cache, no-store` + `x-vercel-cache: MISS` at
 * 4-14s TTFB, which is the crawl-budget drag behind the "Discovered - currently
 * not indexed" backlog.
 *
 * Entry requirement: a route may only live here if its page exports its OWN
 * `alternates.canonical`. There is deliberately no path-derived canonical in
 * this layout, because a layout cannot know the child pathname without reading
 * a header — which is what we are avoiding.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      template: "%s | Curify Studio",
      default: "Curify Studio",
    },
    description:
      "Curify is an AI-native platform helping creators, educators, and media teams produce and localize videos, manga, and presentations at scale.",
  };
}

export default async function StaticLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Required by next-intl for static rendering: without it the request locale
  // is resolved from a header and the tree falls back to dynamic.
  setRequestLocale(locale);

  const messages = await getMessages();
  // No route in this group renders a blog article body, so the client payload
  // carries zero article bodies — the same result the `(public)` layout gets
  // from `blogArticleNamespacesForPath()` on a non-blog path, without the header.
  const clientMessages = pickClientMessages(messages, NON_BLOG_CLIENT_NAMESPACES);

  return (
    <SiteShell locale={locale} clientMessages={clientMessages}>
      {children}
    </SiteShell>
  );
}
