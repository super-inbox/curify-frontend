# `/tools/ai-fashion-model-generator` — build spec

_Draft 2026-09-21. Target: `ai fashion model generator` (260/mo, KD 16, CPC $2.11) plus the
ghost-mannequin cluster (`ghost mannequin ai` 110/mo KD 1 $4.11 · `ai ghost mannequin` 30/mo KD 0
$2.62) — **400/mo at KD 0–16 from one surface.** Structure copied from the `adworker.ai/tools/ghost-mannequin/`
teardown in [`workstream-seo-smm-growth.md`](workstream-seo-smm-growth.md) §2026-09-01._

---

## 1. Why a tool page and not a blog

The SERP decides this, and it was checked live on 2026-09-21. Page 1 for `ai fashion model
generator` is **tool landing pages**: Botika at #1 (*"Turn Flat Lays into On-Model"*), The New
Black AI, PicLumen, with one listicle (On-Model by PiktID). No AI Overview. Competitors are
startups, not Canva/Adobe.

A method blog would be format-mismatched against a tool SERP — the failure documented three times
in this repo. The teardown's answer is a tool page that **teaches first and converts last**, which
is also the only shape that lets the rubric do the ranking work.

⚠️ **This creates a new tool slug, against a repo precedent that consolidates rather than spokes**
(`sticker-factory-export` → `die-cut-sticker-file`; the refused second `asl-translator`). The
justification is that putting a garment on a person is a different job from photographing an
object, and `/tools/ai-product-photo-generator`'s own registry comment already anticipates an
`outfit` preset it never grew. **Decide this explicitly before building** — the alternative is a
preset inside that hub, which will not rank for a 260/mo head term because the `<title>` would
still say "Product Photo".

## 2. What we may honestly claim — and what we may not

Binding constraints from `agentic-adhoc/resources/fashion-materials/axes.json` → `provenance_rules`:

| ⛔ | rule |
|---|---|
| **No client or lead imagery** | every garment behind this work is someone else's product. **Findings only.** |
| **Never copy a string from a source record** | style numbers on hangtags re-identify a brand that was deliberately redacted. Paraphrase; never paste. |
| **No success-rate or delivered-outcome claim** | one job is qualified-positive and still in revision; two carry explicit negative verdicts. **This is a method rubric, not a track record.** |
| **Counterparties unnamed** | including the large prospect. Describe by role only. |

And from `curify-studio/docs/tool-inventory.md` §Fashion on-model try-on, in its own words:
*"the METHOD is proven and written down, the PIPELINE is not built."*

**So the page must not promise bulk.** Botika sells batch; we cannot. **Not one fashion template
is batch-enabled.**

**What is honestly demonstrable today:** `template-ai-outfit-try-on-poster` (`image_input:
required`) takes a flat lay and returns a three-panel try-on — reference figure, the flat lay, and
the same figure wearing it. The `PRODUCT_TRYON` workbench preset already describes itself as
*"On-model try-on poster from your apparel photo."* That is a real single-shot flat-lay → on-model
flow, and it is what the CTA offers.

**The differentiator is not the generator. It is the QA standard** — 27 checks earned over seven
rounds with a womenswear buyer, plus that buyer's own seven-class rejection taxonomy, supplied in
advance. Nobody on this SERP publishes anything comparable.

## 3. Page structure — teach, then convert

Mirrors the teardown block-for-block. Target ~1,800 visible words.

| # | Block | Headings |
|---|---|---|
| 1 | **Definition + synonym harvest** | *What Is an AI Fashion Model Generator?* → *Flat Lay, On-Model, Ghost Mannequin and Invisible Mannequin — Which One You Need* · *Why Apparel Sellers Use On-Model Images* · *AI Fashion Model Generator vs a Photoshoot vs an Editing Service* |
| 2 | **Mechanism** | *How Flat-Lay → On-Model Actually Works* → the two-stage anchor-then-scene method · **the ownership rule: the garment reference contributes everything about the clothing; the model reference contributes only pose, framing, lighting, background and body type** |
| 3 | **What goes wrong** ⭐ | *The Three Failures That Survive the Most Revisions* → **silhouette drift** (a fitted reference imposing its own fit on a boxy product — it moves the two dimensions a buyer measures) · **inner-layer bleed** (an inner garment from the reference surviving into the output) · **colour drift across a set** (the single most persistent class: hue may not move, even when brightness does) |
| 4 | **Procedure** ⭐ | *How to Check an On-Model Render Before You List It* → measure by **ratio, never pixels**, against pose landmarks · **never measure output against source** (a dress form and a person share no landmark) · **count discrete details** — buttons, buckles, visible seams · **detail must survive zoom**, not merely read at thumbnail · **verify at delivery resolution** |
| 5 | **The rubric** ⭐ | *The 27-Check Fashion E-commerce Visual QA* → four tables: garment fidelity (11) · model (5) · photography (5) · commerce (6) |
| 6 | **Long-tail harvest** | *Frequently Asked Questions* — **14 questions**, §5 below |
| 7 | **Internal links** | *More Product Photo Tools* → `/tools/ecommerce-photo` · `/tools/ai-product-photo-generator` · `/tools/packaging-mockup` · `/blog/ghost-mannequin-ai-guide` |
| 8 | **Close** | *Upload a flat lay* — ⚠️ **NOT "free, no sign-up"**: the `generate` action bills `IMAGE_GENERATION_CREDITS = 5` and `/images/upload` 401s for anon users. That copy is true of `/tools/wedding-photo-editing` (anonymous `photo_retouch` endpoint) and false here. `pricing.ts:8` records the same bug shipping once before — a FREE badge over a 696-credit call. **The rubric is the free thing; say that instead.** |

