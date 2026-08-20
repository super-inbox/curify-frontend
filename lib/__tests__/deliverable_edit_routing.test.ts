import { describe, expect, it } from "vitest";
import { classifyDeliverable } from "@/lib/agent/deliverable";

/**
 * Regression guard for spec §7o class A: 7 of 21 eval cases "completely ignored
 * the supplied source image and replaced it with an entirely new design".
 *
 * The edit branch always routed to image-to-image correctly; DETECTION was the
 * hole, so these are the real queries from
 * agentic-adhoc/design-agent-v0/eval/experiments/curify-vs-codex-21q-2026-08-16.
 *
 * The negative cases matter as much as the positive ones: broadening the
 * pattern must not swallow the vote (class B) or export (class D) queries,
 * which need different deliverables and are the obvious way this fix could
 * regress something.
 */

// Every one of these supplies a reference image in the dataset.
const MUST_EDIT = [
  ["AR-001", "把海报的标题放大一点"],
  ["AR-002", "换个背景颜色，更清爽一些"],
  ["AR-003", "make the logo bigger and move it to the corner"],
  ["AR-007", "上传自拍，试穿这件卫衣"],
  ["AR-008", "try on this jacket on my photo for a lookbook"],
  ["AR-009", "用我的照片做商品试穿海报"],
  ["TIQ-029", "logo升级前后对比提案板"],
  ["TIQ-084", "香水瓶玻璃质感精修"],
  ["TIQ-085", "金属五金工具产品细节增强"],
  ["TIQ-088", "根据参考详情页替换成我的产品和文案"],
  ["TIQ-100", "上传自拍生成不同穿搭的商品试穿海报"],
] as const;

// Supplying an image must NOT turn these into edits.
const MUST_NOT_EDIT = [
  ["AR-004", "这4款包装，站在消费者角度哪款更有质感？"],
  ["AR-005", "帮我给方案A到D投票，选出最好的一个"],
  ["AR-006", "vote on these four logo options, which is better"],
  ["AR-010", "把这个贴纸做成模切刀线的生产文件"],
  ["AR-011", "die-cut cutline + CMYK for this sticker"],
  ["AR-012", "导出可以直接打样的印刷文件"],
  ["TIQ-098", "批量生成同一品牌的20个SKU主图"],
] as const;

describe("edit-intent routing (§7o class A)", () => {
  it.each(MUST_EDIT)("%s routes to edit: %s", (_id, query) => {
    expect(classifyDeliverable(query, { hasImage: true }).type).toBe("edit");
  });

  it.each(MUST_NOT_EDIT)("%s is not an edit: %s", (_id, query) => {
    expect(classifyDeliverable(query, { hasImage: true }).type).not.toBe("edit");
  });

  it("keeps vote queries out of edit without relying on BATCH_RE ordering", () => {
    // No digit, so BATCH_RE cannot fire — this reaches the edit check with the
    // edit token 质感 present, and must still not be an edit.
    expect(classifyDeliverable("这两款包装哪款更有质感？", { hasImage: true }).type).not.toBe("edit");
    expect(classifyDeliverable("vote on these logos, which is better", { hasImage: true }).type).not.toBe("edit");
  });

  it("does not classify an edit-worded query as an edit without an image", () => {
    // Nothing to edit — this is "make me one of these".
    expect(classifyDeliverable("把海报的标题放大一点", { hasImage: false }).type).not.toBe("edit");
  });

  it("explains reference-bound asks differently from plain modifications", () => {
    const tryOn = classifyDeliverable("try on this jacket on my photo", { hasImage: true });
    const modify = classifyDeliverable("换个背景颜色", { hasImage: true });
    expect(tryOn.rationale).toMatch(/photo you supplied/);
    expect(modify.rationale).not.toMatch(/photo you supplied/);
  });
});

/**
 * Poster-set expansion (§7o artifact_contract). The four try-on cases share the
 * hidden success criterion "Return three commercially usable ecommerce or
 * lookbook poster directions", and each was producing one image against a
 * contract of three.
 *
 * The negative cases are the point: an early version keyed on 海报/poster and
 * fired on "把海报的标题放大一点", which would have tripled a user's credits for
 * a one-line edit. Keying on TRY-ON keeps routine edits single-step.
 */
describe("poster-set expansion", () => {
  const THREE = [
    ["AR-007", "上传自拍，试穿这件卫衣"],
    ["AR-008", "try on this jacket on my photo for a lookbook"],
    ["AR-009", "用我的照片做商品试穿海报"],
    ["TIQ-100", "上传自拍生成不同穿搭的商品试穿海报"],
  ] as const;

  const ONE = [
    ["AR-001 poster word, but a plain edit", "把海报的标题放大一点"],
    ["AR-002", "换个背景颜色，更清爽一些"],
    ["AR-003", "make the logo bigger and move it to the corner"],
    ["TIQ-084", "香水瓶玻璃质感精修"],
  ] as const;

  it.each(THREE)("%s is a try-on set", (_id, query) => {
    expect(/\btry[\s-]?on\b|\blookbook\b|试穿|穿搭/i.test(query)).toBe(true);
  });

  it.each(ONE)("%s is not a try-on set", (_id, query) => {
    expect(/\btry[\s-]?on\b|\blookbook\b|试穿|穿搭/i.test(query)).toBe(false);
  });
});
