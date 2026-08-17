import { promises as fs } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBrandDirectionCase } from "../brand_direction_explorer";

// lib/brandDirectionOpenAI.ts starts with `import "server-only"`, which
// throws unconditionally under Node's default resolve conditions (it only
// resolves to its inert `empty.js` under Next.js's "react-server" bundler
// condition). Stubbing it out is the standard way to unit-test a
// server-only-guarded module — the guard itself (and its build-time
// enforcement inside Next.js) is untouched in production code.
vi.mock("server-only", () => ({}));

const mockCreate = vi.fn();

class MockAPIError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}
class MockRateLimitError extends MockAPIError {
  constructor(message = "rate limited") {
    super(message, 429);
  }
}
class MockAPIConnectionTimeoutError extends MockAPIError {
  constructor(message = "timeout") {
    super(message);
  }
}

vi.mock("openai", () => {
  class MockOpenAI {
    chat = { completions: { create: (...args: unknown[]) => mockCreate(...args) } };
    constructor(_config: unknown) {}
    static APIError = MockAPIError;
    static RateLimitError = MockRateLimitError;
    static APIConnectionTimeoutError = MockAPIConnectionTimeoutError;
  }
  return { default: MockOpenAI };
});

const coffeeCase = getBrandDirectionCase("coffee-opening")!;
const COFFEE_FULL_FIELDS = {
  shopName: "Maple & Grind",
  openingDate: "March 15, 2026",
  location: "123 Main Street",
  offerDetails: "Free pastry with any drink",
};
const eventCase = getBrandDirectionCase("event-poster")!;

function chatResponse(content: string) {
  return { choices: [{ message: { content }, finish_reason: "stop" }] };
}

function validDirectionsPayload(ids: [string, string, string] = ["a", "b", "c"]) {
  return JSON.stringify({
    directions: ids.map((id) => ({
      id,
      title: { en: `Title ${id}`, zh: `标题 ${id}` },
      subtitle: { en: `Subtitle ${id}`, zh: `副标题 ${id}` },
      description: { en: `Description ${id}`, zh: `描述 ${id}` },
      styleTags: ["warm", "editorial"],
      promptModifier:
        "Composition: a detailed test scene description that is long enough. " +
        "Palette: warm tones. Materials: paper and wood. Typography: bold serif. Mood: confident.",
    })),
  });
}

describe("parseAndValidateDirections", () => {
  // Imported once, statically — this function is pure (no client/env state),
  // so a single module instance is fine across all these tests.
  it("accepts exactly 3 well-formed directions", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const result = parseAndValidateDirections(validDirectionsPayload());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.directions).toHaveLength(3);
      expect(result.directions.map((d) => d.id)).toEqual(["a", "b", "c"]);
    }
  });

  it("accepts a response wrapped in markdown code fences", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const result = parseAndValidateDirections("```json\n" + validDirectionsPayload() + "\n```");
    expect(result.ok).toBe(true);
  });

  it("rejects malformed JSON", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const result = parseAndValidateDirections("{not valid json");
    expect(result.ok).toBe(false);
  });

  it("rejects a directions array with the wrong count (2)", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions = payload.directions.slice(0, 2);
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects a directions array with the wrong count (4)", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions.push(payload.directions[0]);
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate direction ids", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const result = parseAndValidateDirections(validDirectionsPayload(["dup", "dup", "c"]));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("duplicate");
  });

  it("rejects a direction missing a bilingual field (title.zh absent)", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    delete payload.directions[0].title.zh;
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects a direction with an empty description.en", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].description.en = "";
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects an empty promptModifier", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].promptModifier = "";
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects an excessively long promptModifier (over 1200 chars)", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].promptModifier = "x".repeat(1300);
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("rejects an empty styleTags array", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].styleTags = [];
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  // Regression test for the real, observed quality gap documented in
  // docs/daily_report/8.16/creative-direction-trajectory/FINDINGS.md (P1-0):
  // a real captured run returned all 3 directions titled "Morrow Coffee",
  // differing only in subtitle/description. title.en must now be distinct.
  it("rejects a response where two directions share the same title.en", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[1].title.en = payload.directions[0].title.en;
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("duplicate_direction_title");
  });

  it("rejects duplicate titles case-insensitively", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].title.en = "Warm Neighborhood";
    payload.directions[1].title.en = "warm neighborhood";
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(false);
  });

  it("accepts 3 directions with distinct titles.en", async () => {
    const { parseAndValidateDirections } = await import("../brandDirectionOpenAI");
    const payload = JSON.parse(validDirectionsPayload());
    payload.directions[0].title.en = "Warm Neighborhood";
    payload.directions[1].title.en = "Zen Minimalist";
    payload.directions[2].title.en = "Bold Editorial";
    const result = parseAndValidateDirections(JSON.stringify(payload));
    expect(result.ok).toBe(true);
  });
});

