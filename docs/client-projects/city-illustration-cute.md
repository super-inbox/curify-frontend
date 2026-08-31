# City Illustration — Cute (Q版 城市文创插画)

> Started 2026-08-25. **Last updated 2026-08-28.** Living doc. A **文创 (cultural-creative)
> capability exploration**: cute Q版 city-landmark illustration sets for city cultural-tourism
> souvenirs (陶瓷冰箱贴 fridge magnets, postcards, stickers). Sits under **Workstream D — Vertical
> Use Cases** as a repeatable per-city product line; adjacent to the paid 黎族景区文创 order
> (`project_lizu_merch_baicha`) and the POD / Merch reframe. **Exploratory — no client order yet.**
>
> 📁 **Structured trajectory record** (the centralized §7z corpus, alongside client-005/006/007):
> `~/agentic-adhoc-inbox/real-projects/projects/2026-08-25-internal-001-cute-city-illustration.json`
> — staged locally, pending the `agentic-adhoc` clone. **Keep the two in sync**: this doc owns the
> *how to run it* (generator, paths, model), the JSON owns the *decision trajectory* (alternatives,
> rejections, preference_memory). Update both in the same commit, per §7z-E2's drift rule.
>
> ⚠️ **Unresolved, and the JSON record is blocked on it:** this header says "no client order yet",
> but the sections below refer to "the client" four times (preferred sample, A-vs-B pick) — while
> the preferred sample, `codex-output.png`, is our own output from another model. The JSON is
> therefore recorded as **internal** (`customer_data: false`, id `internal-001`). If a real
> counterparty exists, say so and both records convert in a few lines.

---

## What this is

A per-city set of **cute, hand-drawn Q版 landmark stickers** in the style of the 小红书
"**陶瓷冰箱贴设计 · <省>限定**" genre. Each set = 6–8 square tiles, one landmark per tile, with:

- a bilingual label (`English 中文`) at the top,
- kawaii **smiling clouds**, warm **autumn palette** (golden ginkgo / soft orange),
- **cute-faced buildings** (the hero landmark carries a small kawaii face),
- a **recurring cute mascot woven into every scene** as an easter-egg — the genre's signature
  device (panda = 四川, calico cat = 河北 in the references; we use a calico **上海弄堂猫** for Shanghai).

The pilot subject is **Shanghai**, driven from a skyline photo. Landmark set (6):
**外滩 The Bund · 陆家嘴 Lujiazui · 豫园 Yu Garden · 武康大楼 Wukang Mansion · 石库门 Shikumen ·
上海味道 Shanghai Eats (小笼包)**.

Product constraint that shapes everything: the physical magnet is **~5cm**, so dense/intricate
linework smears — the art must read cleanly at small size.

---

## Files

| Thing | Path |
|---|---|
| Generator | `scripts/oneoff_cute_shanghai_2026-08-25.cjs` |
| Working dir (refs + all outputs) | `raw/cute-city-08-25/` |
| Genre references (小红书 陶瓷冰箱贴) | `ref-1.png` (Beijing autumn), `ref-2/3/4.jpg` (四川/云南/河北) |
| Subject photo | `shanghai-example.jpg` (Pudong skyline — structure ref for the Lujiazui tile) |
| **Preferred output** (from another model) | `codex-output.png` → clean tiles cropped to `_coderef/` |
| Line-quality target | `positive-case.jpg` (close-up of the 云南 set) |
| Outputs | `out/` (v1), `out_v2/`, `out_v3/`, `out_v4a/`, `out_v4b/` — each has `tile_1..6.png` + a grid |

