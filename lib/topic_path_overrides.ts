// Slug → destination override map. When a topic slug has a stronger
// use-case landing than its generic /topics/<slug> hub, route there
// instead. Applied SITE-WIDE everywhere TopicStrip / chip-based
// browsers consume topic slugs (home strip, /topics/<slug> bottom,
// /search related-topics, etc.).
//
// The slug itself is NOT changed — it stays the identity key for
// color / thumbnail / tracking. Only the click target moves.
//
// To add an override: extend this map. Keep the comment explaining
// WHY the override beats the default — these are routing exceptions,
// not data normalizations.
export const TOPIC_PATH_OVERRIDES: Record<string, string> = {
  // No overrides at the moment. The earlier design → /use-cases/for-
  // designers redirect was reverted on 2026-06-29 — the entry-bar
  // "Posters & Designs" tile should route to /topics/design, since
  // that hub is what the label implies + the use-case landing is one
  // hop away via the related-use-cases chips on the topic page.
  //
  // To add a future override: { slug: "/destination/path" } — keep a
  // comment explaining WHY the override beats the /topics/<slug> default.
};

/**
 * Resolve a topic slug to its click target.
 * - If the slug is overridden, returns the override path.
 * - Otherwise returns the generic `/topics/<slug>` hub path.
 *
 * Returned path is locale-prefix-free — callers wrap via
 * getCanonicalPath(locale, path).
 */
export function resolveTopicPath(slug: string): string {
  return TOPIC_PATH_OVERRIDES[slug] ?? `/topics/${slug}`;
}
