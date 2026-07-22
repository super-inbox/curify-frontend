# Bilingual Chinese Card Generation — Pinyin Correctness Guide

_Last updated: 2026-07-18. Owner: jay. Applies to any template that renders Chinese text **with pinyin** — the HSK bilingual reading-lesson poster (`template-hsk-bilingual-reading-text-lesson-poster`), flashcards, word-scene cards, caption overlays, etc. Update when a new failure mode or 多音字 override is found._

## Why this doc exists

`gemini-3-pro-image-preview` (and every current image model) **cannot be trusted to compose correct Chinese + pinyin**. When it invents the passage itself, it produces two distinct classes of error:

1. **Gross garbling** (~15–20% of harder stories): nonsense sentences, invented/half-formed characters, emoji, stray Latin letters, repeated lines, an unfilled `HSK X` badge, or characters that spill out of the text column into the illustration column. Caught by a coarse "is the text sensible" QA pass.
2. **Tone / 读音 errors** (pervasive — **~80% of cards** in a 10-card audit, incl. the existing production gallery cards): the characters are right but the **pinyin is wrong**. This slips straight past a "does the text make sense" review and is exactly what a native-speaker parent catches first.

This guide is the standing knowledge for producing pinyin a native reader will accept, plus the generation method that actually holds up.

## The tone / 读音 failure taxonomy (what the model gets wrong)

Measured on the 2026-07-18 HSK2 reading deck (50 cards). The model, left to compose pinyin, systematically fails:

| Class | Symptom | Example (shown → correct) |
| --- | --- | --- |
| **一 tone sandhi** | writes the citation tone `yī` everywhere instead of the sandhi tone | `yī tiān` → **yì tiān**; `yī gè` → **yí gè**; `yī qǐ` → **yì qǐ** |
| **不 tone sandhi** | over- or under-applies | `bú shū fu` → **bù shū fu** (不 stays `bù` before a non-4th tone) |
| **多音字 misreading** | picks the wrong reading of a polyphone | `yáng quān` → **yáng juàn** (圈 = pen); `zhǐ` → **zhī** (只 measure word) |
| **wrong tone mark** | right syllable, wrong diacritic | `xiū bū` → **xiū bǔ** (补 is 3rd tone) |
| **dropped / added syllable** | pinyin doesn't align with the characters | `zhī hóu zi` (dropped 一) → **yì zhī hóu zi**; `jǐng jǐn lǐ` → **jǐng lǐ** |
| **garbled syllable** | a syllable renders as noise | `dàjiā dàjiā á` → **dàjiā dōu** (都 = dōu) |

### The rules the model breaks most