**Block 3 is the whole differentiator.** It is first-hand, it is specific, and it cannot be
assembled by an LLM from other people's pages.

⭐ **Headline pull-quote for the hero** (paraphrased from the rubric, safe to publish):
> A single frame can pass every aesthetic judgement and still fail the set.

And the framing the rubric itself gives: a volume buyer does not ask *can you make a beautiful
image* — they ask *can you produce listing-ready images at batch, reliably.*

## 4. Ordering block 3 by the buyer's own ranking

The rejection taxonomy was handed over **before any work was shown**, and its ordering is the
finding. Publish it in the buyer's order, paraphrased, never pasted:

1. **The garment is not the garment** — marked by the buyer as the overriding concern
2. Stiff posing
3. Oily skin and hair, over-smoothed, obvious AI tells
4. Head too large, reads heavy, poor proportion
5. Colour deviation — uneven skin tone, and drift between studio and outdoor
6. Season mismatch in styling
7. Images too similar across the set

**Fidelity outranks attractiveness, and it is not close.** That single sentence is the page's
thesis and it is the opposite of how every competitor on the SERP sells.

## 5. The 14 FAQ questions — long-tail harvest

The teardown's key insight: the FAQ is a keyword harvester, not a support section. It absorbs a
whole cluster into one URL.

1. What is an AI fashion model generator?
2. Flat lay, on-model, or ghost mannequin — which does my listing need?
3. Can I use one reference photo for a whole set?
4. Why does the garment change when it goes on the model?
5. What is inner-layer bleed?
6. What is silhouette drift, and why does it matter more than it looks?
7. How do I check garment length without a measurement?
8. Does the model have to be the same person across a set?
9. What breaks a set that does not break a single image?
10. Can I use these images on Amazon, Shopify or TikTok Shop?
11. What resolution and aspect ratio do marketplace listings need?
12. How many frames does an apparel listing actually need?
13. Which clothing categories work, and which do not?
14. Is it free, and do I need an account?

⚠️ **Questions 10, 11 and 13 need real answers from the pipeline, not invented ones.** The 09-01
note flags exactly this: *"Needs the real limits/formats/credits so we do not invent claims."*

## 6. Schema — three additions, all currently missing

`tool-generic-client.tsx` emits `FAQPage` only. The competitor emits four types.

| type | source | status |
|---|---|---|
| `FAQPage` | `faq.q1..N` | ✅ exists — but **hard-capped at `[1,2,3,4,5]` in two places** (render loop ~line 256, schema ~line 272). Both `.filter()` on `t.has()`, so widening the array to 14 is safe and inert for tools with fewer questions. |
| `HowTo` + `HowToStep` | `deep.how` | ❌ missing. **All 23 tool namespaces already have a `deep.how` block**, so this is pure code with zero content writing — it lands for every tool at once. |
| `WebApplication` + `Offer` | `price: "0"` | ❌ missing. Honest: the tool is genuinely free and anonymous. |

⚠️ Price this honestly. `FAQPage` markup was **measured ineffective** on MBTI (CTR capture 3.4% →
1.4%). Expect rich-result eligibility, not a traffic event. The ranking work here is done by
blocks 3–5, not by markup.

## 7. ⛔ Blocker: imagery is not cleared, and the base rate is bad

`agentic-adhoc/resources/fashion-materials/clearance.md`:

> **Two for two.** Both images inspected closely enough to reject have failed on a third-party mark.

- `template-fashion-ecommerce-zh-jacket.jpg` — visible **CAMEL logo**
- `template-personal-fashion-outfit-style-variations-women-1.jpg` — three-stripe gum-sole sneakers
  reading as **Adidas Samba trade dress**
- **20 of 40** `template-fashion-ecommerce` variants have never been checked. *"Treat 'not yet
  rejected' as 'not yet looked at'."*
- All 7 `template-fashion-before-after-outfit-annotation-card` images are excluded from any
  retouching claim — the "after" only adds callout labels; **no retouch happened.**

**And the repo has zero on-model garment frames.** The only five on-model / flat-lay images are
accessories: handbag ×2, jewelry ×2, eyewear ×1.

**Consequence: this page cannot ship a photoreal on-model hero today.**

### ✅ Resolved 2026-09-21 — the body imagery is done, at zero clearance risk

Checked `curify-gallery/smm_daily/2026-09-01-ecommerce/` and built the gap. Four assets, none of
which contains a person, a third-party mark, or anything traced from a client file:

| asset | what it carries | spec block |
|---|---|---|
| `a4-two-ratio-check.jpg` | the two ratios, and *do not measure output against your source photo* — **usable as-is**, already branded to `/blog/ghost-mannequin-ai-guide` | 4 |
| `en-01-seven-rejection-classes.jpg` ⭐ new | the buyer's seven classes **in their order**, #1 pilled TOP PRIORITY | 4 |
| `en-02-qa-rubric-27.jpg` ⭐ new | all 27 checks by section, plus the acceptance rules | 5 |
| `en-03-three-failures.jpg` ⭐ new | silhouette drift · inner-layer bleed · colour drift | 3 |

Generator: `make_en_fashion_qa_cards.py` (gallery repo, commit `7cd54af`), 1200×1200, house palette
and typography from `make_a4_ratio_card.py`. **Every mark is drawn by the script** — no brand name,
style number, counterparty name or source filename appears, and no success-rate claim is made.
Regenerating is one command, so copy edits are cheap.

⚠️ **Still open — the photoreal hero.** `a1`, `a3` and `a6` are good apparel comparisons with
unbranded garments and a Curify watermark, but **each shows a photoreal face.** That is the same
unresolved likeness question recorded against `model_standing`: if a real model's photograph was
the reference, the output carries that person. **Answerable in one sentence by whoever generated
them** — confirm the reference was synthetic, or re-render. Until then the page opens on the
rubric cards, which is the honest posture anyway: we are selling the standard, not the render.

## 8. Files to touch

| file | change |
|---|---|
| `lib/tools-registry.ts` | new `ToolDef` — slug `ai-fashion-model-generator`, group `image`, namespace `aiFashionModelGenerator`, action `{type:"generate", templateId:"template-ai-outfit-try-on-poster"}`. Add `TOOL_RELATED_TOOLS`, `TOOL_BLOG_CATEGORIES` → `merch-pod`, `TOOL_PINNED_BLOGS` → `ghost-mannequin-ai-guide`. ⚠️ Skip `seoKeys()` — dead. |
| `messages/en/home.json` | the `aiFashionModelGenerator` namespace. **Its existence is what stops the route 404ing** (`lib/tool-page-guard.ts`). Needs `metadata.{title,description}`, `title`, `description`, `cta`, `why.*`, `deep.{what,how,usecases}`, `faq.q1..q14`. |
| `messages/<9 locales>/home.json` | replicate, or set `locales: ["en"]` — otherwise non-EN renders literal key paths. |
| `tool-generic-client.tsx` | widen `[1,2,3,4,5]` → 14 in **both** places; add `HowTo` + `WebApplication`/`Offer` JSON-LD. |
| `app/sitemap.xml/route.ts` | bump `TOOLS_LASTMOD`. |
| `public/data/blogs.json` | add the new tool to `ghost-mannequin-ai-guide`'s related links **at index ≤2** — only the first three render. |

**Proposed `<title>`** (62 chars incl. the layout's ` | Curify Studio` suffix):
`AI Fashion Model Generator — Flat Lay to On-Model`

## 9. Inbound links — do this before publishing, not after

`/blog/ghost-mannequin-ai-guide` **un-folded and went indexed on 2026-09-19**, and it already
points at `/tools/ecommerce-photo`. It is the natural first linker and it is freshly crawled.

⚠️ Per the 09-20 correction, the ≥3-indexed-links rule is a property of the **linkers' crawl
dates**, not of the target. Adding a link off a stale linker does nothing. Use pages crawled in
September: `ghost-mannequin-ai-guide` (09-19), `/tools` (09-16), `/blog/50-ai-makeover-prompts` (09-10).

## 10. Pre-registered readout — 2026-11-02 (T+6w)

| | criterion | consequence |
|---|---|---|
| **PASS** | ≥100 impressions/28d **and** position <20 on `ai fashion model generator` | build the second surface (`ghost mannequin ai` deserves its own page) |
| **MARGINAL** | 30–100 impressions | extend one window; do not build |
| **FAIL** | <30 impressions after six weeks indexed | the constraint is authority, not targeting — **stop expanding this cluster** |

Grade at T+14 minimum. ⚠️ Read alongside the **10-13** `ghost-mannequin-ai-guide` readout, which is
now unconfounded and is the cheaper test of whether KD 0–1 apparel terms convert at all. **If
10-13 comes back at zero, reconsider this build before starting it.**

## Cross-refs

- [`workstream-seo-smm-growth.md`](workstream-seo-smm-growth.md) §2026-09-01 (the teardown, priority #6), §2026-09-20 (title work compounds a position)
- [`seo-cluster-strategy-2026-09-19.md`](seo-cluster-strategy-2026-09-19.md) §2 (why the fashion-template cluster was closed — different intent, do not confuse)
- `agentic-adhoc/resources/fashion-materials/` — `axes.json` (the rubric), `clearance.md` (the blocker)
- `curify-studio/docs/tool-inventory.md` §Fashion on-model try-on — the PROTO status
- `curify-gallery/smm_daily/2026-09-01-ecommerce/` — A1–A9, body copy already written
