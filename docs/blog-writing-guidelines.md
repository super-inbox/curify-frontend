# Blog Writing Quality Guidelines & Guardrails

_Codified 2026-06-01 from ~13 significant rewrites + ~6 new posts shipped in May 2026. Stable reference; update only when a NEW pattern emerges (not for every post). See `docs/blog-quality.md` for the running progress log + ad-hoc audits._

Owner: jay. Read this before authoring a new post or substantively rewriting an existing one.

---

## 0. The four jobs of a Curify blog post

1. **Rank** for at least one specific search query (head term or long-tail).
2. **Match reader intent** — if the title promises a comparison, deliver a comparison.
3. **Funnel to a tool/use-case page** via honest positioning, not marketing flourish.
4. **Get cited by an LLM** (AEO) — extractable facts, structured answers near the top.

Every guideline below serves one of these four. If a "rule" doesn't, ignore it.

---

## 1. Voice & tone

### Hard rules

| Avoid | Use instead | Why |
|---|---|---|
| "Revolutionizing", "the pinnacle of", "game-changing" | A concrete observation | Triggered the 2026-05-18 P1 sweep — these were the strongest fluff telltales across 5 posts |
| Benefit bullets without anchors ("✓ Faster ✓ Better ✓ Smarter") | Numbered points with a specific *what* and *how* | Reader skips fluff; the post becomes a soft-pitch read |
| "Discover how…", "Learn how to…", "Comprehensive guide to…" intro | A problem-first hook or a stake-named opener (see §3) | Same intro across 5+ posts signals mass-generated content; Google notices |
| "10k+ creators", "47% higher engagement", "X faster" without source | Real numbers + source, or don't make the claim | Unverifiable claims erode credibility and hurt AEO |
| Marketing-slogan conclusions ("Distribution is the new differentiation") | A short principle list + a concrete next step | Slogans are filler; principle lists give the reader something to act on |

### Tone register by post type

- **Tutorial post** (e.g., Curify + Webflow integration): over-the-shoulder, sitting-next-to-the-reader voice. "Open Webflow Designer → ..." not "First, leverage Webflow's intuitive interface to..."
- **Comparison post** (e.g., best-programmatic-seo-tools): decisive, opinionated, rank-by-use-case. Not "These are all great options, depending on your needs."
- **Case-driven post**: data-first opener, specific company/industry framing, anonymize until the case subject signs.
- **Guide post** (e.g., style-transfer-ai-guide): patient explainer, named worked examples per section.

### Honest positioning

Curify is **not** the best at everything. Pick a real wedge:

- **Voice cloning?** ElevenLabs wins on fidelity. We position Curify as a *dubbing tool that uses voice cloning internally* — different category.
- **Programmatic SEO?** AirOps wins on AI content generation. We position Curify as the *visual layer above their CMS pipeline* — complementary, not competing.
- **Image generation?** Nano Banana Pro IS the model we use. We position Curify as *the templating layer above it* — the moat is consistency at scale, not single-image aesthetic ceiling.

The "Curify callout" in a comparison post should say what we're NOT, then what we are. Readers trust the post more; the few who match our actual wedge convert sharper.

---

## 2. Structure patterns (proven)

### Pattern A: "Best X tools" comparison (3-tool template)

Validated on `voice-cloning-tools`, `best-ai-tools`, `best-programmatic-seo-tools`. Schema:

1. Intro (problem-first hook + reject the 15-tool listicle pattern)
2. Who this is for (audience filter)
3. Quick buyer's guide (4-5 dimensions that matter)
4. Methodology ("How we picked these three" — name the tools we dropped, explains the cut)
5. **Three** per-tool detail cards (NOT more). Each: image header → tagline → 4-field micro-list (Best for / Pricing / Languages or Integrations / Notable limitation) → "When to pick" paragraph
6. Side-by-side comparison table (same 4 dimensions × 3 tools)
7. Decision rubric (pick-by-use-case)
8. **Curify callout** (gradient-banded, honest positioning, distinct from the 3 cards)
9. Compliance / Pitfalls section (whichever applies)
10. FAQ (6 Q&A pairs targeting long-tail queries — includes the funnel-back to Curify question)
11. Conclusion (the short version, 3-line recap)

Component: `BestProgrammaticSeoToolsContent.tsx` is the canonical reference (mirrors `BestAiToolsContent.tsx` which mirrors `VoiceCloningToolsContent.tsx`).

