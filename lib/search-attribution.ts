/** Preserve existing query parameters and fragments on internal search destinations. */
export function withSearchAttribution(href: string, query: string): string {
  const url = new URL(href, "https://www.curify-ai.com");
  url.searchParams.set("from_search", query);
  return `${url.pathname}${url.search}${url.hash}`;
}
