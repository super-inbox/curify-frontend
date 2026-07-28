import { describe, it, expect } from "vitest";
import { subjectUnits, FORMAT_TOKENS } from "../searchSubject";

// subjectUnits() returns the query's SUBJECT unit(s) — the theme/head-noun content
// with format/output words removed. A record is "subject-present" iff its title+tags
// blob contains at least one of these units. These tests assert the returned units,
// which is where the Cluster-A fix lives (page.tsx's deriveFieldHits only applies
// tokenInBlob to them).

describe("subjectUnits — Cluster A (format-word-aware subject)", () => {
  // Confirmed-live regression cases: the OLD "longest token = subject" picked the
  // format word; the fix must return the THEME instead.
  it("wine label → wine (not label)", () => {
    expect(subjectUnits(["wine", "label"], [], "wine label")).toEqual(["wine"]);
  });

  it("字母海报 → 字母 content bigram (not the 海报 format bigram, not the whole compound)", () => {
    // CJK compound tokenizes to one primary token + bigrams.
    const units = subjectUnits(["字母海报"], ["字母", "母海", "海报"], "字母海报");
    expect(units).toContain("字母");
    expect(units).not.toContain("海报");
  });

  it("巧克力礼盒 → 巧克力 theme (not the 礼盒 gift-box format word)", () => {
    const units = subjectUnits(["巧克力礼盒"], ["巧克", "克力", "力礼", "礼盒"], "巧克力礼盒");
    expect(units).toContain("巧克");
    expect(units).not.toContain("礼盒");
  });

  it("人体图解 → 人体 theme (not the 图解 diagram format word)", () => {
    const units = subjectUnits(["人体图解"], ["人体", "体图", "图解"], "人体图解");
    expect(units).toContain("人体");
    expect(units).not.toContain("图解");
  });
});

describe("subjectUnits — preserved wins (must NOT change)", () => {
  it("product photo → product (photo is format; product photo win intact)", () => {
    expect(subjectUnits(["product", "photo"], [], "product photo")).toEqual(["product"]);
  });

  it("movie poster → movie (poster is format)", () => {
    expect(subjectUnits(["movie", "poster"], [], "movie poster")).toEqual(["movie"]);
  });

  it("sticker pack → sticker (pack is format, sticker is the THEME — kept out of the lexicon)", () => {
    expect(subjectUnits(["sticker", "pack"], [], "sticker pack")).toEqual(["sticker"]);
  });

  it("logo → logo (single ASCII word; logo is a theme, not a format word)", () => {
    expect(subjectUnits(["logo"], [], "logo")).toEqual(["logo"]);
  });

  it("促销海报 → 促销 theme (promo poster; theme survives, 海报 dropped)", () => {
    const units = subjectUnits(["促销海报"], ["促销", "销海", "海报"], "促销海报");
    expect(units).toContain("促销");
    expect(units).not.toContain("海报");
  });

  it("日历 → 日历 (single-concept CJK; whole token, Fix B strictness)", () => {
    expect(subjectUnits(["日历"], ["日历"], "日历")).toEqual(["日历"]);
  });
});

describe("subjectUnits — Fix B strictness preserved (single-concept CJK)", () => {
  it("笔袋 → 笔袋 whole token (not split; not a format word)", () => {
    expect(subjectUnits(["笔袋"], ["笔袋"], "笔袋")).toEqual(["笔袋"]);
  });

  it("元素周期表 → whole compound (no format word → single concept, NOT bigram-loosened)", () => {
    // Critical: a multi-char non-format CJK compound must stay strict (require the
    // full term), so a record carrying only 元素 (element) is NOT subject-present.
    expect(subjectUnits(["元素周期表"], ["元素", "素周", "周期", "期表"], "元素周期表"))
      .toEqual(["元素周期表"]);
  });
});

describe("subjectUnits — all-format fallback", () => {
  it("bare 'poster' → poster (query is entirely format; it becomes its own subject)", () => {
    expect(subjectUnits(["poster"], [], "poster")).toEqual(["poster"]);
  });

  it("'poster banner' (all format) → both tokens (nothing left to prefer)", () => {
    expect(subjectUnits(["poster", "banner"], [], "poster banner")).toEqual(["poster", "banner"]);
  });
});

describe("FORMAT_TOKENS lexicon calibration", () => {
  it("contains the confirmed format/output words (EN + CJK)", () => {
    for (const w of ["poster", "label", "banner", "package", "box", "photo",
                     "海报", "礼盒", "图解", "包装", "标签", "横幅"]) {
      expect(FORMAT_TOKENS.has(w)).toBe(true);
    }
  });

  it("EXCLUDES theme words that merely co-occur with a format", () => {
    for (const w of ["sticker", "logo", "wine", "product", "movie", "巧克", "字母", "人体", "促销"]) {
      expect(FORMAT_TOKENS.has(w)).toBe(false);
    }
  });
});