### Pattern B: Tutorial post (6-step + comparison)

Validated on `curify-webflow-programmatic-seo-integration` + the per-country soccer poster posts.

1. Intro (gap framing + tutorial promise + sister-post link)
2. What it actually means architecturally (mental model)
3. The mental model in 3-step data flow form
4. **6 concrete steps** (each: goal sentence + the action + a code/config snippet or worked example + a gotcha)
5. Tools comparison (4-way table positioning the approach honestly)
6. 3 pitfalls + fixes
7. Curify callout + cross-links to tool / use case
8. Conclusion (3-principle recap, action verb close)

Schema mirrors `brazil-argentina-soccer-poster-prompts` (29 keys). Renders via `GenericBlogContent`; no new component needed.

### Pattern C: Guide / explainer (5-style or 5-method)

Validated on `style-transfer-ai-guide`, `ai-product-photo-generator-guide`, `10-prompting-tips-nano-banana` (rewrite).

1. Intro
2. What it is + what changed recently
3. The Curify pipeline / model
4. **5-6 named buckets** (one per style/method/category). Each: "best for / when it fails / gallery anchor"
5. Tools comparison
6. Pitfalls + fixes
7. Curify callout
8. Conclusion (principle list)

### Engagement parity (mandatory for new posts)

Per the 2026-05-30 engagement-funnel audit + 2026-05-31 BlogInlineClickTracker fix:

| Component | Required for new posts | Why |
|---|---|---|
| **Hero image + CTA above the fold** | YES — `heroImage` + `heroCtaText` + `heroCtaHref` keys in the namespace | mbti-character-generator at 33% engagement vs 0-6% on non-hero blogs. Single biggest engagement multiplier we have measured. |
| **`BlogInlineClickTracker` wrapping the body** | YES (automatic in `GenericBlogContent`; manual for dedicated components) | Captures per-link click events for funnel attribution |
| **Internal links open in same tab** | YES (default in `content-formatters.ts`) | External `_blank` ends session with single PAGE VIEW → bot-filter strips it → not counted as DAU |
| **`BlogCTACard` at the bottom** | YES (by category default) | Single canonical CTA placement; no body-text CTA repetition |

Skip any of these and the post bleeds engagement silently. Verify post-deploy via the engagement-funnel SQL in `docs/blog-quality.md`.

---

## 3. Opening hooks that work

Three opener patterns have outperformed in practice:

| Pattern | Example | Use when |
|---|---|---|
| **Problem-first stakes** | "Cloning a voice used to take a Hollywood studio and thousands of dollars. Today it takes 30 seconds and a $5/mo plan. That's a creative gift for podcasters, video makers, and product teams — and a scam vector that's already cost real people millions." | Reader needs to feel why this matters; topic has clear before/after framing |
| **Reject-the-listicle** | "Most 'best AI voice cloning tools' lists pad to 15 entries because padding helps SEO. We disagree. Three tools cover almost every real use case…" | Comparison posts in crowded SERPs; positions you as opinionated/honest |
| **Data shock** | "Sites with 1,000-page programmatic SEO get a 21% organic-traffic gap from a single under-served locale. Here's how to close it." | Case-driven or data-driven posts; specific numbers must be real or anonymized-but-honest |

Avoid: "Comprehensive guide to…", "Discover how…", "Learn the secrets of…". These are the AI-marketing telltales documented in the rewrite tracker.

---

## 4. ICU MessageFormat traps (mandatory avoid list)

next-intl uses ICU MessageFormat. **Three patterns trip the parser** and cause silent fallback to the dot-path key in production. All three are documented incidents:

| Trap | What looks like | Why it breaks | Use instead |
|---|---|---|---|
| **Curly-brace tuples** | `{name, type, opt}`, `{ field: value }`, `{{ template_var }}` | ICU reads as variable+format expression → `INVALID_ARGUMENT_TYPE` | Backtick-wrap as inline code (`` `name, type, opt` ``) or use placeholders like `NAME` / `TYPE` |
| **Paired HTML tags** | `<div>...</div>`, `<a>...</a>`, `<table>...</table>` | ICU expects rich-text tag callbacks; with none provided, returns empty string → section renders as bare H2 with no body | Render the HTML in JSX; pull image URLs from a const file; keep messages as markdown only |
| **Self-closing HTML with attributes** | `<img src="..." alt="..." />` (even attribute-only `<input />`) | INVALID_TAG → silently swallows the whole message → renders the dot-path key as text | Use markdown `![alt](src)` and let the formatter convert it to `<img>` with a uniform class |

