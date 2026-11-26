import "../../globals.css";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { API_BASE } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

/**
 * Read-only editorial content must not depend on workspace/auth chunks to render.
 * Unlike SiteShell, this root has no client providers or interactive app chrome.
 * Keep tools and account workflows in their existing layouts.
 */
export default async function EditorialLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // This group currently contains one English-authored article; its page metadata
  // noindexes non-English fallback routes and canonicalizes them to English.
  return <html lang="en"><body>
    <a href="#article-content" className="sr-only focus:not-sr-only">Skip to article</a>
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3">
        <a href="/" className="text-xl font-bold text-purple-800">Curify</a>
        <a href="/blog">Blog</a><a href="/tools">Tools</a>
        <a href="/tools/asl-video-translator">ASL video translator</a>
        <a href="/business">For business</a>
      </nav>
    </header>
    <main id="article-content" className="min-h-screen bg-[#FDFDFD]">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 text-sm text-slate-600">
        <a href="/">Home</a> / <a href="/blog">Blog</a> / ASL resources
      </nav>
      {children}
    </main>
    <footer className="mx-auto flex max-w-7xl flex-wrap gap-5 px-4 py-8 text-sm text-slate-600">
      <a href="/about">About Curify</a><a href="/pricing">Pricing</a>
      <a href="/privacy">Privacy</a><a href="/agreement">Terms</a>
      <a href="/contact">Contact</a>
    </footer>
    {/* A plain optional script cannot reject the React component tree. */}
    <script async src="/editorial-tracking.js" data-track-endpoint={`${API_BASE}/interactions/track`} />
  </body></html>;
}
