# Blog series spec — AI-agent design skills × design-to-manufacturing

_Drafted 2026-08-17. Inputs: `raw/seo-skills-manufacture-08-17/` (SEMrush KD + discussion),
`visual-search-adhoc@7a5879d docs/daily_report/8.16/design-skills-research/`,
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
| `dieline generator` | 170 | 19 | **$2.75** | `/tools/die-cut-sticker-file` LIVE · `factory/sticker_exporter.py` (real cutline SVG + CMYK + 300DPI ZIP) · case assets | **strongest — real product behind it** |
| `claude code design skills` | 70 | 19 | **$11.14** | 39 candidates, 19 deep reviews, 12-item S/A shortlist, 10-dimension rubric | **strongest content moat** |
| `claude code frontend design` | 90 | 27 | $12.32 | Anthropic `frontend-design` deep review (S-tier) | good |
| `character turnaround sheet` | 480 | 20 | **$0.00** | **1 template** (`3d-chibi-football-player-turnaround-sheet`) | biggest traffic, **thinnest assets, zero commercial intent** |
| `best claude code skills` | 260 | 36 | — | same corpus | good, later |
| `AI tech pack generator` | 90 | **1** | $2.79 | **NOTHING — no tool, no pipeline, no examples** | **content-only or don't ship** |
| `claude code figma` | 390 | 43 | — | `figma-implement-design` (deprecated host) | later |
| `codex skills` | 1,900 | 47 | — | `Codex-Skills` deep review | pillar, last |

**Two corrections to the discussion's ranking:**