Detection: every commit that touches `messages/<locale>/blog.json` should run:

```bash
node -e '
const { parse } = require("@formatjs/icu-messageformat-parser");
const fs = require("fs");
let fails = 0;
for (const loc of ["en","zh","ja","ko","es","fr","de","hi","ru","tr"]) {
  const d = JSON.parse(fs.readFileSync(`messages/${loc}/blog.json`,"utf8"));
  // walk the new namespace, parse each string value, count failures
}
console.log(`ICU parse failures: ${fails}`);
'
```

Or use the `formatContent` / `formatNanoBananaContent` formatters which now have the markdown-image rule baked in.

Reference commits: `a631def` (voice-cloning-tools INVALID_TAG fix); `15782ea` (curify-webflow MALFORMED_ARGUMENT + UNCLOSED_TAG + INVALID_TAG, all caught + fixed pre-publish).

---

## 5. i18n workflow (10 locales)

Standard pass for any post that touches `messages/en/blog.json`:

1. **Edit en first.** Write the full namespace; verify ICU parse clean.
2. **For refresh of existing keys** (not new keys): delete the changed keys from the 9 non-en files. Autotranslate fills only *missing* keys.
3. **Run autotranslate:** `node scripts/i18n_autotranslate.cjs --base en --files blog --write`
4. **Verify all 10 locales populated** (often takes 2-3 passes — script bails intermittently mid-fan-out).
5. **Catch the chronic gpt-4o-mini bug.** One locale per run (es, ko, ja most often) hits a JSON-parse failure after 3 retries — script gives up. Stopgap: copy en content into the missing locale so the page renders English on those sections rather than blank.
6. **Bump `lastmod` in `public/data/blogs.json`** for the slug. Sitemap re-crawl signal.
7. **Run ICU parse audit** post-translate (sometimes a translation introduces a new trap).

Pattern in commit message: name which locales hit the stopgap so future audits can refresh them when the LLM API recovers.

Reference: `feedback_blog_quality_workflow.md` for the full per-post step list.

---

## 6. CTR + SEO discipline

### Title

- **Lead with the search query phrase verbatim** if you're targeting a specific query.
  - Bad: "AI Style Transfer for Video"
  - Good: "Style Transfer AI for Video" (matches "style transfer AI" KD 25 exact)
- **60-66 characters** including the brand suffix (` | Curify`). Goes deeper than 66 → Google truncates → CTR drop.
- **Tier-2 nouns in the title** for long-tail catch ("AirOps vs Webflow vs WordPress" not just "Programmatic SEO Tools").

### meta description

- **147-158 characters.** Goes shorter → Google generates its own from body. Goes longer → truncated.
- **Lead with the exact answer to the implied query.** "Tutorial: wire Curify…" not "In this guide, we explore…".
- **Include the keyword.** Yes really. Google still weighs description-keyword match for SERP snippet bolding.

### Section H2 headings

- **Each H2 is a long-tail catch.** "How to ship a Brazil 2026 poster in 60 seconds" catches "brazil 2026 poster ai prompt" specifically.
- **Don't title sections "Overview" / "Introduction" / "Background".** Concrete H2s become anchor links readers + LLMs jump to.

### Body density

- **Real names, real numbers, real dates.** "AirOps charges per-character" beats "competitive pricing". Names create AEO citation opportunities.
- **One named worked example per principle.** Tied to a gallery template / a Curify tool / a real public document. Never a hypothetical.

---

## 7. Cross-linking (the interconnection layer)

Each new post must:

