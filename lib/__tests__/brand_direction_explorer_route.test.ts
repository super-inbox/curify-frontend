import { beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/brand-direction-explorer/directions is a thin request-validation
// layer in front of lib/brandDirectionOpenAI.ts's generateCreativeDirections.
// These tests mock that module (never a real OpenAI call) and assert on the
// route's own validation/threading behavior: caseId/fieldValues handling
// (pre-existing), plus the new optional preferenceProfile field this pass
// adds (backward compatibility, shape validation, threading through).
vi.mock("server-only", () => ({}));

const mockGenerateCreativeDirections = vi.fn();
vi.mock("@/lib/brandDirectionOpenAI", () => ({
  generateCreativeDirections: (...args: unknown[]) => mockGenerateCreativeDirections(...args),
}));

const VALID_COFFEE_FIELDS = {
  shopName: "Maple & Grind",
  openingDate: "March 15, 2026",
  location: "123 Main Street",
  offerDetails: "Free pastry with any drink",
};

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/brand-direction-explorer/directions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/brand-direction-explorer/directions — preferenceProfile", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGenerateCreativeDirections.mockReset();
    mockGenerateCreativeDirections.mockResolvedValue({
      success: true,
      directions: [
        {
          id: "a",
          title: { en: "A", zh: "A" },
          subtitle: { en: "a", zh: "a" },
          description: { en: "a", zh: "a" },
          styleTags: ["a"],
          promptModifier: "x".repeat(50),
        },
      ],
    });
  });

  it("baseline request without preferenceProfile still works (backward compatible)", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(postRequest({ caseId: "coffee-opening", fieldValues: VALID_COFFEE_FIELDS }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockGenerateCreativeDirections).toHaveBeenCalledTimes(1);
    const [, , preferenceArg] = mockGenerateCreativeDirections.mock.calls[0];
    expect(preferenceArg).toBeUndefined();
  });

  it("accepts a request with preferenceProfile.likes only", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { likes: "editorial typography" },
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    const [, , preferenceArg] = mockGenerateCreativeDirections.mock.calls[0];
    expect(preferenceArg).toEqual({ likes: "editorial typography" });
  });

  it("accepts a request with preferenceProfile.dislikes only", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { dislikes: "neon gradients" },
      }),
    );

    expect(res.status).toBe(200);
    const [, , preferenceArg] = mockGenerateCreativeDirections.mock.calls[0];
    expect(preferenceArg).toEqual({ dislikes: "neon gradients" });
  });

  it("accepts a request with both likes and dislikes", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { likes: "warm materials", dislikes: "neon gradients" },
      }),
    );

    expect(res.status).toBe(200);
    const [, , preferenceArg] = mockGenerateCreativeDirections.mock.calls[0];
    expect(preferenceArg).toEqual({ likes: "warm materials", dislikes: "neon gradients" });
  });

  it("accepts an empty preferenceProfile object and threads it through (normalization happens downstream)", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: {},
      }),
    );

    expect(res.status).toBe(200);
    expect(mockGenerateCreativeDirections).toHaveBeenCalledTimes(1);
  });

  it("rejects a preferenceProfile that is not an object", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: "editorial typography",
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(mockGenerateCreativeDirections).not.toHaveBeenCalled();
  });

  it("rejects a preferenceProfile with an unsupported nested field", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { likes: "warm materials", referenceImages: ["https://evil.example/x.png"] },
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("referenceImages");
    expect(mockGenerateCreativeDirections).not.toHaveBeenCalled();
  });

  it("rejects a preferenceProfile.likes that is not a string", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { likes: { nested: "object" } },
      }),
    );

    expect(res.status).toBe(400);
    expect(mockGenerateCreativeDirections).not.toHaveBeenCalled();
  });

  it("rejects a preferenceProfile.likes exceeding the max length", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(
      postRequest({
        caseId: "coffee-opening",
        fieldValues: VALID_COFFEE_FIELDS,
        preferenceProfile: { likes: "x".repeat(500) },
      }),
    );

    expect(res.status).toBe(400);
    expect(mockGenerateCreativeDirections).not.toHaveBeenCalled();
  });

  it("still returns exactly the directions array generateCreativeDirections produced", async () => {
    const { POST } = await import("@/app/api/brand-direction-explorer/directions/route");
    const res = await POST(postRequest({ caseId: "coffee-opening", fieldValues: VALID_COFFEE_FIELDS }));
    const json = await res.json();

    expect(json.directions).toHaveLength(1);
  });
});
