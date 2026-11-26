import { describe, expect, it } from "vitest";
import { findDuplicate } from "@/lib/editDistance";
import { CDN_BASE } from "@/lib/constants";

const template = "template-mbti-siliconvalley";
const params = { character_name: "Elon Musk" };
const path = "/images/nano_insp_preview/template-mbti-siliconvalley-en-elonmusk-prev.jpg";

describe("duplicate image delivery", () => {
  it("resolves the legacy MBTI parameter match to the CDN, not the page origin", () => {
    expect(findDuplicate(template, params, [{
      id: `${template}-elonmusk`, params, imageUrl: path,
    }])).toEqual({ exampleId: `${template}-elonmusk`, score: 1, imageUrl: `${CDN_BASE.replace(/\/$/, "")}${path}` });
  });

  it("also resolves an exact generated-ID match", () => {
    expect(findDuplicate(template, params, [{
      id: `${template}-elon-musk`, params, imageUrl: path.slice(1),
    }])?.imageUrl).toBe(`${CDN_BASE.replace(/\/$/, "")}${path}`);
  });

  it.each([
    "https://storage.example/result.jpg?signature=keep%2Fexact",
    "blob:https://www.curify-ai.com/example",
    "data:image/png;base64,AAAA",
    undefined,
  ])("preserves an existing URL or absent image: %s", (imageUrl) => {
    expect(findDuplicate(template, params, [{
      id: `${template}-elonmusk`, params, imageUrl,
    }])?.imageUrl).toBe(imageUrl);
  });
});