1. **Link to ≥1 parent / sibling post** in the same cluster (in the intro paragraph).
2. **Link to ≥1 tool page** (in the Curify callout or a relevant step).
3. **Link to ≥1 use-case page** (where the post's reader-persona aligns).
4. **`relatedLinks` in the catalog entry** — pick 2-3 cluster siblings, NOT just the most-trafficked posts. Cluster coherence > topical breadth.

Internal links use markdown `[label](/path)` and open in the SAME tab (formatter handles this). External links use markdown `[label](https://…)` and open in a new tab (formatter handles this too).

Per memory `reference_interconnection_layer.md`: tool pages today are dead-ends. When we audit interconnection (open item), the surface to fix is `/tools/[slug]` pages back-linking to relevant blogs. Track in `docs/interconnection.md`.

---

## 8. Gallery image embeds

When you reference a gallery template or example, **embed the image inline**:

```markdown
![Description for AEO + SEO](/images/nano_insp/template-XX-YY.jpg)

[Open this template →](/nano-template/template-XX/example/template-XX-YY)
```

Rules:

- **Markdown syntax only.** Never HTML `<img>` in message JSON (ICU trap, see §4).
- **Alt text must describe what the reader will see**, not the SEO keywords. "Same face across 9 Met Gala scenes" beats "AI product photo generator hero image".
- **CDN-served URLs only.** `/images/nano_insp/...` resolves to `cdn.curify-ai.com/images/...` via `toCdnUrl` + `CdnImage`.
- **Always pair the image with a link** below it pointing to the template or example. The image is the visual hook; the link is the conversion path.

The formatter (`formatContent` / `formatNanoBananaContent`) converts `![alt](src)` → `<img>` with the uniform `my-4 mx-auto max-w-md rounded-lg shadow` class. No need to specify size in messages.

---

## 9. AEO (2026 angle)

The 2026 SEO landscape splits into Google SERP rankings and LLM citations. AEO (Answer Engine Optimization) targets the second. Both AirOps and Webflow pivoted to AEO this year — it's where the new mid-tail is forming.

Patterns that earn LLM citations:

- **Explicit Q&A near the top of the post.** LLMs extract the first clear answer to the implied question. The FAQ section at the bottom helps too, but the implied question should also be answered in the intro or first H2.
- **Fact density.** Named tools (AirOps, Webflow, Curify), specific numbers (KD 9, $23/mo, 9-image grid), exact dates (2026-06-01, "in 2026 the breakthrough was X"). LLMs prefer the post that names things.
- **Structured tables.** A clean comparison table is easier for an LLM to extract than a paragraph. Use them.
- **Concrete code blocks / CSV examples.** LLMs cite code-snippet posts disproportionately because the snippet is self-contained.
- **Sources for claims that can be sourced.** "Google's spam policy" / "the FCC's 2024 declaratory ruling" linked to the canonical URL. Citations earn citations.

Don't over-AEO-optimize at the cost of human readability. The post still has to convert humans first; LLM citation is the second-order effect.

---

## 10. Pre-publish checklist

Run through before pushing:

- [ ] Title leads with the search query phrase verbatim
- [ ] Meta description 147-158 chars
- [ ] Hero image + heroCtaText + heroCtaHref keys populated
- [ ] ≥1 parent/sibling post linked in intro
- [ ] ≥1 tool page linked in Curify callout
- [ ] ≥1 use-case page linked somewhere in the body
- [ ] 6-step / 5-bucket / 3-tool structure (per §2 patterns), not free-form prose
- [ ] **FAQ section with 5-6 Q&A pairs** (catches long-tail + serves AEO)
- [ ] **Curify callout positioned honestly** (what we're NOT, then what we are)
- [ ] No fluff phrases (`§1` avoid list)
- [ ] Real numbers, real names, real dates throughout
- [ ] Gallery embeds use markdown `![alt](src)` syntax + paired link
- [ ] ICU parse audit clean on all 10 locales (no curly braces, no `<img>`, no paired HTML)
- [ ] `lastmod` bumped in `public/data/blogs.json`
- [ ] `relatedLinks` set to 2-3 cluster siblings
- [ ] One post per commit (per `feedback_blog_quality_workflow.md`)
- [ ] If significant rewrite (vs new post): add a row to the "Significant rewrite tracker" in `docs/blog-quality.md`

---

## 11. What NOT to put in this doc

This doc is for **stable patterns that survived multiple post iterations**. Don't add:

- One-off observations from a single post
- Current-week priorities (those go in `docs/blog-quality.md`)
- Specific KD targets (those go in the SEMrush KD queue section of `docs/blog-quality.md` and `project_weekly_semrush_kd.md` memory)
- Tool registry decisions (those belong in `lib/tools-registry.ts` comments)
- Per-post decisions like "we picked AirOps over Frase" (those go in the post's commit message)

Stable patterns only. If you find yourself adding a pattern after one post, wait. Three posts of the same pattern earns a section here.
