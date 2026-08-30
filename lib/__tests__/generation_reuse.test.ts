import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findDuplicate, SIMILARITY_THRESHOLD } from "@/lib/editDistance";

const ROOT = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** Reusing an existing image instead of generating a new one.
 *
 *  findDuplicate has always BLOCKED the redundant generation, so the credits
 *  were never at risk. What was missing is that the user could not SEE the match
 *  — they got a sentence and a link to another page, which made "generate
 *  anyway" (one click) cheaper than looking at what we already had. Carrying the
 *  image URL through is what lets the workbench render it in the result panel. */
describe("generation reuse", () => {
  const params = { subject: "red fox", style: "watercolor" };

  it("carries the image through on an exact params match", () => {
    const hit = findDuplicate("tpl", params, [
      { id: "other", params: { subject: "blue whale", style: "flat" }, imageUrl: "/b.jpg" },
      { id: "match", params, imageUrl: "/a.jpg" },
    ]);
    expect(hit?.score).toBe(1);
    expect(hit?.imageUrl).toBe("/a.jpg");
  });

  it("carries the image through on a near match", () => {
    const hit = findDuplicate("tpl", params, [
      { id: "near", params: { subject: "red fox", style: "watercolour" }, imageUrl: "/near.jpg" },
    ]);
    expect(hit).not.toBeNull();
    expect(hit!.score).toBeGreaterThanOrEqual(SIMILARITY_THRESHOLD);
    expect(hit!.score).toBeLessThan(1);
    expect(hit!.imageUrl).toBe("/near.jpg");
  });

  it("prefers the best match when several clear the threshold", () => {
    const hit = findDuplicate("tpl", params, [
      { id: "worse", params: { subject: "red fox", style: "watercolour" }, imageUrl: "/worse.jpg" },
      { id: "better", params: { subject: "red fox", style: "watercolor" }, imageUrl: "/better.jpg" },
    ]);
    expect(hit?.imageUrl).toBe("/better.jpg");
  });

  it("still matches when the caller supplied no image", () => {
    // The blocking behaviour must not depend on the new field — surfaces that
    // never adopt it keep working exactly as before.
    const hit = findDuplicate("tpl", params, [{ id: "match", params }]);
    expect(hit?.score).toBe(1);
    expect(hit?.imageUrl).toBeUndefined();
  });

  it("returns null below the threshold", () => {
    const hit = findDuplicate("tpl", params, [
      { id: "far", params: { subject: "a completely different subject", style: "3d render" }, imageUrl: "/far.jpg" },
    ]);
    expect(hit).toBeNull();
  });

  /** The feature fails SILENTLY without this: a construction site that omits
   *  imageUrl still blocks the generation, so nothing looks broken — the user
   *  just never sees the match and the reuse path stays unattractive. */
  it("every existingExamples construction site supplies an image", () => {
    const SITES = [
      "app/[locale]/(public)/nano-template/[slug]/page.tsx",
      "app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/page.tsx",
      "app/[locale]/(public)/carousel/template-example/[slug]/[exampleId]/page.tsx",
    ];
    const offenders = SITES.filter((rel) => {
      const src = read(rel);
      const idx = src.indexOf("existingExamples");
      if (idx === -1) return true;
      // The literal is built within a few lines of the binding at every site.
      return !/imageUrl\s*:/.test(src.slice(idx, idx + 900));
    });
    expect(offenders, "these build existingExamples without an imageUrl").toEqual([]);
  });

  it("the workbench renders a reused match into the result panel", () => {
    const src = read("app/[locale]/_components/ReproduceWorkbench.tsx");
    expect(src).toMatch(/onReusedExisting:/);
    // It must land as a PRIMARY, not a derivative: the design-work tiles run off
    // the latest primary, so a reused image has to become the hero or the whole
    // downstream workflow still needs a paid generation to proceed.
    const handler = src.slice(src.indexOf("onReusedExisting:"));
    expect(handler.slice(0, 600)).toMatch(/pushResult\(/);
    expect(handler.slice(0, 600)).toMatch(/"primary"/);
  });
});
