# Blog series spec — AI-agent design skills × design-to-manufacturing

_Drafted 2026-08-17. Inputs: `raw/seo-skills-manufacture-08-17/` (SEMrush KD + discussion),
`visual-search-adhoc@main docs/daily_report/8.16/design-skills-research/` (merged 7a5879d),
`curify-studio/docs/tool-inventory.md`, `dev/jayw/design-agent-v0/factory/`,
`curify-gallery/designAI_manufacturing/`._

---

## 0. The constraint that shapes this whole plan

A 2026-08-16 sweep of 420 sitemap URLs found **~20% of the site indexed**, dominated by
*"Discovered — currently not indexed, never crawled"*. `/tools/die-cut-sticker-file` — which
several posts below depend on — is 1,282 words, in the sitemap, and **has never been
crawled**.

**Publishing is not the deliverable.** A post that nothing links to and nothing crawls is
worth zero regardless of KD. Every post below therefore ships with three non-optional
attachments:

1. **≥3 inbound internal links** from already-indexed pages (`/blog` index does not count).
2. A **`lastmod` bump** on the pages it links to (`app/sitemap.xml/route.ts`; see the
   08-16 policy comment — bump only what actually changed).
3. An **Indexing-API submission** on publish day, plus a status recheck 7 days later.

Posts that cannot get 3 real internal links are not ready to write.

---

## 1. Asset reality check

Before any scheduling, what actually exists behind each keyword. This is where the
plan diverges from the 08-17 discussion.

| target keyword | vol | KD | CPC | backing asset | verdict |
|---|---:|---:|---:|---|---|
| `dieline generator` | 170 | 19 | **$2.75** | `/tools/die-cut-sticker-file` LIVE · sticker + acrylic exporters · 仁寿盒 刀版展开图 + .ai source · `labubu-刀线预览` · **CMYK washed-vs-fixed** · production ZIPs | **strongest — real product AND before/after proof** |
| `claude code design skills` | 70 | 19 | **$11.14** | 39 candidates, 19 deep reviews, 12-item S/A shortlist, 10-dimension rubric | **strongest content moat** |
| `claude code frontend design` | 90 | 27 | $12.32 | Anthropic `frontend-design` deep review (S-tier) | good |
| `character turnaround sheet` | 480 | 20 | **$0.00** | `threeview/` — 3 documented cases + `image_to_threeview.py` + **factory floor photos** (`smm_daily/2026-08-17-three-view-factory`) | **best-evidenced post in the plan** |
| `best claude code skills` | 260 | 36 | — | same corpus | good, later |
| `AI tech pack generator` | 90 | **1** | $2.79 | partial — `case_acrylic/_pkg/06_spec.pdf`, white-ink + cutline layers, layered-PSD set; no tech-pack *tool* | **explainer, built from the spec package** |
| `claude code figma` | 390 | 43 | — | `figma-implement-design` (deprecated host) | later |
| `codex skills` | 1,900 | 47 | — | `Codex-Skills` deep review | pillar, last |

**Correction to an earlier draft of this spec (2026-08-17):** the first version claimed
`character turnaround sheet` had one backing template and `AI tech pack generator` had
nothing. That was from surveying `nano_templates.json` only and never opening the asset
folders. Both were wrong — see §3. The manufacturing cluster is the *better-evidenced* of
the two, not the weaker one.

**One correction to the discussion's ranking still stands:**

- **`AI tech pack generator` should not be titled as a generator.** KD 1 is remarkable and we
  do have partial assets — `06_spec.pdf`, the white-ink/cutline layer set, layered-PSD — but
  there is no tech-pack *tool*. A generator-shaped title with no generator is the same
  intent mismatch that left `/blog/best-programmatic-seo-tools` at p24 advertising the wrong
  subject. Ship it as an explainer built from the spec package; revisit as a tool page if it
  earns impressions.

**Revised order:** `character turnaround sheet` moves to the FRONT of Cluster B on the
strength of its evidence, not its volume.

---