- **`AI tech pack generator` is ranked too high at #4.** KD 1 is genuinely remarkable, but we
  have no tech-pack tool, no pipeline and no example output. Writing a page titled like a
  generator with nothing behind it is the same failure as `/blog/best-programmatic-seo-tools`
  ranking p24 while its title advertised the wrong subject — a page that mismatches intent.
  Either ship it as an honest **explainer** ("what a tech pack contains, and how to produce
  one") with no generator claim, or build the tool first. Do not ship a fake tool page.
- **`character turnaround sheet` leads on volume but trails on everything else.** CPC $0.00
  and informational intent mean no commercial pull, and we have exactly one template — a
  football-chibi one. It is a real opportunity but needs **asset work before content work**.

**Revised order:** lead each cluster with the target whose assets already exist.

---

## 2. Cluster A — AI agent × design

Source: `visual-search-adhoc@7a5879d`. **This branch is unmerged** — merge it before
publishing anything that cites it, so the research is a stable citable artifact.

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
- **Images required.** The research is text-only today; screenshots of each skill's actual
  output are the single biggest quality lift available (see §5).
- Internal links out → `/tools/brand-direction-explorer`, `/topics/branding`, `/design-agent`.

### A2 · `/blog/claude-code-frontend-design` · `claude code frontend design` — 90 / KD 27 / $12.32
Built on the S-tier Anthropic `frontend-design` review. The hook is its two-pass structure —
brainstorm → critique against known generic-AI defaults → build → screenshot self-critique —
and that its self-critique is **human-in-the-loop, not automated**, which is why you pair it
with `impeccable` or `styleseed`. Cross-link A1.

### A3 · `/blog/ai-design-validation-loops` · long-tail, no direct KD
The strongest *original* argument in the corpus: what separates a real skill from a prompt
wrapper is a **deterministic validation loop**. Concrete specimens: `impeccable`'s 59-rule
engine, `styleseed`'s dual gate, `excalidraw-diagram-skill`'s render→inspect→fix, and
`visual-verdict`'s JSON verdict contract (`score`, `verdict`, `differences[]`). This is the
link-earning post, not the traffic post. Ships third because it's the one others will cite.

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

### B1 · `/blog/dieline-generator-guide` · `dieline generator` — 170 / KD 19 / CPC $2.75
**Ships first in this cluster** because the product exists. `factory/sticker_exporter.py`
already produces `01_artwork.png` (transparent 300DPI), `02_cutline.svg`, and a CMYK
print-ready PDF — a real ZIP, not a mockup.

- What a dieline is; cut line vs. bleed vs. safe area; why printers reject files.
- Worked example using real exporter output.
- Links → `/tools/die-cut-sticker-file`, `/tools/acrylic-factory-export`, `/topics/stickers`.
- **This post is also the fix for `/tools/die-cut-sticker-file` never having been crawled** —
  it gives that page its first real inbound links.

### B2 · `/blog/character-turnaround-sheet-guide` · `character turnaround sheet` — 480 / KD 20
Highest volume in either cluster, but **blocked on assets**: one football-chibi template is
not a gallery. Needs 6–8 turnaround examples across styles first (chibi, realistic,
mascot, mecha). Treat the example generation as a prerequisite task, not part of the writing.
Angle: turnaround sheet → 3D → manufacturing, which is the path Curify actually walks.
Links → `/tools/character-sticker-sheet`, `template-ip-character-expression-sheet`.

### B3 · `/blog/what-is-a-tech-pack` · `AI tech pack generator` — 90 / KD 1
**Explainer only.** No generator exists; the post must not imply one. Cover what a tech pack
contains (BOM, measurements, colourways, construction) and how the pieces map onto assets we
do produce. Revisit as a tool page if the explainer earns impressions — KD 1 makes it a
cheap test of whether the demand is real.

### B4 · programmatic supporting pages — the 20-volume tail
`acrylic keychain template` · `acrylic standee template` · `plush design template` ·
`sticker dieline` · `sticker cut line` · `production ready artwork` · `product tech pack`.
All 20/mo, KD unavailable. **Not the wedge** — hold until B1–B3 prove the cluster indexes at
all, then generate as templated supporting pages under the B1 pillar.

---

## 4. Schedule

Two posts a week, alternating clusters so neither stalls. Dates assume the prerequisite in
the same row is done first.

| week | date | post | prerequisite |
|---|---|---|---|
| 1 | 08-19 | **A1** pillar — best Claude Code design skills | merge `visual-search-adhoc@7a5879d`; capture skill screenshots (§5) |
| 1 | 08-21 | **B1** dieline generator guide | export a real sample ZIP from `sticker_exporter.py` |
| 2 | 08-26 | **A2** Claude Code frontend design | — |
| 2 | 08-28 | **B3** what is a tech pack (explainer) | — |
| 3 | 09-02 | **A3** design validation loops | — |
| 3 | 09-04 | **B2** character turnaround sheet | **generate 6–8 turnaround examples first** |
| 4 | 09-09 | **A4** best Claude Code skills | A1–A3 live and linking |
| 4 | 09-11 | review checkpoint — no new post | see §6 |
| 6 | 09-23 | **A5** Codex design skills | A1–A4 indexed |
| 6+ | TBD | **B4** programmatic tail | only if B1–B3 index |

**08-24 collides with two existing checkpoints** (the KD re-measure for `programmatic seo
tools` / `ai packaging design`, and the FAQPage capture-rate test). Left deliberately clear.

---

## 5. Quality lift: images

The skills research is text-only. Adding **one screenshot of real output per shortlisted
skill** is the highest-value single improvement to A1 — it converts a list into evidence, and
it is what the competing posts cannot cheaply fake. `gallery.html` already exists in the
research folder as a starting point.

Constraint: screenshots of third-party repos are fine as fair-use documentation, but caption
each with its source URL and license, and do not reproduce any skill's proprietary output.

---

## 6. Measurement — 09-11 checkpoint

Per-post at +14 days: indexed y/n (URL Inspection), impressions, position for the target
keyword, and inbound internal-link count.

**Kill criteria, decided in advance so they aren't rationalised later:**

- If A1 is not indexed by 09-11, **stop writing Cluster A** and fix crawl/authority first —
  more posts into an unindexed site is the mistake this plan exists to avoid.
- If B1 is indexed but flat on impressions by 09-11, the dieline demand is not real at our
  authority level; drop B4 entirely.
- If `character turnaround sheet` examples aren't generated by 09-02, **skip B2** for this
  cycle rather than shipping a one-template gallery.

---

## 7. Positioning

The clusters are one story, not two: **AI for designers → skills and workflows today →
design agents → factory-ready output → manufacturing tomorrow.** A1 and B1 are the two ends
of that arc, which is why they lead. Every post should be placeable on it.
