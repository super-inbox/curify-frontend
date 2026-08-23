/**
 * Unit guards for lib/searchTokenSplit.ts — the single source of truth for
 * breaking a normalized query into primary tokens.
 *
 * The principle being frozen: a user's DELIMITER choice must not change the
 * token set. `facial-expressions`, `facial expressions`, `facial_expressions`,
 * and `facial/expressions` all describe the same thing, so they must tokenize
 * identically. Recall must never depend on whether the corpus happens to spell
 * a compound hyphenated or spaced.
 */

import { describe, it, expect } from "vitest";
import { splitPrimaryTokens } from "../searchTokenSplit";

const NO_STOP = new Set<string>();

describe("splitPrimaryTokens: delimiter invariance", () => {
  const EQUIVALENT: Array<[string, string]> = [
    ["facial-expressions", "facial expressions"],
    ["facial_expressions", "facial expressions"],
    ["facial/expressions", "facial expressions"],
    ["english-chinese", "english chinese"],
    ["before-after", "before after"],
    ["step-by-step", "step by step"],
  ];

  for (const [a, b] of EQUIVALENT) {
    it(`"${a}" == "${b}"`, () => {
      expect(splitPrimaryTokens(a, NO_STOP)).toEqual(splitPrimaryTokens(b, NO_STOP));
    });
  }

  it("splits a hyphenated compound into its multi-char constituents", () => {
    expect(splitPrimaryTokens("facial-expressions", NO_STOP)).toEqual([
      "facial",
      "expressions",
    ]);
  });
});

describe("splitPrimaryTokens: length-1 ASCII fragment guard", () => {
  it("drops single-letter fragments from hyphen splits", () => {
    expect(splitPrimaryTokens("t-shirt", NO_STOP)).toEqual(["shirt"]);
    expect(splitPrimaryTokens("e-commerce", NO_STOP)).toEqual(["commerce"]);
    expect(splitPrimaryTokens("x-ray", NO_STOP)).toEqual(["ray"]);
  });

  it("keeps single CJK characters (bigram path handles them downstream)", () => {
    // A lone Han character is not ASCII, so the length-1 guard leaves it.
    expect(splitPrimaryTokens("猫", NO_STOP)).toEqual(["猫"]);
  });
});

describe("splitPrimaryTokens: stopwords + empties", () => {
  it("removes stopwords and empty fragments", () => {
    const stop = new Set(["the", "of"]);
    expect(splitPrimaryTokens("the-map-of-europe", stop)).toEqual(["map", "europe"]);
  });
});
