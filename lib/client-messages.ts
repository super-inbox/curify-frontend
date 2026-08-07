// Trims the i18n message catalog before it is serialized into the client RSC
// payload. Blog article BODIES and the entire `nano` namespace are rendered ONLY
// by SERVER components (getTranslations), but NextIntlClientProvider was
// serializing the WHOLE catalog (~1.6MB, byte-identical on every page) into each
// page's HTML. Googlebot saw ~90% identical pages and folded 44/103 blogs into
// the homepage canonical as near-duplicates. Server rendering reads the full
// catalog independently, so trimming the client copy is safe.
//
// ⚠️ The exception that bit us: ~21 posts render their body through a dedicated
// CLIENT component (useTranslations("blog.<ns>")). The first version of this
// trim identified articles by sniffing field names (whatIsContent, step1Content,
// …) and stripped 7 of those namespaces, so 6 live posts rendered raw i18n keys
// instead of prose (/blog/ai-video-dubbing-tutorial shipped 91 of them).
//
// The field-name guess is gone. `lib/blog-client-namespaces.generated.ts` is
// produced by scanning the source for every client component that reads a blog
// namespace — a namespace a client reads is never stripped. Regenerate it with
// `node scripts/scan_blog_client_namespaces.cjs` (`--check` in CI) after adding
// a post with a dedicated client component.
//
// Those ~21 client-read articles (~217KB) must not ride along on the other
// ~20k pages, so callers pass the CURRENT ROUTE's namespaces via
// `blogArticleNamespacesForPath()` — a blog page ships its own (unique) body and
// nothing else ships any. This reads `x-pathname` (set by middleware) in the
// layout, which is free here: the (public) layout's generateMetadata already
// calls headers(), so the tree is dynamically rendered either way (verified on
// prod: `cache-control: private, no-cache` + `x-vercel-cache: MISS`). Note a
// nested NextIntlClientProvider is NOT an alternative — use-intl's IntlProvider
// REPLACES `messages` instead of merging with the parent, so shared children
// (RelatedBlogs, BlogCTACard, AutoTableOfContents) would lose their namespaces.

import { routing } from "@/i18n/routing";
import {
  ALL_CLIENT_ARTICLE_NAMESPACES,
  ARTICLE_NAMESPACES,
  BLOG_ROUTE_ARTICLE_NAMESPACES,
  GLOBAL_CLIENT_ARTICLE_NAMESPACES,
  KNOWN_BLOG_SLUGS,
} from "./blog-client-namespaces.generated";

type Msg = string | Msg[] | { [k: string]: Msg };
type Messages = { [k: string]: Msg };

/** Lightweight fields the client legitimately needs from a blog-article
 *  namespace (blog index cards, RelatedBlogs, BlogRelatedHubs read these). */
const LIGHT = new Set([
  "title", "metaDescription", "date", "readTime", "category", "excerpt",
  "subtitle", "ogImage", "keywords", "seoKeywords", "author", "tag", "tags",
]);

const ARTICLES = new Set(ARTICLE_NAMESPACES);
const DEFAULT_KEEP = new Set([
  ...ALL_CLIENT_ARTICLE_NAMESPACES,
  ...GLOBAL_CLIENT_ARTICLE_NAMESPACES,
]);
const LOCALES = new Set<string>(routing.locales as readonly string[]);
const KNOWN_SLUGS = new Set(KNOWN_BLOG_SLUGS);

/**
 * Which blog article namespaces the client payload must carry for `pathname`.
 *
 * Non-blog routes get only the references we could not pin to a route (normally
 * none), so ~20k pages ship zero article bodies. A blog route gets its own
 * article; an unrecognised blog slug falls back to the full client-read set so a
 * newly added post can never render raw i18n keys — regenerate the map with
 * `node scripts/scan_blog_client_namespaces.cjs` to make it lean again.
 *
 * @param pathname the `x-pathname` request header (locale prefix optional).
 */
export function blogArticleNamespacesForPath(pathname: string | null | undefined): string[] {
  const globals = GLOBAL_CLIENT_ARTICLE_NAMESPACES;
  if (!pathname) return [...globals, ...ALL_CLIENT_ARTICLE_NAMESPACES]; // unknown → safe
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && LOCALES.has(segments[0])) segments.shift();
  if (segments[0] !== "blog") return globals;
  const slug = segments[1];
  if (!slug) return globals; // /blog index — titles only, which LIGHT keeps
  const own = BLOG_ROUTE_ARTICLE_NAMESPACES[slug];
  if (own) return [...globals, ...own];
  // Known route with no client article component ⇒ it needs none. Only a slug
  // the scan has never seen falls back to shipping every client-read article.
  if (KNOWN_SLUGS.has(slug)) return globals;
  return [...globals, ...ALL_CLIENT_ARTICLE_NAMESPACES];
}

function lighten(v: Msg): Msg {
  if (!v || typeof v !== "object" || Array.isArray(v)) return v;
  const o: { [k: string]: Msg } = {};
  for (const k of Object.keys(v)) if (LIGHT.has(k)) o[k] = (v as { [k: string]: Msg })[k];
  return o;
}

/**
 * Return a client-safe subset of `messages`: drops `nano`, reduces blog article
 * bodies to lightweight fields, and leaves every other namespace fully intact.
 *
 * @param keep namespaces to preserve in full ("blog.<ns>" or a top-level
 *   article namespace). Defaults to every namespace a client component reads,
 *   which is always correct — pass a narrower set only when the caller knows
 *   which route is rendering.
 */
export function pickClientMessages<T extends Record<string, unknown>>(
  messages: T,
  keep: Iterable<string> = DEFAULT_KEEP
): T {
  const keepSet = keep === DEFAULT_KEEP ? DEFAULT_KEEP : new Set(keep);
  const src = messages as unknown as Messages;
  const out: Messages = {};

  for (const [k, v] of Object.entries(src)) {
    // Server-only namespaces. `nano` has 0 client references; `nanoPromptsTags`
    // (~41KB) is read only by the tag route's server page via getMessages().
    if (k === "nano" || k === "nanoPromptsTags") continue;

    // Legacy top-level article namespaces (aiPlatform, SceneDetection, …).
    if (ARTICLES.has(k)) {
      out[k] = keepSet.has(k) ? v : lighten(v);
      continue;
    }

    // The `blog` container: reduce article children, leave UI children alone.
    if (k === "blog" && v && typeof v === "object" && !Array.isArray(v)) {
      const inner: { [k: string]: Msg } = {};
      for (const [ik, iv] of Object.entries(v) as [string, Msg][]) {
        const ns = `blog.${ik}`;
        inner[ik] = ARTICLES.has(ns) && !keepSet.has(ns) ? lighten(iv) : iv;
      }
      out[k] = inner;
      continue;
    }

    out[k] = v;
  }
  return out as unknown as T;
}
