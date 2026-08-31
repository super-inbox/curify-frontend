import { hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickClientMessages, blogArticleNamespacesForPath } from "@/lib/client-messages";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

import { headers } from "next/headers";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import SiteShell from "../_layout_components/SiteShell";

/**
 * ⚠️ This layout reads `headers()`, which forces DYNAMIC rendering for every
 * route beneath it. That is deliberate here and must stay scoped: 21 blog posts
 * under this group export no metadata at all and depend entirely on the
 * path-derived canonical below, and the client-payload trim needs the route to
 * pick a blog article's namespace.
 *
 * High-volume programmatic routes (tools, topics, nano-template, carousel,
 * nano-banana-pro-prompts, use-cases, personality) declare their OWN canonical,
 * so they live in the sibling `(static)` group and render statically. Do not
 * move a route back here without giving it a page-level canonical first.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "";

  return {
    alternates: {
      canonical: getCanonicalUrl(locale, pathWithoutLocale),
      languages: getLanguagesMap(pathWithoutLocale),
    },
    title: {
      template: "%s | Curify Studio",
      default: "Curify Studio",
    },
    description:
      "Curify is an AI-native platform helping creators, educators, and media teams produce and localize videos, manga, and presentations at scale.",
  };
}

export default async function PublicLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  // Trim blog bodies + nano from the CLIENT payload (server rendering unaffected).
  // Prevents the ~1.6MB catalog from being serialized into every page (was
  // folding ~44 blogs into the homepage canonical as near-duplicates). Scoped to
  // the current route so a blog page carries only its own article body and every
  // other page carries none — generateMetadata above already reads headers(), so
  // this adds no rendering cost.
  const pathname = (await headers()).get("x-pathname");
  const clientMessages = pickClientMessages(
    messages,
    blogArticleNamespacesForPath(pathname)
  );

  return (
    <SiteShell locale={locale} clientMessages={clientMessages}>
      {children}
    </SiteShell>
  );
}