## 2. Cluster A — AI agent × design

Source: `visual-search-adhoc@main`, `docs/daily_report/8.16/design-skills-research/`
(merged as `7a5879d`) — a stable citable artifact, no prerequisite.

**Twelve files, not one.** An earlier draft of this spec treated the corpus as a single
findings doc. Four of them change what the posts should be:

| file | feeds | why it matters |
|---|---|---|
| `SOCIAL_MEDIA_SHORTLIST.md` | **A1 body** | The 12 picks are already written in publish shape: source · helps-with · who-it's-for · strongest capability · what makes it different · **important caveat** · social angle. A1 is largely an edit, not a draft. |
| `SOCIAL_MEDIA_DRAFT.md` | SMM | Post copy — feeds the social distribution of A1, not the post itself. |
| `CURIFY_CAPABILITY_FINDINGS.md` | **A3** | Patterns abstracted from the reviewed skills and mapped to *our* workflows, each with underlying principle, failure prevented, and risks. This is the original argument. |
| `INTERNAL_EXPERIMENTS.md` | **A3** | Five experiments tiered `worth_studying` / `worth_experimenting` / `worth_adopting`, with the explicit statement that **nothing has graduated to `worth_adopting`**. |

The differentiator is that this is not an awesome-list. It scores 19 skills across 10
dimensions, separates *strong implementation* from *strong presentation*, and documents what
it could **not** verify (`hyperframes-creative` 404'd; `ui-ux-pro-max-skill`'s "119
guidelines" claim checked and found unsubstantiated; `openai/plugins` archived). That
honesty is the moat — every competing post is a link dump.

### A1 · Pillar — `/blog/best-claude-code-design-skills`
**"The Best Claude Code Design Skills, Actually Tested (2026)"** · `claude code design skills`
70 / KD 19 / CPC $11.14

- Lead with the **rubric**, not the list: 10 dimensions, S/A tiering, marketing-vs-substance.
- The 12 shortlisted skills, each with: what it really does · the validation loop · the
  caveat. Caveats are the credibility (`guizang` is AGPL-3.0; `product-shots` needs a paid
  image API; `visual-verdict` states no license).
- A section on what got **cut and why** — `theme-factory`, `hyperframes-creative`,
  `platform-design-skills`, `photo-abstract-editorial`. Nobody else publishes their rejects.
  Note the shortlist also cut three genuinely **A-tier** resources (`webapp-testing`,
  `figma-implement-design`, `video-shotcraft`) for category-diversity reasons, not quality —
  they're in README honorable mentions and are ready-made follow-up posts.
- Carry each pick's **caveat** through verbatim; they are the post's spine, not footnotes
  (`guizang` AGPL-3.0 — flag on every mention; `product-shots` needs a paid image API;
  `styleseed`'s +5.3-point benchmark is self-reported and its own demo self-scores 58/100).
- **Images required.** The research is text-only today; screenshots of each skill's actual
  output are the single biggest quality lift available (see §5).
- Internal links out → `/tools/brand-direction-explorer`, `/topics/branding`, `/design-agent`.

### A2 · `/blog/claude-code-frontend-design` · `claude code frontend design` — 90 / KD 27 / $12.32
Built on the S-tier Anthropic `frontend-design` review. The hook is its two-pass structure —
brainstorm → critique against known generic-AI defaults → build → screenshot self-critique —
and that its self-critique is **human-in-the-loop, not automated**, which is why you pair it
with `impeccable` or `styleseed`. Cross-link A1.

### A3 · `/blog/ai-design-validation-loops` · long-tail, no direct KD
The strongest *original* argument in the corpus, and better supported than first credited —
`CURIFY_CAPABILITY_FINDINGS.md` Pattern 2 is exactly this post, already argued.

Thesis: **generation and verification are different competencies and should be separate
steps**, not conflated into "generate well the first time." Five specimens, all verified:
`impeccable`'s 59 deterministic rules (no LLM call in the detection step), `styleseed`'s
dual gate (rule score *and* rendered pixels), `excalidraw-diagram-skill`'s Playwright
render→screenshot→fix, `guizang`'s `validate-social-deck.mjs` (9 fault classes post-render),
and `visual-verdict`'s JSON contract (`score` 0–100, `verdict`, `differences[]`,
`suggestions[]`) gated at 90+ specifically to drive iterate-until-pass.

Close with `INTERNAL_EXPERIMENTS.md`: five experiments we derived, tiered, **none of which
has graduated to `worth_adopting`**. Publishing a "here's what we haven't adopted yet"
section is the same credibility play as A1's rejects — and it's honest, since E1–E5 are
proposals, not shipped work. Do not imply otherwise.

This is the link-earning post, not the traffic post.

### A4 · `/blog/best-claude-code-skills` · `best claude code skills` — 260 / KD 36
Broader roundup; only after A1–A3 give it internal links to inherit.

### A5 · `/blog/codex-design-skills` · `codex skills` — 1,900 / KD 47
The `Codex-Skills` (TheGoat395) review plus the honest finding that the pool skewed
20-Claude-to-1-Codex and that `openai/plugins` is archived. Longest-term; needs A1–A4's
authority first.

**Deliberately not targeted yet:** `claude code skills` (8,100 / KD 60) and `claude skills`
(27,100 / KD 72). The ladder is 19 → 27 → 36 → 47, then reassess.

---

## 3. Cluster B — design → manufacturing

**This is the better-evidenced cluster.** It has something Cluster A does not: real factory
output, including a documented failure and photographs from an actual production floor.

### B1 · `/blog/character-turnaround-sheet-guide` · `character turnaround sheet` — 480 / KD 20
**Now leads the cluster.** Highest volume in either cluster *and* the strongest evidence.

Assets (`designAI_manufacturing/threeview/`, pipeline
`dev/jayw/design-agent-v0/threeview/image_to_threeview.py`):

| case | input | outcome |
|---|---|---|
| **haarland** | our own chibi turnaround sheet | ✅ reference case, `--band-only`, no model call |
| **dragon** | one photo of a metal figurine | ✅ coherent front/side/top, consistent scale |
| **snake** | one photo of a coiled figurine | ❌ **three different sculptures** — loop topology differs per view |

Plus `smm_daily/2026-08-17-three-view-factory/factory_live{1,2,3}.jpg` — photographs from the
factory floor.

The post writes itself around the README's two theses, both non-obvious and both ours:

1. **"AI draws the views; code draws every number."** The prompt *forbids* the model from
   rendering dimension lines, because a number on a drawing reads as authoritative and the
   model's numbers are decorative. That single sentence is the whole argument for why a
   render is not a spec.
2. **"The lesson is about the INPUT, not the prompt."** The snake failed because a
   self-occluding glossy coil cannot be resolved from one photo — no prompt fixes that.

Publishing the snake failure is the credibility move, exactly as the rejects section is in
A1. And the framing — *a factory can quote from a dimensioned three-view; it cannot quote
from a render* — is the commercial point the $0.00 CPC hides.

Links → `/tools/character-sticker-sheet`, `/tools/acrylic-factory-export`,
`template-ip-character-expression-sheet`.

### B2 · `/blog/dieline-generator-guide` · `dieline generator` — 170 / KD 19 / CPC $2.75
Best commercial intent, and better supported than the first draft credited:

- **仁寿盒** (`3D-mockup/fortune-box/`) — a real 刀版展开图 dieline, the `.ai` source, 45°
  and front renders, plus the `renshou-dieline-to-3d-EN` and `packaging-3d-proportion-trap-EN`
  cards.
- **`labubu-刀线预览.png`** — cutline preview over live artwork.
- **`CMYK-washed-vs-fixed-EN.jpg`** — a before/after of exactly the failure the post is
  about: why printers reject files.
- `factory/case_acrylic/_pkg/` — `01_artwork_front`, `02_artwork_back`, `03_white_ink`,
  `04_cutline.svg`, `05_preview`, `06_spec.pdf`, plus shipped production ZIPs.

Structure: what a dieline is · cut line vs bleed vs safe area · **the CMYK washout, shown
before and after** · dieline → 3D proof · the packaging proportion trap.

Links → `/tools/die-cut-sticker-file`, `/tools/acrylic-factory-export`, `/topics/stickers`,
`/topics/packaging`.

> **2026-08-27 correction.** The line here used to read "this is still the fix for
> `/tools/die-cut-sticker-file` never having been crawled." **That is now out of date** —
> measured 08-27, die-cut-sticker-file is *Submitted and indexed*, crawled 08-23. The merch
> workflow-ladder step added on 08-17 fixed it without B2. The link argument still holds,
> but it now points at two DIFFERENT pages:
>   - `/tools/acrylic-factory-export` — *Discovered, never crawled*, still on 1 real source.
>   - `/topics/stickers` — never crawled; link topology raised from 2 sources to 4 on 08-26,
>     and it sits on the manual Request-Indexing shortlist.
>
> This matters for sequencing because A1 was published 08-18 and crawled **08-19 — one day**.
> The blog is the fastest-indexing surface we have, so a blog post is the most reliable way
> to inject links into pages that Google otherwise refuses to crawl. That is an argument for
> running **B2 before A2**, inverting the schedule below: B2 is also lower difficulty
> (KD 19 vs 27), higher volume (170 vs 90), and carries commercial intent ($2.75 CPC).

### B3 · `/blog/what-is-a-tech-pack` · `AI tech pack generator` — 90 / KD 1
Explainer, not a generator page. Build it from `case_acrylic/_pkg/06_spec.pdf` and the
white-ink/cutline layer set — that package *is* a tech pack in everything but name — plus
the `layered-PSD` set (labubu, cinnamoroll, mbti, product; EN+ZH). Cover BOM, measurements,
colourways, construction, and which of those Curify already emits. Revisit as a tool page if
it earns impressions; KD 1 makes it a cheap test.

### B4 · programmatic supporting pages — the 20-volume tail
`acrylic keychain template` · `acrylic standee template` · `plush design template` ·
`sticker dieline` · `sticker cut line` · `production ready artwork` · `product tech pack`.
All 20/mo, KD unavailable. Hold until B1–B3 prove the cluster indexes, then template them
under the B1/B2 pillars. Note `acrylic/acrylic_plates_{en,zh}.jpg` and
`smm_daily/2026-08-16-acrylic-factory-files` already cover the two acrylic terms.

**Tool pages already carry demo images** — `die-cut-sticker-file`, `acrylic-factory-export`,
`packaging-mockup` and `character-sticker-sheet` all have `demo.src` registered, so every
internal link from these posts lands on a page with a visual, not a bare description.

---

## 4. Schedule

Two posts a week, alternating clusters so neither stalls. Dates assume the prerequisite in
the same row is done first.

| week | date | post | prerequisite |
|---|---|---|---|
| 1 | 08-19 | **A1** pillar — best Claude Code design skills | capture skill screenshots (§5) — research already merged |
| 1 | 08-21 | **B1** character turnaround sheet | none — `threeview/` cases + factory photos already exist |
| 2 | 08-26 | **A2** Claude Code frontend design | — |
| 2 | 08-28 | **B2** dieline generator guide | pull frames from 仁寿盒 + CMYK washed-vs-fixed |
| 3 | 09-02 | **A3** design validation loops | — |
| 3 | 09-04 | **B3** what is a tech pack (explainer) | — |
| 4 | 09-09 | **A4** best Claude Code skills | A1–A3 live and linking |
| 4 | 09-11 | review checkpoint — no new post | see §6 |
| 6 | 09-23 | **A5** Codex design skills | A1–A4 indexed |
| 6+ | TBD | **B4** programmatic tail | only if B1–B3 index |

**08-24 collides with two existing checkpoints** (the KD re-measure for `programmatic seo
tools` / `ai packaging design`, and the FAQPage capture-rate test). Left deliberately clear.

---

## 5. Quality lift: images

**The two clusters are opposites here, and that asymmetry should drive sequencing.**

**Cluster A is image-poor.** The skills research is text-only. One screenshot of real output
per shortlisted skill is the highest-value single improvement to A1 — it converts a list into
evidence, and it is what competing posts cannot cheaply fake. `gallery.html` in the research
folder is the starting point. Constraint: screenshots of third-party repos are fine as
fair-use documentation, but caption each with source URL and license, and do not reproduce
any skill's proprietary output.

**Cluster B is image-rich and needs no new generation** — the images are ours, already
produced, and several are the *only* proof of the argument (a failure case and a CMYK
before/after cannot be argued in prose). Manifest in Appendix A.

Practical consequence: B1 could ship before A1 if screenshot capture slips. The schedule in
§4 keeps A1 first only because merging `visual-search-adhoc` is already on the critical path.

---

## Appendix A — Cluster B asset manifest

Paths relative to `~/curify-gallery/designAI_manufacturing/` unless noted.

**B1 · turnaround**
- `threeview/README.md` — the two theses, verbatim source for the post's argument
- `threeview/haarland/`, `threeview/dragon/`, `threeview/snake/` — the three cases
- `dev/jayw/design-agent-v0/threeview/image_to_threeview.py` — the pipeline
- `~/curify-gallery/smm_daily/2026-08-17-three-view-factory/factory_live{1,2,3}.jpg`

**B2 · dieline**
- `3D-mockup/fortune-box/仁寿盒-刀版展开图-脱敏.png` + `.ai` source + 45度/正面效果图
- `3D-mockup/fortune-box/xhs/renshou-dieline-to-3d-EN.jpg`,
  `packaging-3d-proportion-trap-EN.jpg`
- `sticker-print/cinnamoroll-teacup/xhs/CMYK-washed-vs-fixed-EN.jpg` ← the money shot
- `sticker-print/.../labubu-刀线预览.png`, `labubu-前后对比.jpg`
- `dev/jayw/design-agent-v0/factory/case_acrylic/_pkg/0{1..6}` + production ZIPs

**B3 · tech pack**
- `case_acrylic/_pkg/06_spec.pdf`, `03_white_ink.png`, `04_cutline.svg`
- `layered-PSD/` — 8 images (labubu · cinnamoroll · mbti · product, EN+ZH)

**B4 · acrylic tail**
- `acrylic/acrylic_plates_{en,zh}.jpg`, `smm_daily/2026-08-16-acrylic-factory-files`

**Already-live tool-page demos** (link targets that render a visual, not a bare description):
`/tools/die-cut-sticker-file` · `/tools/acrylic-factory-export` · `/tools/packaging-mockup` ·
`/tools/character-sticker-sheet` · `/tools/ai-product-photo-generator`.

Licensing note: 仁寿盒 is a real client dieline and the filename is marked 脱敏 (desensitised).
Confirm the client is unidentifiable in any frame published, or substitute the labubu preview.

---

## 6. Measurement — 09-11 checkpoint

Per-post at +14 days: indexed y/n (URL Inspection), impressions, position for the target
keyword, and inbound internal-link count.

**Kill criteria, decided in advance so they aren't rationalised later:**

- If A1 is not indexed by 09-11, **stop writing Cluster A** and fix crawl/authority first —
  more posts into an unindexed site is the mistake this plan exists to avoid.
- If B2 (dieline) is indexed but flat on impressions by 09-11, the dieline demand is not
  real at our authority level; drop B4 entirely.
- If B1 (turnaround) does not index, that is the strongest evidence in the plan failing to
  land — treat it as a site-wide crawl verdict, not a content verdict, and stop publishing
  until indexation is fixed.

---

## 7. Positioning

The clusters are one story, not two: **AI for designers → skills and workflows today →
design agents → factory-ready output → manufacturing tomorrow.** A1 and B1 are the two ends
of that arc, which is why they lead. Every post should be placeable on it.
