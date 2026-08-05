// Trims the i18n message catalog before it is serialized into the client RSC
// payload. Blog article BODIES (blog.<ns>.intro/step/conclusion…) and the entire
// `nano` namespace are rendered ONLY by SERVER components (getTranslations), but
// NextIntlClientProvider was serializing the WHOLE catalog (~1.6MB, byte-identical
// on every page) into each page's HTML. Googlebot saw ~90% identical pages and
// folded 44/103 blogs into the homepage canonical as near-duplicates. Server
// rendering reads the full catalog independently, so trimming the client copy is
// safe. Client blog components (blog index, related-blogs) read only
// `blog.<ns>.title` + UI strings — preserved here.

type Msg = string | Msg[] | { [k: string]: Msg };
type Messages = { [k: string]: Msg };

// Lightweight fields the client legitimately needs from a blog-article namespace.
const LIGHT = new Set([
  "title", "metaDescription", "date", "readTime", "category", "excerpt",
  "subtitle", "ogImage", "keywords", "seoKeywords", "author", "tag", "tags",
]);
// Presence of any of these ⇒ the object is a heavy blog article body.
// Blog-specific body fields ONLY. Deliberately excludes generic "intro"/"content"
// which also appear on non-blog namespaces (e.g. topics.<x>.intro) — matching those
// would wrongly strip topics.<x>.displayName (caused MISSING_MESSAGE, fixed here).
const HEAVY_MARKERS = [
  "whatIsContent", "conclusionContent", "challengesContent", "curifyContent",
  "step1Content", "step2Content", "modelsContent", "howContent", "conclusionTitle",
];

function isArticle(v: Msg): v is { [k: string]: Msg } {
  return (
    !!v && typeof v === "object" && !Array.isArray(v) &&
    typeof (v as { title?: unknown }).title === "string" &&
    HEAVY_MARKERS.some((k) => k in (v as object))
  );
}
function lighten(v: { [k: string]: Msg }): { [k: string]: Msg } {
  const o: { [k: string]: Msg } = {};
  for (const k of Object.keys(v)) if (LIGHT.has(k)) o[k] = v[k];
  return o;
}

/** Return a client-safe subset of `messages`: drops `nano`, strips blog-article
 *  bodies to lightweight fields, leaves every other namespace fully intact. */
export function pickClientMessages<T extends Record<string, unknown>>(messages: T): T {
  const src = messages as unknown as Messages;
  const out: Messages = {};
  for (const [k, v] of Object.entries(src)) {
    if (k === "nano") continue; // server-only (verified: 0 client references)
    if (isArticle(v)) {
      out[k] = lighten(v);
      continue;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // Container namespace (e.g. `blog`): reduce article children, keep the rest.
      // Cast the entries value to Msg — TS doesn't flow the recursive Msg union
      // through Object.entries here, so it widens to `unknown` without this.
      const inner: { [k: string]: Msg } = {};
      for (const [ik, iv] of Object.entries(v) as [string, Msg][])
        inner[ik] = isArticle(iv) ? lighten(iv) : iv;
      out[k] = inner;
      continue;
    }
    out[k] = v;
  }
  return out as unknown as T;
}