- **一 sandhi (apply it — kids' readers show the sandhi tone):**
  - `yī` only when counting / standalone / final / in ordinals (第一 dì-yī, 一 alone).
  - `yì` before a 1st, 2nd, or 3rd tone — 一天 yì tiān, 一条 yì tiáo, 一起 yìqǐ, 一点 yìdiǎn.
  - `yí` before a 4th tone (incl. neutral-from-4th) — 一个 yígè, 一位 yíwèi, 一样 yíyàng.
  - In verb reduplication 一 is neutral: 看一看 kàn yi kàn.
- **不 sandhi:** `bù` normally; `bú` **only** before a 4th tone — 不是 bú shì, but 不舒服 bù shūfu, 不多 bù duō.
- **只:** measure word = **zhī** (1st); 只有/只是 (only) = **zhǐ** (3rd).
- **Neutral tones:** 妈妈 māma, 眼睛 yǎnjing, 姐姐 jiějie, 孩子 háizi, 朋友 péngyou, 喜欢 xǐhuan, 舒服 shūfu, 東西/东西 dōngxi.

### 多音字 seen in kids' stories (extend this table when new ones appear)

The machine-readable version lives in [`scripts/configs/pinyin_overrides.json`](../scripts/configs/pinyin_overrides.json) — keep the two in sync.

| Char | Reading here | Context / gloss | Wrong reading to avoid |
| --- | --- | --- | --- |
| 圈 | **juàn** | 羊圈 pen/fold | quān (circle) |
| 只 | **zhī** | measure word 一只 | zhǐ (only) |
| 觉 | **jiào** | 睡觉 sleep | jué (feel) |
| 长 | **zhǎng** | 长大 grow | cháng (long) |
| 得 | **de / dé / děi** | 跑得快 de; 得到 dé; 得走 děi | — |
| 地 | **de** | adverbial 高兴地 | dì (ground/earth) |
| 着 | **zhe / zháo** | 笑着 zhe; 着急 zháo | zhuó |
| 大夫 | **dài fu** | doctor | dà fū |
| 都 | **dōu** | 大家都 all | dū (capital) |
| 为 | **wèi / wéi** | 因为 wèi; 为了 wèi; 成为 wéi | — |
| 还 | **hái / huán** | 还有 hái; 还书 huán | — |
| 乐 | **lè / yuè** | 快乐 lè; 音乐 yuè | — |
| 长 / 少 / 教 / 空 / 差 / 称 | context-dependent | zhǎng·cháng / shǎo·shào / jiāo·jiào / kōng·kòng / chà·chā / chēng·chèn | — |

## The generation method that holds up: **authored-verbatim typeset**

Do **not** let the model write the passage. Author it, then make the model a typesetter.

1. **Author the content by hand** as structured data per card: `title_zh`, `title_en`, illustration `scene`, 8 `lines` of `[pinyin, hanzi]`, and 8 `vocab` rows of `[hanzi, pinyin, en]`. Keep sentences short and HSK-level; apply every rule above.
2. **Prompt the model to TYPESET IT VERBATIM** — render every character and every pinyin syllable *with tone marks* exactly as given; do not change, add, remove, reorder, or "correct" anything; each pinyin line sits directly above its own characters; no repeats. State that the tone marks are deliberate (incl. 一/不 sandhi and readings like 圈=juàn) so the model doesn't "helpfully" normalize them.
3. **Layout instructions still matter:** fixed `适合水平 HSK N` badge, `阅读课文 | Reading Lesson` ribbon, left = passage, right = illustrations only, bottom = `生词 | New Words` 2×4 grid numbered in reading order.

Reference implementations (2026-07-18 HSK2 run): `scratchpad/hsk2_regen_authored.cjs` and `hsk2_fix_tones.cjs` — the `buildPrompt(card)` there is the canonical verbatim-typeset prompt. Optionally seed pinyin with `pypinyin` (Style.TONE + `tone_sandhi`) as a first pass, then hand-fix against the tables above — but **the model still needs the finished pinyin verbatim**; pypinyin alone does not fix the image model.

### Why not just regenerate with a "be careful" addendum?

Tried on the 2026-07-18 deck. A correctness addendum ("mark HSK 2, pinyin must match, no repeats, 喝 not 吃") cleared the *gross garbling* but **not** the tone errors — the model kept composing `yī` for 一 and `zhǐ` for 只. Only removing its freedom to compose (verbatim typeset) fixed the tones reliably (≈100% on the cards regenerated this way).

## QA — mandatory, native-level

Coarse "is the text sensible" QA is **not** sufficient; it misses every tone error. Run a dedicated pinyin pass:

1. **One vision agent per few cards**, prompted as a native Mandarin teacher whose *only* job is 声调 + 读音: check every syllable's tone mark, 一/不 sandhi, 多音字 readings, and pinyin-to-character alignment. Report `card: PASS` or `FAIL` with each `word: shown → correct`. Instruct it not to invent errors.
2. **Fix flagged cards** via authored-verbatim regen (write the corrected pinyin into the card's structured data).
3. **Re-QA** the regenerated cards. Iterate until clean.
4. Never assume an unsampled card is clean — tone errors are per-card and independent. For a paid/educational deliverable, QA **all** cards, not a sample.

## Deliverable that used this

`raw/hsk2-reading-deliverable/` — 50-card HSK2 bilingual reading deck + `scripts/images_to_pdf.py` (image→print-PDF pipeline). See memory `project_hsk2_reading_deliverable.md`.