**FINAL candidates: `out_v4a/grid.png` and `out_v4b/grid.png`** (awaiting the client's A-vs-B pick).

> ⚠️ `raw/cute-city-08-25/line-discussion.txt` is **mislabeled** — its contents are an old
> SEMrush/SEO diagnosis, not a discussion of linework. The line intent was taken from the two
> images above.

---

## The style iteration — what each round taught (the reusable lesson)

| ver | dir | result | lesson |
|---|---|---|---|
| v1 | full detail, style-ref = `ref-1` | **"AI味重"** — too dense; window grids / brick texture smear at 5cm | detail ≠ quality |
| v2 | minimalist | clean but a **cold flat-vector infographic** (ruler-straight lines, realistic proportions) | fewer lines alone reads as cold/写实 |
| v3 | chibi / cute | cuter, but lines **thin & "不实"** (floaty, vectory) | cuteness without line confidence still looks AI |
| **v4** | **anchor to the client's PREFERRED `codex-output.png`; fix line quality** | **✅ warm, solid, hand-drawn** | see recipe below |

### Winning recipe (v4)

1. **Line quality is the #1 lever ("线条要实").** Demand **confident, solid, continuous,
   fully-closed, consistent-weight** outlines in warm dark-brown; explicitly **ban**
   sketchy / hesitant / wobbly / broken / doubled / faint / "floaty" strokes. This single change
   resolved the "AI味 / 不实" complaint.
2. **Warm colored-pencil / gentle interior shading — not** pure-flat cel, **not** cold glossy
   vector. Cohesive warm autumn palette, uniform warm background.
3. **Cute but recognisable** — a small kawaii face on the hero building; do not over-chibi into
   an unrecognisable blob. **Moderate** tasteful detail: *confident* lines matter more than *few* lines.
4. **Anchor the style-ref to the actual preferred sample** when the client provides one (here a
   clean tile cropped from `codex-output.png`). Far more reliable than prose. Keep the fixed DNA:
   recurring chibi mascot + smiling clouds + bilingual label.

Two v4 variations shipped for the pick:
- **A** (`out_v4a`) — faithful codex-match: warm colored-pencil, fuller cozy scenes.
- **B** (`out_v4b`) — bolder outline + simpler background, more empty space → **best 5cm legibility**.

---

## How to run

```
# needs GEMINI_API_KEY in curify-frontend/.env.local
node scripts/oneoff_cute_shanghai_2026-08-25.cjs
# -> writes out_v4a/ and out_v4b/ tile_1..6.png; compose the grid with the PIL snippet in the session
```

Model = `gemini-3-pro-image-preview` (CJK labels render correctly here; **flash garbles CJK** —
see memory `feedback_chinese_caption_gemini_model`). img2img = STYLE ref (+ optional STRUCTURE ref
= the real skyline, for tower accuracy on the Lujiazui tile). Per-tile squares → PIL 2×3 grid.

---

## Why it matters (GTM / vertical angle)

City cultural-tourism souvenirs (景区文创) are a large, repeatable 文创 market: **one style engine →
N cities × M landmarks**, each a sellable set (magnets / postcards / stickers). It reuses the same
"input → cute branded asset set, same-day" motion as the merch/POD line, and is a natural companion
to the paid **黎族景区文创** order (`project_lizu_merch_baicha`). The moat is exactly the thing this
exploration nailed: **hand-drawn line confidence + CJK-correct labels + a consistent recurring
mascot**, which off-the-shelf AI output does not get right by default.

---

## Open / next steps

1. **Client picks A or B**, then regenerate all 6 with **unified label treatment** (some tiles float
   the label, one uses a white chip) + consistent framing + consistent mascot scale.
2. **Confirm the final 6–8 landmarks** (candidates to add: 南京路 / 田子坊 / 朱家角水乡 / 1933老场坊).
3. Export **print-ready 1:1** tiles + a clean 2×3 grid; optional 小红书「上海限定」post layout like the refs.
4. If validated → template the generator for **other cities** (parameterise landmarks + mascot + palette).

⚠️ **Memory `project_cute_city_magnet_style` does not exist** (checked 2026-08-31 — the memory
directory is empty), so the recipe is **not** "persisted" anywhere but in this doc and the JSON
record above. `workstream-index.md` cites the same name in its memory table. Same drift class as
the POD-reframe memory that index already records as gone. Treat this doc + the JSON as the only
copies. Adjacent: `project_lizu_merch_baicha`, `feedback_chinese_caption_gemini_model`,
`feedback_image2image_prompt_hygiene`, the POD reframe in `workstream-vertical-use-cases.md`.
