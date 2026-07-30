import { describe, it, expect } from "vitest";
import { filterSuggestions, matchToolIntent } from "@/lib/searchIndex";

// The reported gap: natural-language tool queries returned nothing because the
// matcher only checked "alias CONTAINS query", never "query CONTAINS alias".
describe("filterSuggestions — reverse containment (query contains an alias)", () => {
  const topSlugs = (q: string) => filterSuggestions(q, 8).map((s) => s.slug);

  it("resolves 'add subtitles to a video' → bilingual-subtitles", () => {
    expect(topSlugs("add subtitles to a video")).toContain("bilingual-subtitles");
  });

  it("still resolves the bare keyword 'subtitles'", () => {
    expect(topSlugs("subtitles")).toContain("bilingual-subtitles");
  });

  it("resolves other natural-language tool phrasings", () => {
    expect(topSlugs("how do i add captions to my video")).toContain("bilingual-subtitles");
    expect(topSlugs("i want to summarize this video")).toContain("video-summarizer");
    expect(topSlugs("transcribe an interview recording")).toContain("video-transcript-generator");
  });

  it("does NOT fire short aliases on unrelated words (word boundary)", () => {
    // "dub" (video-dubbing alias) must not match inside "dublin"
    expect(topSlugs("dublin travel itinerary")).not.toContain("video-dubbing");
    // "srt" must not match inside "concert"/"dessert"
    expect(topSlugs("concert poster design")).not.toContain("bilingual-subtitles");
  });

  it("single-token lookups keep exact/substring behavior (no reverse rule)", () => {
    // 'anime' is an exact topic; reverse rule is multi-word only, so this is unchanged
    expect(topSlugs("anime")).toContain("anime");
  });
});

describe("matchToolIntent — Enter/submit routing", () => {
  it("routes the reported query to the subtitles tool", () => {
    expect(matchToolIntent("add subtitles to a video")?.href).toBe("/tools/bilingual-subtitles");
  });

  it("routes other confident tool phrases", () => {
    expect(matchToolIntent("add captions to my clip")?.href).toBe("/tools/bilingual-subtitles");
    expect(matchToolIntent("please summarize this youtube video")?.href).toBe("/tools/video-summarizer");
  });

  it("does NOT hijack generic queries (specificity floor)", () => {
    // bare "video" is not a tool name → must fall through to /search (null)
    expect(matchToolIntent("video")).toBeNull();
    expect(matchToolIntent("make a video of my dog")).toBeNull();
    // an image-generation query must not route to a video tool
    expect(matchToolIntent("cyberpunk city poster")).toBeNull();
  });
});
