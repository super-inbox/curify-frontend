import publishedExamples from "./pinterest-examples.json";

/** Rescue legacy template links only when a known Pin identifies an exact image.
 * A topic URL without utm_content is ambiguous and must not guess an example.
 * Keep this small allowlist at the edge instead of loading the image corpus.
 */
export function pinterestExampleRedirect(url: URL, locales: readonly string[]): URL | null {
  if (url.searchParams.get("utm_source")?.toLowerCase() !== "pinterest") return null;
  const id = url.searchParams.get("utm_content");
  if (!id || !Object.hasOwn(publishedExamples, id)) return null;
  const slug = (publishedExamples as Record<string, string>)[id];
  const parts = url.pathname.split("/").filter(Boolean);
  const locale = locales.includes(parts[0]) ? parts.shift() : undefined;
  if (parts.length !== 2 || parts[0] !== "nano-template" || parts[1] !== slug) return null;
  const result = new URL(url.href);
  result.pathname = `${locale ? `/${locale}` : ""}/nano-template/${slug}/example/${encodeURIComponent(id)}`;
  return result;
}
