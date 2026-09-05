import { describe, it, expect } from "vitest";

import nanoInspiration from "@/public/data/nano_inspiration.json";

// Guards the bug class behind 225 indexed example URLs that returned 404.
//
// generateStaticParams (nano-template/[slug]/example/[exampleId]) must return
// the DECODED param value — Next encodes each segment itself when it builds the
// static path. It used to return encodeURIComponent(id), so any id containing a
// space got double-encoded: the prerendered route was ".../…-en%25203" while the
// sitemap (and Google) asked for ".../…-en%203". en/zh are the only locales in
// generateStaticParams, so exactly those two 404'd and every on-demand locale
// resolved fine — which is what made it look like a locale bug.
const ids = (nanoInspiration as Array<{ id?: string }>)
  .map((i) => i?.id)
  .filter((x): x is string => typeof x === "string" && x.length > 0);

/** What app/sitemap-examples.xml/route.ts puts in the <loc>. */
const sitemapSegment = (id: string) => encodeURIComponent(id);
/** What Next materialises from a generateStaticParams value. */
const builtSegment = (param: string) => encodeURIComponent(param);

describe("example route params round-trip to the URL we advertise", () => {
  it("has a non-trivial corpus to check", () => {
    expect(ids.length).toBeGreaterThan(3000);
  });

  it("every id's static param produces the sitemap's URL segment", () => {
    const broken = ids.filter((id) => builtSegment(id) !== sitemapSegment(id));
    expect(broken).toEqual([]);
  });

  it("pre-encoding the param would break the ids that actually broke", () => {
    // Pins the diagnosis: 67 space-bearing ids fail under the old code, and the
    // single apostrophe id passes (encodeURIComponent leaves "'" alone) —
    // exactly the 1-works / 67-fail split observed in production.
    const brokenUnderOldCode = ids.filter(
      (id) => builtSegment(encodeURIComponent(id)) !== sitemapSegment(id)
    );
    expect(brokenUnderOldCode.length).toBe(67);
    expect(brokenUnderOldCode.every((id) => id.includes(" "))).toBe(true);
  });
});
