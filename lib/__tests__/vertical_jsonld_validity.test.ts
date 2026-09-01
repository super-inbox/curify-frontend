import { describe, expect, it } from "vitest";

import { VERTICAL_SCHEMAS, resolveVerticalForTopics } from "../vertical_schema";
import { buildVerticalJsonLd, resolveVerticalSections } from "../nano_seo_utils";

/**
 * Guards the GSC error that prompted this file:
 *
 *   "Either 'offers', 'review', or 'aggregateRating' should be specified.
 *    Items with this issue are invalid."
 *
 * The `merch` vertical was typed `Product`, which Google treats as a rich-result
 * candidate and rejects unless one of those three is present. Template pages are
 * generators with no price, so the only ways to satisfy it were to invent a price
 * or fabricate ratings — the latter being a manual-action offence. It is now
 * `CreativeWork`, which has no required properties.
 *
 * The trap is how easy this is to reintroduce: `Product` is the intuitive type
 * for anything under a vertical named "merch", and nothing in the type system
 * objects. So the first test asserts the RULE rather than the current value — a
 * future vertical may legitimately use Product, but only if it also emits the
 * field Google requires.
 */

/** schema.org types Google validates as rich results with required fields. */
const REQUIRES_OFFER_LIKE = new Set([
  "Product",
  "SoftwareApplication",
  "WebApplication",
  "Book",
  "Course",
]);
const OFFER_LIKE = ["offers", "review", "aggregateRating"];

/** Build the JSON-LD a page would emit for a vertical, via the public path. */
function jsonLdFor(topics: string[], attributes: Record<string, string> = {}) {
  const templateId = "template-under-test";
  const nanoMessages = {
    [templateId]: { content: { attributes } },
  } as unknown as Parameters<typeof resolveVerticalSections>[2];

  const resolved = resolveVerticalSections(templateId, topics, nanoMessages);
  return buildVerticalJsonLd(resolved, {
    name: "Original Character Sticker Pack Generator",
    url: "https://www.curify-ai.com/nano-template/original-character-sticker-pack",
  });
}

describe("vertical JSON-LD validity", () => {
  it("no vertical declares a rich-result type it cannot satisfy", () => {
    for (const schema of Object.values(VERTICAL_SCHEMAS)) {
      if (!REQUIRES_OFFER_LIKE.has(schema.schemaOrgType)) continue;

      const node = jsonLdFor(schema.topicMatch.slice(0, 1));
      const has = OFFER_LIKE.some((k) => node && k in node);
      expect(
        has,
        `vertical "${schema.id}" declares @type=${schema.schemaOrgType}, which Google rejects ` +
          `without one of ${OFFER_LIKE.join(" / ")}. Either emit one of those, or use a type ` +
          `with no required fields (CreativeWork).`,
      ).toBe(true);
    }
  });

  it("merch renders as CreativeWork and keeps its ontology in additionalProperty", () => {
    const node = jsonLdFor(["stickers", "merch"], {
      material: "Vinyl",
      product_type: "Die-cut sticker pack",
    });

    expect(node?.["@type"]).toBe("CreativeWork");
    // `material` is valid on CreativeWork, so it stays a native property...
    expect(node?.material).toBe("Vinyl");
    // ...`category` is NOT (schema.org scopes it to Product/Service/Invoice/…),
    // so emitting it here would be a second, quieter invalidity.
    expect(node).not.toHaveProperty("category");
    // ...and no ontology value is lost — it survives as a PropertyValue.
    const props = (node?.additionalProperty ?? []) as { name: string; value: string }[];
    expect(props.map((p) => p.value)).toContain("Die-cut sticker pack");
  });

  it("the sticker-pack page that threw the GSC error routes to merch", () => {
    // Topics taken from the live template, so the routing this test guards is the
    // routing that actually produced the invalid markup.
    const v = resolveVerticalForTopics(["stickers", "merch"]);
    expect(v?.id).toBe("merch");
    expect(v?.schemaOrgType).toBe("CreativeWork");
  });
});