describe("generateCreativeDirections", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreate.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns success on a valid JSON response on the first attempt", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(true);
    if (result.success) expect(result.directions).toHaveLength(3);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("carries every event-poster field into the brief sent to the model", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const fieldValues = {
      eventName: "Afterglow Market",
      eventDateTime: "Saturday, March 21, 4–9 PM",
      location: "Riverside Pier, Pier 7",
      eventHighlights: "Live music, local vendors, sunset views",
      visualTone: "Warm, golden-hour, laid-back",
    };
    await generateCreativeDirections(eventCase, fieldValues);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    const userMessage: string = callArgs.messages.find((m: { role: string }) => m.role === "user").content;
    for (const value of Object.values(fieldValues)) {
      expect(userMessage).toContain(value);
    }
  });

  it("retries once on invalid JSON, then succeeds", async () => {
    mockCreate
      .mockResolvedValueOnce(chatResponse("not valid json"))
      .mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("returns a sanitized failure with no directions after all attempts are exhausted", async () => {
    mockCreate.mockResolvedValue(chatResponse("not valid json"));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).not.toContain("not valid json");
      expect(result.error).not.toMatch(/api[_-]?key/i);
      expect(result.kind).toBe("upstream_error");
      expect("directions" in result).toBe(false);
    }
  });

  it("maps a rate-limit error to a sanitized 'busy' message without retrying further", async () => {
    mockCreate.mockRejectedValueOnce(new MockRateLimitError());
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.kind).toBe("rate_limited");
      expect(result.error).not.toMatch(/rate limited/); // no raw SDK message leaked
    }
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("maps a timeout error to a sanitized timeout message", async () => {
    mockCreate.mockRejectedValue(new MockAPIConnectionTimeoutError());
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.kind).toBe("timeout");
  });

  it("returns success:false with kind=missing_api_key when OPENAI_API_KEY is unset, without calling the model", async () => {
    delete process.env.OPENAI_API_KEY;
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.kind).toBe("missing_api_key");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects empty/blank required input before ever calling the model", async () => {
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, {
      shopName: "   ",
      openingDate: "March 15, 2026",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.kind).toBe("invalid_input");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // --- preferenceProfile integration (Task C product iteration) ---

  it("baseline request (no preferenceProfile) sends a user message with no VISUAL PREFERENCE section", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).not.toContain("VISUAL PREFERENCE");
  });

  it("includes a likes-only preference in the real OpenAI user message", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS, {
      likes: "editorial typography, restrained warm palette",
    });

    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).toContain("VISUAL PREFERENCE");
    expect(userMessage).toContain("editorial typography, restrained warm palette");
    expect(userMessage).not.toContain("Wants to avoid");
  });

  it("includes a dislikes-only preference in the real OpenAI user message", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS, {
      dislikes: "cute mascot illustration, neon gradients",
    });

    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).toContain("VISUAL PREFERENCE");
    expect(userMessage).toContain("cute mascot illustration, neon gradients");
    expect(userMessage).not.toContain("Prefers:");
  });

  it("includes both likes and dislikes together", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS, {
      likes: "tactile natural materials",
      dislikes: "neon gradients",
    });

    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).toContain("tactile natural materials");
    expect(userMessage).toContain("neon gradients");
  });

  it("normalizes whitespace-only preference fields to no preference section at all", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS, {
      likes: "   ",
      dislikes: "\n\t",
    });

    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).not.toContain("VISUAL PREFERENCE");
  });

  it("safely ignores a malformed preferenceProfile (wrong type) instead of throwing", async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    // @ts-expect-error deliberately malformed to exercise the runtime guard
    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS, "not-an-object");

    expect(result.success).toBe(true);
    const userMessage: string = mockCreate.mock.calls[0][0].messages.find(
      (m: { role: string }) => m.role === "user",
    ).content;
    expect(userMessage).not.toContain("VISUAL PREFERENCE");
  });

  it("retries when the model returns duplicate titles, then succeeds", async () => {
    const duplicateTitlePayload = JSON.parse(validDirectionsPayload());
    duplicateTitlePayload.directions[0].title.en = "Same Title";
    duplicateTitlePayload.directions[1].title.en = "Same Title";
    mockCreate
      .mockResolvedValueOnce(chatResponse(JSON.stringify(duplicateTitlePayload)))
      .mockResolvedValueOnce(chatResponse(validDirectionsPayload()));
    const { generateCreativeDirections } = await import("../brandDirectionOpenAI");

    const result = await generateCreativeDirections(coffeeCase, COFFEE_FULL_FIELDS);

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});

// Matches an actual import/require of the module — not a prose/comment
// mention of its filename (both files' comments legitimately reference
// "lib/brandDirectionOpenAI.ts" by name as documentation).
const IMPORTS_BRAND_DIRECTION_OPENAI =
  /(?:from\s*["'][^"']*brandDirectionOpenAI["']|require\(\s*["'][^"']*brandDirectionOpenAI["']\s*\))/;

describe("client/server module boundary", () => {
  it("BrandDirectionExplorerClient.tsx never imports lib/brandDirectionOpenAI", async () => {
    const clientPath = path.join(
      process.cwd(),
      "app",
      "[locale]",
      "(public)",
      "brand-direction-explorer",
      "BrandDirectionExplorerClient.tsx",
    );
    const source = await fs.readFile(clientPath, "utf8");
    expect(source).not.toMatch(IMPORTS_BRAND_DIRECTION_OPENAI);
  });

  it("lib/brand_direction_explorer.ts (client-importable) never imports lib/brandDirectionOpenAI", async () => {
    const sharedPath = path.join(process.cwd(), "lib", "brand_direction_explorer.ts");
    const source = await fs.readFile(sharedPath, "utf8");
    expect(source).not.toMatch(IMPORTS_BRAND_DIRECTION_OPENAI);
  });
});
