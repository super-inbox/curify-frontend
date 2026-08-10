import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { BLOG_ROUTE_ARTICLE_NAMESPACES } from "@/lib/blog-client-namespaces.generated";

// Metadata for blog posts served by a DEDICATED route rather than [slug].
//
// WHY THIS EXISTS (2026-08-10)
// ----------------------------
// ~30 posts have their own route folder because they render a bespoke client
// component. Those folders bypass [slug]/page.tsx `generateMetadata`, so unless
// the folder supplies its own metadata the page inherits the (public) layout's
// default — and ships the BLOG-INDEX title. Measured on production: 10 of the 20
// folders without metadata were serving
//   "Curify Blog | AI Video Generation & Content Creation | Curify Studio"
// as the <title> of a specific article. `/blog/best-programmatic-seo-tools` is
// the costly one: KD 10, $8.98 CPC, and we sat at position 24 while telling
// Google the page was about AI video generation.
//
// The pre-existing workaround (a per-folder layout.tsx exporting a static
// `metadata` object, as in best-ai-tools/) has two defects this replaces:
//   1. the title/description are hardcoded ENGLISH on every locale, and
//   2. it emits no `alternates`, so dedicated routes lose the hreflang map that
//      [slug] emits via getLanguagesMap.
//
// Titles are read from the post's own i18n namespace — resolved through the
// generated slug→namespace map that already backs the client-payload trim, so
// there is one source of truth and adding a post cannot silently skip metadata.
// Regenerate that map with `node scripts/scan_blog_client_namespaces.cjs`.

/** Lightweight fields a blog namespace is expected to carry. */
type Params = { locale: string };

/**
 * Build `generateMetadata` for a dedicated blog route.
 *
 * Usage — add `layout.tsx` beside the route's `page.tsx`:
 *
 *   import { dedicatedBlogMetadata } from "../_dedicated-metadata";
 *   export const generateMetadata = dedicatedBlogMetadata("my-slug");
 *   export default function Layout({ children }) { return children; }
 *
 * Returns canonical + hreflang always; title/description when the namespace
 * supplies them. If the slug has no mapped namespace we still emit the
 * alternates rather than throwing — a wrong title is bad, but a route that
 * 500s is worse.
 */
export function dedicatedBlogMetadata(slug: string, imagePath?: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<Params>;
  }): Promise<Metadata> {
    const { locale } = await params;

    const alternates = {
      canonical: getCanonicalUrl(locale, `/blog/${slug}`),
      languages: getLanguagesMap(`/blog/${slug}`),
    };

    const namespace = BLOG_ROUTE_ARTICLE_NAMESPACES[slug]?.[0];
    if (!namespace) return { alternates };

    try {
      const t = await getTranslations({ locale, namespace });
      const title = t.has("title") ? t("title") : undefined;
      const description = t.has("metaDescription") ? t("metaDescription") : undefined;
      if (!title) return { alternates };

      return {
        title,
        description,
        alternates,
        openGraph: {
          title,
          ...(description ? { description } : {}),
          ...(imagePath ? { images: [imagePath] } : {}),
        },
      };
    } catch {
      // A missing/!malformed locale catalog must not take the route down.
      return { alternates };
    }
  };
}
