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

// 2026-08-30 — /tools/asl-video-translator had been live since 2026-08-16 but
// was absent from the search index, so every ASL query resolved to /topics/asl
// (1 template, 4 examples) or /topics/language and the tool was unreachable.
describe("ASL — tool intent vs the ASL topic", () => {
  const topSlugs = (q: string) => filterSuggestions(q, 8).map((s) => s.slug);

  it("routes the measured tool queries to the ASL translator", () => {
    expect(matchToolIntent("asl video translations")?.href).toBe("/tools/asl-video-translator");
    expect(matchToolIntent("asl · american sign language")?.href).toBe("/tools/asl-video-translator");
  });

  it("routes other ASL tool phrasings", () => {
    for (const q of [
      "sign language translator",
      "translate sign language video",
      "asl to text",
      "how do i translate asl to english",
      "手语翻译",
      "traductor de lengua de señas",
    ]) {
      expect(matchToolIntent(q)?.href, q).toBe("/tools/asl-video-translator");
    }
  });

  it("leaves the bare concept on the ASL topic", () => {
    // Both surfaces resolve an exact slug/label/alias hit before tool intent,
    // and the tier-2 topic outranks the tier-3 tool on the tie.
    expect(topSlugs("asl")[0]).toBe("asl");
    expect(topSlugs("american sign language")[0]).toBe("asl");
    expect(topSlugs("sign language")[0]).toBe("asl");
  });

  it("keeps the ASL tool discoverable in the dropdown for tool phrasings", () => {
    expect(topSlugs("asl video translations")).toContain("asl-video-translator");
    expect(topSlugs("sign language translator")).toContain("asl-video-translator");
  });

  it("does not let ASL phrases fall to the generic video tools", () => {
    // "video translation" is a video-dubbing alias; longest-phrase-wins must
    // hand these to the ASL tool instead.
    expect(matchToolIntent("sign language video translation")?.href)
      .toBe("/tools/asl-video-translator");
    // ...and the reverse: a video-translation query with no ASL in it still
    // goes to dubbing.
    expect(matchToolIntent("i need video translation for this clip")?.href)
      .toBe("/tools/video-dubbing");
  });

  it("keeps bare 'translator' on the speech translator", () => {
    // Adding a second *-translator slug killed the /search unambiguous-substring
    // branch for this query; the exact alias is what preserves the destination.
    expect(topSlugs("translator")[0]).toBe("speech-translator");
  });
});

describe("impromptu speech — widened alias set", () => {
  it("routes competition / duration phrasings to the practice tool", () => {
    for (const q of [
      "extemporaneous speech topics",
      "public speaking topics for students",
      "1 minute speech topics",
      "give me some speech prompts",
    ]) {
      expect(matchToolIntent(q)?.href, q).toBe("/tools/impromptu-speech-practice");
    }
  });
});
