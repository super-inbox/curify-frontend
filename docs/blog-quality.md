# Blog Quality Improvement — Status & Audit

_Last updated: 2026-05-30 (engagement-funnel deep-dive after World Cup GSC spike; 4-part fix shipped — P0 conditional target=_blank, P1a inline-click tracker, P1b+P2 hero+CTA block + i18n for 4 blogs; 3 deferred todos flagged). Owner: jay. Update after every push that touches blog content, `BlogCTACard.tsx`, `GenericBlogContent.tsx`, or `content-formatters.ts`._

## Framing

Three parallel tracks:

1. **Stop the bleeders** — surgical title + `metaDescription` rewrites driven by Search Console for high-impression / low-CTR URLs at positions ~6-12. No body changes; one sweep per 5-10 posts; bump `lastmod` so the sitemap signals a re-crawl.
2. **Significant content rewrites** — replace AI-marketing fluff with original prose anchored in actual Curify capabilities (real templates, real tool URLs, real example pages). One post per commit; expect to touch hero, sections, and remove ungrounded "benefit list" boilerplate.
3. **Layout & visual polish** — uniform basic layout across every blog and the feed: no giant hero images, relaxed reading width, consistent alignment, CTA card themed in light-purple + light-blue. Affects every reader on every blog, so the impact compounds across the whole catalog rather than being per-URL.

Both tracks share the same i18n fan-out: edit `messages/en/blog.json`, delete the stale `title` field in each non-en locale, run `scripts/i18n_autotranslate.cjs --base en --files blog --write`, bump `lastmod` in `public/data/blogs.json`.

**Feed source note (post-`4c84a7e`, 2026-05-19):** `public/data/blogs.json` is now the single source for the blog feed. The legacy `blog.posts[]` array in `messages/{locale}/blog.json` was removed — no per-locale `tag` fan-out needed when recategorizing.

---

## 2026-05-31 — session recap + next-P0 proposals

Heavy day across three workstreams. Recap and what's next:

### What shipped today

| Commit | What | Why |
|---|---|---|
| `c7e1770` | BlogInlineClickTracker: switch fetch+keepalive → sendBeacon | 2-day-post-deploy validation: 0 `blog-link:%` events landed across 213 blog landers; root cause was cross-origin keepalive POST cancellation on navigation. sendBeacon is W3C-standard for this exact case. Expect rising engagement-funnel numbers within 24-48 hr of Vercel propagation. |
| `6e18c21` | Tier 1 KD 9+29: `/blog/best-programmatic-seo-tools` | "programmatic SEO tool" at KD 9 is rare territory (most "best X tool" head terms are KD 50+). 3-tool comparison (AirOps, Webflow, WordPress) modeled on voice-cloning-tools. Wove in the AI search / AEO angle picked up from AirOps + Webflow homepages — both pivoted to AEO this year. |
| `03d0ed8` | Tier 2 KD 25: `/blog/style-transfer-ai-guide` + `/tools/style-transfer` meta refresh | 29-key blog targeting "style transfer AI" with 5 worked style buckets (Ghibli, Pixar, watercolor, anime, retro 80s). Tool meta now leads with "Style Transfer AI" word order for exact-query match. |
| `c4d0469` | Tier 2 KD 36: `/tools/ai-product-photo-generator` mini-tool + `/blog/ai-product-photo-generator-guide` | New mini-tool + new `single_image` demo type for tool-generic-client (reusable infrastructure for future image-output mini-tools). 6 templated workflows in the companion blog. |

### Tier 3 (KD 45 "video dubbing software") — deprioritized

Original 5/30 plan was a 30-min meta refresh on `/tools/video-dubbing` + the two related blogs. User flagged: low confidence that meta-only sweeps move the needle at this scale. Parked indefinitely — re-evaluate if the 6/6 GSC pull shows the term gaining impressions on our existing surfaces.

### Open trackers for 6/6 (data-driven re-evaluation)

| Trigger | Action |
|---|---|
| Next SEMrush KD pull due | Per `project_weekly_semrush_kd.md` weekly cadence (last shared 5/30) — re-prompt user for fresh KD when ≥7 days old |
| Engagement-funnel verification | Pull the `landers_with_followups` SQL (5/30 audit section) — expect non-zero `engaged_pct` across the 4 originally-fixed blogs + the 2 hero+CTA additions (character-prompt-generator, best-ai-tools) |
| GSC re-pull on Tier 1 + Tier 2 | Position + CTR readout on `/blog/best-programmatic-seo-tools`, `/blog/style-transfer-ai-guide`, `/blog/ai-product-photo-generator-guide` |

### Proposed next P0 (in ROI rank order)

User flagged that meta-only refreshes are unlikely to move the needle at this stage. Bigger swings worth considering before the next data check:

**P0 #1 — Build the programmatic SEO funnel deeper (~3-4 hr)**
We shipped the blog (`/blog/best-programmatic-seo-tools`) and the tool (`/tools/ai-product-photo-generator`) but there's **no concrete conversion path between them**. The tool page is demo + early access; readers landing from the blog don't see "how do I actually wire Curify into my AirOps / Webflow stack." Two posts close this gap:
- `/blog/curify-webflow-programmatic-seo-integration` — tutorial showing the actual integration shape (Webflow CMS feeding Curify template generation, output landing on per-SKU pages)
- `/blog/curify-airops-product-photo-pipeline` — case-study-style post on the same theme with AirOps
Highest expected revenue impact because programmatic SEO buyers have budget and clear intent.

**P0 #2 — Engagement-funnel hero+CTA i18n fan-out (~1 hr)**
TODO 2 from the 5/30 engagement audit, still open. The 4 originally-fixed blogs (`brazilArgentinaSoccerPosterPrompts`, `imageGenerationModelComparison`, `aeVsComfyUi`, `tenPromptingTipsVideoGeneration`) have `heroImage` / `heroCtaText` / `heroCtaHref` populated in **EN only**. Fan to 9 non-en locales. Low risk, predictable lift, maintains parity with the BlogInlineClickTracker fix that's now actually firing events.

**P0 #3 — Interconnection layer pass (~2 hr)**
Per memory `reference_interconnection_layer.md`: tool detail pages today are dead-ends, use-case pages don't link to blogs. We have great isolated posts but the cross-linking is patchy. A surgical pass that adds 2-3 explicit blog links to each tool page + 2-3 blog/tool links to each use case page would compound SEO and engagement without writing new content.

**P0 #4 — AEO content audit on top-10 posts (~3-4 hr, speculative)**
Both AirOps + Webflow pivoted to AEO this year. The 2026 SEO landscape is splitting into traditional SERP rankings vs LLM citations. Audit our top-10 blog posts for AEO readiness: add explicit Q&A near top, increase factual fact density (named tools, numbers, dates), structured-answer formatting that LLMs can extract. Lower confidence than KD-driven content because we don't have LLM citation tracking yet — but if even 1-2 of our posts get picked up by ChatGPT / Perplexity / Gemini, that's net-new traffic from a source we currently have zero share in.

**P0 #5 — `storyboard-to-pipeline` cleanup (~10 min)**
Small fix: line 284 of `app/[locale]/(public)/blog/storyboard-to-pipeline/page.tsx` has a stray `\`\`\`__` markdown marker that renders as literal text. Cheap polish.

---

## 2026-05-31 — BlogInlineClickTracker silent failure diagnosis + fix

User flagged: ~200 GSC clicks in the last 2 days (heavy on World Cup + ASL queries), but Session Engagement Funnel still shows ~0% engagement on those landers. The 5/30 fix didn't deliver the expected lift.

**Diagnosis (in order ruled out):**

| Check | Result |
|------|--------|
| Backend `/interactions/track` accepts our payload | ✅ direct curl POST → `HTTP 200`, row landed with case-coerced `PAGE`/`CLICK` enums |
| Tracker code in deployed Vercel bundle | ✅ `blog-link:` string present in `[locale]/(public)/blog/[slug]/page-*.js` |
| Working header MENU_LINK CLICK events | ✅ same useTracking flow, same enum coercion — 4 events landed correctly |
| `blog-link:%` events ever landed | ❌ **zero. ever.** in the entire history of `user_interactions` |
| Wrapper tree structure on live page | ✅ `<div><div class="space-y-6">` confirmed in rendered HTML (BlogInlineClickTracker IS wrapping the body) |

**Root cause:** the v1 tracker used `trackAction()` → `void trackInteraction()` → `fetch(..., { keepalive: true as never })`. The `keepalive` flag is unreliable for **cross-origin** POSTs that race against same-tab navigation. Page is at `curify-ai.com`; the API is at `*.azurewebsites.net`. Modern browsers cancel cross-origin in-flight requests on navigation more aggressively than same-origin. The keepalive flag mitigates this for same-origin but not reliably cross-origin.

**Fix (commit `c7e1770`):** switch from `trackAction` to `trackOnUnload`. `trackOnUnload` uses `navigator.sendBeacon` first (W3C standard for fire-and-forget POSTs during page unload — purpose-built for this case and reliable cross-origin), falls back to fetch+keepalive only if sendBeacon is unavailable. One-line callsite change in `BlogInlineClickTracker.tsx`.

**Verification plan:** post-deploy, query for `content_id LIKE 'blog-link:%'` in `user_interactions`. Expect rapid rise across all blogs using `GenericBlogContent`. Update Session Engagement Funnel query result here once 24+ hr of data has accumulated.

---

## SEMrush KD priority queue (2026-05-30 pull)

User shares fresh Keyword Difficulty (KD) data from SEMrush weekly. KD identifies low-competition keywords we can rank on with relatively cheap content. Memory `project_weekly_semrush_kd.md` tracks the cadence — re-prompt for the next week's pull when `last_shared_date` is ≥ 7 days old.

**2026-05-30 keywords + current surfaces audit:**

| Tier | KD | Keyword | Current surface | Play | Effort |
|------|----|---------|------------------|------|--------|
| 1 | **9** | programmatic SEO tool | `/blog/programmatic-seo-dtc-visual-first` (ICP narrative), `/use-cases/for-programmatic-seo`. **No tool comparison blog. No `/tools/*` landing.** | New blog `/blog/best-programmatic-seo-tools` — voice-cloning-tools shape, 3 tools (AirOps, Webflow, WordPress+WP All Import) + honest Curify callout for visual-heavy progSEO. Targets KD 9 + KD 29 in one post. | ~2-3 hr |
| 1 | **29** | seo automation tool | Subsumed above — sibling intent to "programmatic SEO tool" | Co-targeted in the same post | — |
| 2 | **25** | style transfer AI | `/tools/style-transfer` exists (status: `demo`). **No targeted comparison blog. Meta likely generic.** | Meta audit on existing tool page + short blog with gallery anchors | ~1 hr |
| 2 | **36** | AI product photo generator | 9+ templates (`product-poster`, `product-theme-promotional-poster`, `ai-outfit-try-on-poster`, `lifestyle-photo-grid`, `food-product-packaging-design`, etc). **No mini-tool page. No targeted blog.** | New mini-tool `/tools/ai-product-photo-generator` (asl-video-translator mini-tool shape) + blog anchor | ~2 hr |
| 3 | **45** | video dubbing software | `/tools/video-dubbing` live + `/blog/ai-video-dubbing-tutorial` + `/blog/how-to-dub-videos-naturally` (the dedicated-folder bleeder). | Meta-only refresh on `/tools/video-dubbing` + sibling blog metas to target "video dubbing software" phrase specifically | ~30 min |

**Tier 3 deprioritize (KD 50+):** `seo content tool` (50), `video transcription tool` (52), `AI seo tool` (55), `AI seo content` (56) — head-term authority + backlinks needed; not a content-only win.

**Sequence:** Tier 1 first (highest ROI on KD 9 — rare territory), then Tier 2 (asset-rich, low effort), then Tier 3 (quick meta refresh).

---

## Today's progress (2026-05-30 — engagement-funnel deep-dive + P0/P1/P2 fix)

### What triggered the audit

GSC clicks 2× from 5/27-5/29 driven almost entirely by World Cup queries (~80 clicks to `/blog/brazil-argentina-soccer-poster-prompts` alone). But DAU/iDAU on the admin panel barely moved. User asked us to debug.

### Findings

**(1) Tracking attribution worked correctly — page views landed in `user_interactions`.** Confirmed 86 unique visitors to the WC blog over 3 days (matches GSC's 79). The `current_page_route` column stores the Next.js route pattern (`/blog/[slug]`); the actual slug lives in `content_id`.

**(2) Zero of those 86 visitors took any follow-up action within 60 minutes.** The "1 follow-up action" my earlier query found turned out to be a duplicate PAGE VIEW fired 0.1s after the first (Next.js client re-mount). So the genuine engagement rate is **0/86 (0.0%)**. Single-event sessions get correctly filtered by the bot-free heuristic → those landers vanish from DAU.

**(3) The bounce problem isn't WC-specific — it's all blogs using `GenericBlogContent`.** Per-blog engagement over 7 days:

| Blog | Landers | Engaged % |
|------|---------|-----------|
| brazil-argentina-soccer-poster-prompts | 90 | **0%** |
| image-generation-model-comparison | 46 | 0% |
| asl-video-translator | 32 | 6% |
| character-prompt-generator | 27 | 4% |
| preserve-facial-features-ai-generation | 20 | 5% |
| f5-tts-voice-cloning | 17 | 6% |
| **mbti-character-generator** | 12 | **33%** ← outlier |
| ae-vs-comfyui | 12 | 0% |
| storyboard-to-pipeline | 12 | 0% |
| 10-prompting-tips-video-generation | 11 | 0% |
| ... rest of the 39 generic blogs | | 0-6% |

**(4) mbti-character-generator wins because it has structural advantages the generic blogs lack:**

- Custom `content.tsx` (356 lines) instead of shared `GenericBlogContent.tsx` (212 lines, text-only)
- `CdnImage` hero above the fold — visual hook that advertises "you can generate this"
- Specific links to template EXAMPLES (rendered output) rather than blank template forms
- The example page is itself sticky (preview image + reproduce panel)

### Three root causes (all in `GenericBlogContent` path)

1. **All inline markdown links rendered with `target="_blank"`** in `utils/content-formatters.ts` (5 different formatter functions, same pattern in each). Internal `/nano-template/...` clicks opened in a new tab → blog session ended with PAGE VIEW only → filtered by bot-free heuristic → not in DAU.

2. **No `onClick` handler on inline links** (plain `<a>` rendered via `dangerouslySetInnerHTML`). Even when clicks DO happen, no `CLICK` event lands in `user_interactions` → no per-link funnel possible.

3. **No visual hook above the fold.** `GenericBlogContent` opens with title + date + read-time + "Introduction" paragraph. No image, no widget, no obvious "do this next" CTA. Readers default to bouncing.

### Four-part fix shipped — commit `c3e5d32`

**P0 — conditional `target="_blank"` in `content-formatters.ts`** (5 markdown-link replacers all patched). Internal URLs (starts with `/`) open in same tab; external URLs keep `_blank`. Universal — every blog using `formatContent` is fixed.

**P1a — new `BlogInlineClickTracker.tsx`** client wrapper. Delegated `onClick` walks up from click target to nearest `<a>`, fires CLICK event with `content_id = blog-link:<slug>:<href>` for internal links only. Uses `trackAction` which posts with `keepalive:true` so the request survives same-tab navigation. Per-link funnel analytics now possible across all `GenericBlogContent` blogs.

**P1b + P2 — optional hero+CTA block in `GenericBlogContent`** that activates when i18n provides `{heroImage, heroCtaText, heroCtaHref}`. Pattern ported from mbti-character-generator. Single component change + i18n keys per blog = same impact as authoring 5 dedicated blog directories at ~1/5 the code.

Populated hero+CTA in `messages/en/blog.json` for 4 blogs:

| Blog | CTA → destination |
|------|-------------------|
| `brazilArgentinaSoccerPosterPrompts` | "Generate your own Messi vs Ronaldo poster" → `/nano-template/sports-battle` |
| `imageGenerationModelComparison` | "Browse 200+ ready-made templates" → `/nano-banana-pro-prompts` |
| `aeVsComfyUi` | "Run a full video pipeline in Curify" → `/tools/video-dubbing` |
| `tenPromptingTipsVideoGeneration` | "Put these 10 prompting tips into practice" → `/tools/video-dubbing` |

### Deferred todos

**TODO 1 — `storyboard-to-pipeline` has NO English i18n content.** The blog entry exists in `ja/zh/fr/ko/ru/blog.json` but is missing from `messages/en/blog.json` entirely. English readers see fallback boilerplate, not actual content — explains why the 12 weekly landers all bounce. Different gap from the others (missing translation, not missing CTA). Needs the upstream English copy authored before the hero block can be added.

  *Trigger to re-open:* immediate. This blog is a wasted entry — fix the EN content first, then apply the same hero+CTA treatment as the other 4.

**TODO 2 — Other 9 locales of the 4 fixed blogs are hero-less.** Hero keys are EN-only this commit. Other locales gracefully fall back via the `hasKey` check (hero block doesn't render). Worth a separate i18n pass to extend `heroImage`/`heroCtaText`/`heroCtaHref` to all 10 locales for these 4 blogs.

  *Trigger to re-open:* when GSC shows meaningful non-EN traffic to any of the 4 fixed blogs. Currently EN dominates GSC; not urgent.

**TODO 3 — Watch impact post-deploy.** Need to re-pull GSC + admin panel after the deploy has been live for 5-7 days to validate the conversion floor. Expected at least 8-10 weekly conversions across the 4 fixed blogs (vs current 0). Compare GSC clicks-to-blog vs new `blog-link:<slug>:*` CLICK events in the admin panel.

  *Trigger to re-open:* 2026-06-06 or later — pull GSC export + run a per-blog engagement query like the one in this audit; expect non-zero `engaged_pct` for the 4 fixed blogs.

### Methodology (reusable)

For per-blog engagement analysis, the query that produced the table above:

```sql
WITH blog_landers AS (
    SELECT
        SUBSTRING(content_id FROM '/blog/([^/?]+)') AS blog_slug,
        COALESCE(user_id::text, session_id) AS user_key,
        MIN(created_at) AS landed_at
    FROM user_interactions
    WHERE created_at >= NOW() - INTERVAL '7 days'
      AND action_type::text = 'VIEW'
      AND content_type::text = 'PAGE'
      AND content_id LIKE '%/blog/%'
      AND (user_id IS NULL OR user_id NOT IN (155, 1117))
    GROUP BY 1, 2
    HAVING SUBSTRING(content_id FROM '/blog/([^/?]+)') IS NOT NULL
),
landers_with_followups AS (
    SELECT
        bl.blog_slug,
        bl.user_key,
        BOOL_OR(ui.action_type::text != 'VIEW') AS had_interaction,
        BOOL_OR(ui.action_type::text IN ('GENERATE','COPY','REMIX')) AS had_replication,
        BOOL_OR(ui.action_type::text = 'CLICK') AS had_click
    FROM blog_landers bl
    LEFT JOIN user_interactions ui
      ON COALESCE(ui.user_id::text, ui.session_id) = bl.user_key
     AND ui.created_at BETWEEN bl.landed_at AND bl.landed_at + INTERVAL '30 minutes'
    GROUP BY bl.blog_slug, bl.user_key
)
SELECT blog_slug,
       COUNT(*) AS landers,
       COUNT(*) FILTER (WHERE had_interaction) AS interacted,
       COUNT(*) FILTER (WHERE had_replication) AS replicated,
       COUNT(*) FILTER (WHERE had_click) AS clicked,
       ROUND(100.0 * COUNT(*) FILTER (WHERE had_interaction) / NULLIF(COUNT(*), 0), 1) AS engaged_pct
FROM landers_with_followups
GROUP BY blog_slug
HAVING COUNT(*) >= 5
ORDER BY landers DESC;
```

The key insight buried in here: `content_id` (not `current_page_route`) carries the slug. `current_page_route` only stores the Next.js route pattern (`/blog/[slug]`).

After this commit lands, per-link funnel becomes available — query for `content_id LIKE 'blog-link:<slug>:%'` to see which inline links per blog drive the most clicks.

---

## Today's progress (2026-05-26 — GSC CTR-lift readout + B2B categorization)

### GSC CTR-lift on the 15 rewritten posts (5/13 → 5/25)

Compared `raw/curify-ai.com-Performance-on-Search-2026-05-13/Pages.csv` vs `…-2026-05-25/Pages.csv`. Time windows differ (5/13 looks 28d/90d, 5/25 looks 7d) so absolute click/impression deltas aren't comparable — but **CTR % and position are normalized**, so the lift signal below is real.

| Slug | Old CTR | New CTR | Lift | New Pos | Read |
| --- | --: | --: | --: | --: | --- |
| `lip-sync-technical-deep-dive` | 0.28% | 6.67% | 24× | 8.26 | Tiny sample (30 impr) — directional |
| `what-is-voice-cloning` | 0.03% | 0.39% | 13× | 8.80 | Position improved 10.55→8.80 ★ |
| `ai-youtube-video-translator` | 0.35% | **3.21%** | **9.2×** | 10.58 | **Biggest real win** — 7 clicks on 218 impr |
| `video-transcription-business-guide` | 0.38% | 2.08% | 5.5× | 13.39 | Position improved 15.5→13.4 |
| `10-prompting-tips-video-generation` | 0.37% | 1.41% | 3.8× | 10.06 | Position drift 8.25→10.06 |
| `image-generation-model-comparison` | 0.06% | 0.18% | 3× | 8.54 | Still floor-level; meta not the lever here |
| `f5-tts-voice-cloning` | 0.35% | 0.41% | 1.2× | 8.60 | Flat |
| `chinese-costume-history-infographic` | 0% | 1.54% | from-zero | 22.61 | Real but ranked deep |
| `voice-cloning-tools` | 0.25% | **0%** | regress | 8.32 | 752 impr, 0 clicks — concerning |
| `translate-youtube-video-to-english` | 1.16% | 0% | regress | 13.04 | Position dropped 9.6→13 — re-crawl drift |
| `how-to-dub-videos-naturally` | 0% | 0% | flat | 7.22 | Bespoke layout — meta alone isn't enough |

**Headline reads:**

1. **Playbook validated.** 8 of 11 posts with usable signal cross the 2× CTR threshold; standouts are `ai-youtube-video-translator` (9.2×, 3.21%), `what-is-voice-cloning` (13× + position gain), `video-transcription-business-guide` (5.5× + position gain).
2. **Position drift is a real side-effect** of bumping `lastmod` — many posts dropped 1-3 positions during re-evaluation. Most should recover next pull.
3. **4 concerning bleeders** that didn't respond to the meta-only treatment — needs deeper diagnosis from current 5/25 Queries.csv:
   - `image-generation-model-comparison` — 1,102 impressions, 0.18% CTR. Biggest absolute bleeder. Different framing experiment needed (title hook isn't winning the SERP).
   - `voice-cloning-tools` — 752 impressions, 0% CTR. Regressed from 0.25%. Possibly snippet vs intent mismatch.
   - `translate-youtube-video-to-english` — position dropped 9.6→13.0, CTR collapsed. Re-crawl drift or relevance signal lost.
   - `how-to-dub-videos-naturally` — 141 impressions on 5/25 (down from 1,008 on 5/13), still 0 clicks at position 7.22. Bespoke dedicated-folder layout may be the limiting factor, not the meta.

### B2B post categorization cleanup (single commit)

Closed the follow-up the 2026-05-25 audit (`e6f1ecc`) explicitly deferred for the DTC post, plus the tag-drift bug on Agency + EdTech.

| Change | Slug | Before | After |
| --- | --- | --- | --- |
| Category | `programmatic-seo-dtc-visual-first` | `ds-ai-engineering` | `content-automation` |
| BLOG_POST_OVERRIDES | `programmatic-seo-dtc-visual-first` | (none) | → `/use-cases/for-dtc-brands` + Calendly |
| Catalog tag | `ai-content-factory-for-agencies` | `"DS & AI Engineering"` | `"Content Automation"` |
| Catalog tag | `multimodal-ai-educational-publishing` | `"DS & AI Engineering"` | `"Content Automation"` |
| Catalog tag | `programmatic-seo-dtc-visual-first` | `"DS & AI Engineering"` | `"Content Automation"` |
| `lastmod` | All 3 above | (varied) | `2026-05-26` |

After this push, the **B2B-narrative routing pattern** is consistent across all 3 buyer-intent posts: `category: content-automation` + `BLOG_POST_OVERRIDES` → matching `/use-cases/for-<persona>` + Calendly direct. `self-improving-multimodal-search` correctly stays under `ds-ai-engineering` (it IS a real engineering deep-dive; MentorCruise CTA fits).

`BLOG_POST_OVERRIDES` table now has **8 entries**: 4 high-traffic creator-side routing fixes (character-prompt-generator, mbti-character-generator, 10-prompting-tips-nano-banana, ai-collage-digital-wallpaper-guide) + 4 B2B-narrative posts (multimodal-ai-educational-publishing, ai-content-factory-for-agencies, content-tagging-system, programmatic-seo-dtc-visual-first).

---

## Today's progress (2026-05-18, second push — duplicate consolidation)

The four pairs flagged in [Duplicates / orphans](#duplicates--orphans-to-consolidate) below + the `video_translation_eval` orphan + the `contentTaggingSystem.threeLayerApproach.layer3` F5-TTS contamination, all closed in one push. Net diff across `messages/*/blog.json` and dedicated-folder pages: **+185 / −6,386 lines** (≈ 6,200 lines of duplicate or junk content removed).

| Commit | What | Resolution |
| --- | --- | --- |
| `e57377f` | Pair 1: `ugcVideoTranslationScalingTiktoksShortsGlobalMarkets` (camel) vs `ugc-video-translation-scaling-tiktoks-shorts-global-markets` (kebab) | Deleted the camel namespace from all 10 locales. Kebab is canonical (matches the slug). No URL to redirect. |
| `a7011b7` | Pair 2: `gridCollageAiPrompts` vs `aiCollageDigitalWallpaperGuide` | Deleted `gridCollageAiPrompts` namespace + the `3x3-grid-collage-ai-prompts/` dedicated-folder page. Added 301 → `/blog/ai-collage-digital-wallpaper-guide` (base + locale-prefixed) in `next.config.ts`. |
| `f11608f` | Pair 3: `f5TtsVsElevenlabs` (144 keys, no intro) vs `f5TtsVoiceCloning` (rewritten) | Deleted `f5TtsVsElevenlabs` namespace + the `f5-tts-vs-elevenlabs/` dedicated-folder page. GSC showed the voice-cloning slug at 22× the impressions of vs-elevenlabs — kept it canonical. Added 301 → `/blog/f5-tts-voice-cloning`. |
| `7ef4e04` | Pair 4: `videoTranscriptionTechnicalDeepDive` vs `translateYoutubeVideoToEnglish` (shared "Go beyond basic …" intro template) | Kept both alive (different funnels — transcription is audio→text, translation is multimodal pipeline). Rewrote each intro to anchor in the specific stage of work it covers. i18n fanned to 9 non-en locales. |
| `4355568` | Orphan + contamination cleanup | Deleted `video_translation_eval` orphan namespace (had no catalog entry) from all 10 locales. Cleared 12 F5-TTS-contamination keys from `contentTaggingSystem.threeLayerApproach.layer3` across all 10 locales (layer3 is now `{}`; `ContentTaggingSystemContent.tsx` was already safeguarded via `safeRaw` helpers in `ffb6bea`, so empty doesn't crash). |

### Redirects shipped
4 new entries in `next.config.ts` (base + `:locale` for each):
- `/blog/3x3-grid-collage-ai-prompts` → `/blog/ai-collage-digital-wallpaper-guide`
- `/blog/f5-tts-vs-elevenlabs` → `/blog/f5-tts-voice-cloning`

### Dedicated-folder count drops to 29
Removed `app/[locale]/(public)/blog/3x3-grid-collage-ai-prompts/` and `app/[locale]/(public)/blog/f5-tts-vs-elevenlabs/` (each had its own `page.tsx` + `content.tsx`). Was 31; now 29.

### Coverage stats (post-push)
| Metric | 2026-05-18 first push | 2026-05-18 close (after this push) |
| --: | --: | --: |
| Real posts with `metaDescription` | 50 / 56 | **46 / 52** (4 namespaces removed: 3 dup namespaces all had meta + 1 orphan had meta) |
| Catalog entries with `lastmod` | 43 / 59 | **43 / 57** (2 catalog entries removed: `3x3-grid-collage-ai-prompts`, `f5-tts-vs-elevenlabs`) |
| Duplicate / orphan pairs remaining | 4 + orphan + contamination | **0** |
| Dedicated-folder pages | 31 | **29** |

The 6 entries still missing meta are 5 shared keys (`metadata`, `footer`, `finalThought`, `keyInsight`, `pinterestPlatform`, `ruleOfThumb`) + 1 yet-to-identify — no real post is uncovered.

---

## Today's progress (2026-05-18) — P1 rewrites + 2 new DS/AI posts

### P1 fluff rewrite — top 5 done (one commit each)
Sequenced by Search Console impression volume (verified against Pages.csv, which reordered the doc's prior candidate list — `nano-banana-prompt-ecosystem` had been listed first but actually ranked 4th by impressions). All five common changes: dropped unverified accuracy claims (95% / 90% / 98% / "10k+ creators"), dropped enterprise / marketing-grade adjectives, anchored every "Curify section" in real tool slugs or template ids, ended every conclusion with concrete next-step framing instead of "essential for modern businesses".

| Commit | Post | SC impr (28d) | Fields touched |
| --- | --- | --: | --- |
| `9c8fe83` | video-transcription-business-guide | 265 | intro + meta + curifyContent + conclusion |
| `b533c55` | lip-sync-business-guide | 211 | intro + curifyContent + conclusion |
| `db74b3e` | chinese-costume-history-infographic | 197 | intro + curifyContent + conclusion |
| `b5925db` | nano-banana-prompt-ecosystem | 47 | title + intro + meta + curifyContent + conclusion |
| `250e2b6` | image-to-narrative-video | 0 | intro only (body deferred until SC re-crawl) |

Tool slugs / template ids the rewrites now cite:
- `/tools/video-transcript-generator`, `/tools/video-dubbing`, `/tools/translate-subtitles`, `/tools/bilingual-subtitles`
- `template-costume`, `template-ethnic-costume-deconstruction-board`

### Two new authored posts — ds-ai-engineering category
Commit `225e2f7` adds two DS/AI engineering essays from PDFs the user dropped into the repo root. Both flow through the standard `[slug]` pipeline via `GenericBlogContent` (no dedicated route folder), and both auto-inherit the existing `BlogCTACard` mapping for `ds-ai-engineering` (MentorCruise coaching primary + `/contact` secondary). i18n auto-fanned out to 9 non-en locales.

| Slug | Frame | Curify anchors |
| --- | --- | --- |
| `ai-reshaping-data-workflow` | How AI reshapes each layer of the data workflow (acquisition / storage / analysis / application); Assistant-vs-Agent share by domain | `/nano-template`, `/nano-banana-pro-prompts`, `/tools/video-transcript-generator`, `/tools/video-dubbing`, `/tools/translate-subtitles` |
| `ml-engineer-vs-ai-engineer` | Two value structures (revenue engine vs capability engine); 4-section compare on business value, technical focus, org dependency, personal fit | `/nano-banana-pro-prompts`, `/tools/video-dubbing`, `/tools/voice-clone` |

Cross-linked into `aiPlatform.relatedLinks`; `aiPlatform.lastmod` bumped to 2026-05-18. Hero images (`/images/ai-dataworkflow.jpg`, `/images/mle-vs-ai.jpg`) synced to `gs://curify-static/images/` via `gsutil cp` (per the repo's `public/images/` gitignore convention — image bytes live on the CDN, not in git).

### Memory entry corrected
`feedback_blog_slug_pipeline.md` had said "at least one dedicated-folder page". Actual count is **31 dedicated `page.tsx` folders**, **13 of which also have `layout.tsx`**. Updated the memory entry with discovery commands so future sessions don't repeat the count error. The doc's separate "5 dedicated-folder pages that needed BlogCTACard wiring" subset is intentionally narrower — that working subset stays unchanged.

### Coverage stats (post-push)
| Metric | 2026-05-17 close | 2026-05-18 close |
| --- | --: | --: |
| Real posts with `metaDescription` | 48 / 54 | **50 / 56** (2 new posts shipped with meta) |
| Catalog entries with `lastmod` | 36 / 57 | **43 / 59** (5 P1 rewrites + 2 new posts + 1 aiPlatform cross-link bump) |
| Significant content rewrites done | 5 | **10** |
| P1 fluff list candidates remaining | 5 | **0** (top-5 all done; SC re-pull will surface next cohort) |

---

## Today's progress (2026-05-17, second push — CTA consolidation)

### CTA refactor — done

**The duplicate-CTA problem closed.** Stripped the in-body 🎯 ctaText/ctaLink callout from 11 content components in `app/[locale]/(public)/blog/[slug]/components/` (VoiceCloningContent, YoutubeTranslationContent, VideoTranscriptionContent, LipSyncContent, LipSyncTechnicalContent, TenPromptingTipsVideoGenerationContent, NanoTemplateContent, NanoBananaContent, TenPromptingTipsNanoBananaContent, SeriesInfographicVsNotebookLMContent, AslTranslationContent, GenericBlogContent). Now `BlogCTACard` is the single source of truth for the bottom-of-post CTA.

**Three dedicated-folder pages switched to BlogCTACard.** `weird-science-facts-classroom-engagement`, `mbti-relationship-style-visualizer`, and `ai-collage-digital-wallpaper-guide` each had their own bespoke "Browse X Templates" CTA — all linking to nano-template grids (weak per user). Replaced with `<BlogCTACard />` so they inherit the unified strong-target mapping.

**Expanded `BlogCTACard.tsx` mapping** (`app/[locale]/_components/BlogCTACard.tsx`):

| Category | Primary | Secondary |
| --- | --- | --- |
| `video-translation-dubbing` / `video-dubbing` | Try Video Dubbing → `/tools/video-dubbing` | Partner with us → `/contact` |
| `creator-tools` | Per-post tool (e.g. `/tools/video-transcription`) or `/tools` index | _none_ |
| `ds-ai-engineering` | Book AI / DS Coaching → MentorCruise | Partner with us → `/contact` |
| `content-automation` | Talk to us about a pilot → `/contact` | Book 15 min → Calendly direct link |
| `nano-template` _(new)_ | Partner on custom templates → `/contact` | Browse Creator Tools → `/tools` |
| `learning-education` _(new)_ | Partner on edtech → `/contact` | Browse Creator Tools → `/tools` |

Per-post creator-tools overrides live in a small `CREATOR_TOOL_OVERRIDES` table at the top of `BlogCTACard.tsx`. Adds for: `video-transcription-business-guide` → `/tools/video-transcription`, `10-prompting-tips-video-generation` → `/tools/video-dubbing`. Others to fill in as the tool catalog grows.

### Category reassignments (4 slugs)

| Slug | Was | Now |
| --- | --- | --- |
| `video-transcription-technical-deep-dive` | ds-ai-engineering | **video-translation-dubbing** |
| `lip-sync-technical-deep-dive` | ds-ai-engineering | **video-translation-dubbing** |
| `ai-content-production-system` | ds-ai-engineering | **content-automation** |
| `content-tagging-system` | content-automation | **ds-ai-engineering** |

The two technical deep-dives belong with the dubbing tool's primary CTA (creators who arrive on the deep-dive page are still in the dubbing funnel). The production-system post is a content-automation pitch. The tagging-system post is an engineering deep-dive that should send readers to MentorCruise rather than a content-automation pilot.

### Server-side exception fix

`ContentTaggingSystemContent.tsx` was throwing on render because 5 of its 7 iterable keys (`keyInsight.methods`, `pinterestPlatform.templateTags.geoTags.examples`, `…languageTags.examples`, `finalThought.systems`, `footer.tags`) are missing in `messages/en/blog.json` (the EN content never authored those sub-trees, and `Object.entries(undefined)` throws). Replaced every raw read with a `safeRaw` / `safeEntries` / `safeArray` helper that returns `[]` instead of crashing.

Authoring those missing sub-trees is a separate content task — flagged for the next P2 sweep.

### lastmod sweep
Bumped `lastmod` to 2026-05-17 for **all 57 categorised catalog entries**. Justified: every blog with a category had its visible bottom-of-post CTA layout change today (either lost the duplicate in-body box, or newly gained a `BlogCTACard` block in nano-template / learning-education, or had its category reassigned).

### Discovered while doing this
- **The dedicated-folder set is actually 5 posts, not 3:** `how-to-dub-videos-naturally`, `mbti-character-generator`, `mbti-relationship-style-visualizer`, **`weird-science-facts-classroom-engagement`**, **`ai-collage-digital-wallpaper-guide`**. Each has its own `app/[locale]/(public)/blog/<slug>/page.tsx`. The two new finds also bypass `BlogCTACard` until we wire it explicitly — done today for both.
- **`StandardBlogPost.tsx` is unimported dead code.** No slug routes to it; ignored for the CTA strip.
- **`messages/en/blog.json:contentTaggingSystem.threeLayerApproach.layer3`** has F5-TTS comparison fields leaked into it (e.g. `finalVerdict: "For video dubbing and translation in 2026, ElevenLabs wins…"`). i18n cross-contamination from some prior batch. The page doesn't render those, but the data is junk and should be cleaned during the dup-consolidation pass.

---

## Today's progress (2026-05-17, after the morning push)

### P0 strategy-doc leaks — done
| Slug | Fix |
| --- | --- |
| `mbti-relationship-style-visualizer` | Rewrote `intro`, sanitised `whyContent` and `conclusionContent` (the three fields with strategy-doc residue: position-rank claims, "high-value search markets", "expand this dominance"). |
| `weird-science-facts-classroom-engagement` | Rewrote `intro` (was: "Weird science facts has a great search volume of 590…"), sanitised `conclusionContent`. |
| `what-is-infographics` | Replaced placeholder `intro` `"Latest Article"` with a real lead. Added `metaDescription` + `seoKeywords` (was the only P0 missing both). |

### Coverage-gap sweep — done
- Added `metaDescription` + `seoKeywords` to **24 posts** (the whole gap list from the prior audit).
- Posts touched: `UltimateDirectoryOfNanoBananaPrompts`, `aeVsComfyUi`, `aiContentDistributionSystem`, `aiContentProductionSystem`, `bestAiTools`, `bilingual-ai-flashcards-early-childhood-education`, `chineseCostumeHistoryInfographic`, `chineseHerbalMedicineVisualGuide`, `contentMultiplicationSystem`, `contentTaggingSystem`, `creativeAiToolsWebsites`, `curifyAiGrowthEngine`, `emotionTtsMovie`, `evolutionTimelinesVisualization`, `f5TtsVsElevenlabs`, `imageToNarrativeVideo`, `nanoBananaDedicated`, `preserveFacialFeaturesAiGeneration`, `seriesInfographicVsNotebookLM`, `ugcVideoTranslationScalingTiktoksShortsGlobalMarkets`, `video_translation_eval`, `viralLearningContent`, `visualLearningTools`, `whatIsInfographics`.
- Bumped `lastmod` for **25 catalog slugs** in `public/data/blogs.json` (1 orphan: `video_translation_eval` has a namespace in `blog.json` but no catalog entry — see "Discoveries" below).
- Fanned out to 9 non-en locales via `scripts/i18n_autotranslate.cjs --base en --files blog --write` — 130-146 new keys per locale (`metaDescription` + `seoKeywords` array elements + the 3 rewritten P0 intros/body fields cleared first so autotranslate refilled them).

### New coverage stats (post-sweep)
| Metric | Before | After |
| --- | --- | --- |
| Real posts with `metaDescription` | 24 / 54 | **48 / 54** |
| Catalog entries with `lastmod` | ~11 / 57 | **36 / 57** |

The 6 entries still missing meta are 5 shared keys (`metadata`, `footer` … no, that's an empty string title — `finalThought`, `keyInsight`, `metadata`, `pinterestPlatform`, `ruleOfThumb`) and 1 orphan duplicate (`ugc-video-translation-scaling-tiktoks-shorts-global-markets` — kebab-case dup of the live camel namespace; gets resolved during dup consolidation, not the meta sweep).

### Discoveries
- **`mbti-relationship-style-visualizer` namespace is `mbiRelationshipStyleVisualizer`** — the typo (no "t" after "mb") is preserved intentionally because the dedicated `app/[locale]/(public)/blog/mbti-relationship-style-visualizer/page.tsx` hard-codes `useTranslations('blog.mbiRelationshipStyleVisualizer')`. Don't rename — you'll break the page.
- **`mbti-character-generator` also has its own dedicated route folder** alongside `how-to-dub-videos-naturally` and `mbti-relationship-style-visualizer`. So the dedicated-folder set is now 3, not 1. Always run `ls app/[locale]/(public)/blog/` before assuming the `[slug]` pipeline.
- **`video_translation_eval` is an orphan namespace** — exists in `messages/en/blog.json` but no matching slug in `public/data/blogs.json`. Either drop it from messages or add a catalog entry; flagged for the consolidation pass.

---

## Progress in the last 7 days (2026-05-10 → 2026-05-17)

### Bleeder stops — title + meta only (10 posts)
| Commit | Post | Lever |
| --- | --- | --- |
| `0803aab` | f5-tts-voice-cloning | "ElevenLabs head-to-head review" framing |
| `0803aab` | what-is-voice-cloning | Tighter meta only (title kept) |
| `0803aab` | voice-cloning-tools | Comparison framing |
| `0803aab` | 10-prompting-tips-video-generation | Sora / Runway / Pika specifics |
| `0803aab` | lip-sync-technical-deep-dive | Production credibility angle |
| `0803aab` | translate-youtube-video | Three-method scope |
| `0803aab` | ai-youtube-video-translator | Hub framing for video dubbing |
| `bb5a8b2` + `4de9e76` | image-generation-model-comparison | Title + meta + lastmod bump |
| `4d24885` | how-to-dub-videos-naturally | Title + bespoke-layout meta override |

Combined SC impressions at the time of `0803aab`: ~10,192 impressions / 10 clicks across the 7 — i.e. <0.1% CTR. Watch for CTR lift over the next 2-4 weeks before declaring it a win.

### Significant content rewrites (5 posts)
| Commit | Post | What changed |
| --- | --- | --- |
| `91c9e91` | character-prompt-generator | Rewrote anchored in 12+ universe MBTI templates |
| `33d7c8f` | mbti-character-generator | Rewrote anchored in 17 MBTI templates |
| `4b46c34` | ultimate-directory-of-nano-banana-prompts | Full rewrite — directory linked to live prompts |
| `a05a488` | 10-prompting-tips-nano-banana | Fixed stale template IDs, wired real template cards |
| `42fd681` | ai-collage-digital-wallpaper-guide | Dropped GSC stats, wired real template cards |

### Plumbing / infra
- `ac14131` — **Unified blog CTA card** (`BlogCTACard.tsx`) by category, with `useClickTracking` firing `blog-cta:<category>:<cta-id>` so the admin funnel can answer "which categories actually convert to tool / coaching / contact." See [CTA review](#cta-section-review) below.
- `4de9e76` — Per-blog `lastmod` in `public/data/blogs.json` and the sitemap reads it. Previously the sitemap emitted `new Date()` for every blog on every fetch, neutering the lastmod signal entirely.
- `aeec187` — Shared blog top bar (search + breadcrumb + locale switcher).
- `3a8c075` + `d28cca6` — Split `10-prompting-tips-nano-banana` into two posts; i18n fan-out to 9 non-en locales.
- `198132a` — `QA_Bot_to_Task` namespace path fix.
- `414e104` — `character-prompt-generator` hero image trimmed to `max-w-xs`.

---

## Evaluation of remaining blogs

`messages/en/blog.json` contains **60 entries** under `blog.*`. Of those, **6 are shared keys** (`metadata`, `footer`, `finalThought`, `keyInsight`, `ruleOfThumb`, `pinterestPlatform`) — so the real post count is **~54**. Coverage gap: **24 real posts still have no `metaDescription`**.

### P0 — strategy-doc leaks visible to readers
**Status: all three closed on 2026-05-17.** Intros rewritten, body strategy-leak fields sanitised, i18n fan-out done. See [Today's progress](#todays-progress-2026-05-17-after-the-morning-push) above for details.

~~1. `mbiRelationshipStyleVisualizer`~~ — fixed.
~~2. `weirdScienceFactsClassroomEngagement`~~ — fixed.
~~3. `whatIsInfographics`~~ — fixed (intro replaced + meta added).

### P1 — obvious AI-marketing fluff (next sweep)
Same telltales we already rewrote on the P0 posts: openings like "Discover how…", "Learn how to…", "Comprehensive guide to…", or "is revolutionizing / reshaping / transforming…", plus benefit-bullet boilerplate that doesn't reference actual templates or tool URLs.

| Post | Telltale (first ~40 words of intro) |
| --- | --- |
| ~~`whatIsInfographics`~~ | ~~Intro literally reads `"Latest Article"` — **broken / placeholder**, treat as P0~~ — **fixed 2026-05-17** (see line above; intro now anchored in cross-medium use cases) |
| ~~`aslVideoTranslator`~~ | ~~"Learn how to translate ASL video using advanced AI tools and computer vision…"~~ — **rewritten 2026-05-23** (commit `9fbf3b2`); anchored in NMS-as-syntax, continuous-signing recognition, topic-comment grammar, honest tool comparison |
| ~~`bilingual-ai-flashcards-early-childhood-education`~~ | ~~"Learn how to generate highly visual bilingual AI flashcards…"~~ — **full body rewrite 2026-05-23** (Path-B batch); anchored in toddler vocab retention, 5-step workflow, 3 ready-to-use template prompts |
| ~~`chineseCostumeHistoryInfographic`~~ | ~~"Comprehensive guide to Chinese costume history—dynastic fashion evolution, textile analysis techniques, cultural symbolism frameworks…"~~ — **intro + Curify + conclusion rewritten** (commit `db74b3e`); body deferred |
| ~~`evolutionTimelinesVisualization`~~ | ~~"Comprehensive guide to evolution timeline visualization—AI-powered historical progression, reproducible benchmarking methods…"~~ — **full body rewrite 2026-05-23** (Path-B batch); anchored in linear vs branching vs comparative timeline variants |
| ~~`videoTranscriptionBusinessGuide`~~ | ~~"Learn how to transcribe video to text using AI tools…"~~ — **intro + meta + Curify rewritten** (commit `9c8fe83`); body deferred |
| ~~`videoTranscriptionTechnicalDeepDive`~~ | ~~"Go beyond basic transcription tools and discover the technical architecture…"~~ — **intro rewritten** (commit `7ef4e04`); body deferred |
| ~~`translateYoutubeVideoToEnglish`~~ | ~~"Go beyond basic translation tools and discover the technical architecture…"~~ — **intro rewritten** (commit `7ef4e04`); body deferred |
| ~~`aifacelesschannelpipeline`~~ | ~~"AI-powered faceless channels are reshaping how content is created and scaled…"~~ — **full body rewrite 2026-05-23** (Path-B batch); anchored in 5-component pipeline, 3 channel archetypes, monetization realities |
| ~~`lipSyncBusinessGuide`~~ | ~~"Discover how AI lip sync and dubbing technology is transforming video content creation…"~~ — **intro + Curify + conclusion rewritten** (commit `b533c55`); body deferred |
| ~~`ugcVideoTranslationScalingTiktoksShortsGlobalMarkets`~~ | ~~"Learn how to scale your UGC videos for global markets using AI translation…"~~ — **full body rewrite 2026-05-23** (Path-B batch); anchored in pacing markers, syllable-budgeted MT, per-platform reality, 2 worked cases. Also stripped strategy-doc-leak fields `architecture` / `content_architecture_plan` / `hub`. |
| ~~`imageToNarrativeVideo`~~ | ~~"Transform static images into compelling narrative videos with AI-powered storytelling. Our innovative mini-tool…"~~ — **intro rewritten** (commit `250e2b6`); body explicitly deferred per commit message |
| ~~`nanoBananaPromptEcosystem`~~ | ~~"Nano banana prompts that work. Get nano banana prompt examples for AI images, infographics, e-commerce…" (SEO keyword stuffing)~~ — **rewritten** (commit `b5925db`); keyword-stuffed copy killed |

### P2 — audit needed
No fluffy intro to flag, but body untouched in the last sweep and unlikely to be anchored. Skim before deciding rewrite vs leave:

`aiContentDistributionSystem`, `aiContentProductionSystem`, `creativeAiToolsWebsites`, `curifyNanoBananaTemplateTips` (newly split, worth a re-skim), `chineseHerbalMedicineVisualGuide`, `contentMultiplicationSystem`, `contentTaggingSystem` (intro is actually good — "When you have thousands of images…"), `preserveFacialFeaturesAiGeneration`, `nanoBananaDedicated`, `bestAiTools`, `visualLearningTools`, `viralLearningContent`, `aiVideoDubbingTutorial`, `emotionTtsMovie`, `curifyAiGrowthEngine`, `aeVsComfyUi`, `redCarpetAiLooks`, `seriesInfographicVsNotebookLM`, `nanoBananaDedicated`, `video_translation_eval`.

### Duplicates / orphans to consolidate
**Status: all 4 pairs + orphan + contamination closed 2026-05-18 (second push).** See [Today's progress (2026-05-18, second push)](#todays-progress-2026-05-18-second-push--duplicate-consolidation) for the commit-by-commit table.

| Pair | Resolution |
| --- | --- |
| ~~`ugc-video-translation-scaling-tiktoks-shorts-global-markets` vs `ugcVideoTranslationScalingTiktoksShortsGlobalMarkets`~~ | Camel namespace deleted (`e57377f`). |
| ~~`aiCollageDigitalWallpaperGuide` vs `gridCollageAiPrompts`~~ | `gridCollageAiPrompts` + folder deleted, 301 redirect added (`a7011b7`). |
| ~~`f5TtsVoiceCloning` vs `f5TtsVsElevenlabs`~~ | `f5TtsVsElevenlabs` + folder deleted, 301 redirect added (`f11608f`). |
| ~~`videoTranscriptionTechnicalDeepDive` vs `translateYoutubeVideoToEnglish`~~ | Both kept alive; intros differentiated by funnel (`7ef4e04`). |

### Coverage stats
- **48 / 54 real posts** now have `metaDescription` (was 24 / 54 before 2026-05-17). Remaining 6 are 5 shared keys + 1 orphan kebab dup — no real post is uncovered.
- **36 / 57 catalog entries** now have `lastmod` (was ~11 / 57). The other 21 are untouched-since-publish — top sitemap re-crawl candidates if those posts later need a CTR refresh.

---

## CTA section review

### Current mapping (`app/[locale]/_components/BlogCTACard.tsx`)
**Refactored 2026-05-17.** Single source of truth for the bottom-of-post CTA — no in-body duplicates, no nano-template grid links.

| Category | Primary | Secondary |
| --- | --- | --- |
| `video-translation-dubbing` / `video-dubbing` | Try Video Dubbing → `/tools/video-dubbing` | Partner with us → `/contact` |
| `creator-tools` | Per-post tool override (e.g. `/tools/video-transcription`) or `/tools` index | _none_ |
| `ds-ai-engineering` | Book AI / DS Coaching → MentorCruise (external) | Partner with us → `/contact` |
| `content-automation` | Talk to us about a pilot → `/contact` | Book 15 min → Calendly (external) |
| `nano-template` | Partner on custom templates → `/contact` | Browse Creator Tools → `/tools` |
| `learning-education` | Partner on edtech → `/contact` | Browse Creator Tools → `/tools` |

Click tracking: `content_id = blog-cta:<category>:<cta-id>`, `content_type = menu_link`. Greppable in the admin Actions panel.

Per-post creator-tools overrides table (`CREATOR_TOOL_OVERRIDES` in `BlogCTACard.tsx`): add an entry whenever a creator-tools post maps to a specific tool. Currently wired for `video-transcription-business-guide`, `10-prompting-tips-video-generation`. Worth filling in as the tool catalog grows.

### Gaps / concerns — _resolved 2026-05-17 unless noted_
1. ~~`nano-template` has no CTA card.~~ Now maps to `/contact` (primary) + `/tools` (secondary).
2. ~~`learning-education` has no CTA card.~~ Now maps to `/contact` (primary) + `/tools` (secondary).
3. ~~`creator-tools` CTA is generic.~~ Per-post override table added; expand as new posts ship.
4. ~~`ds-ai-engineering` → MentorCruise only.~~ Added `/contact` secondary.
5. ~~`content-automation` → mailto + /contact.~~ Replaced mailto with Calendly direct link (still secondary to `/contact`).
6. **Single bottom-of-post placement.** Still true. Long posts (`preserveFacialFeaturesAiGeneration` at 190 keys, `f5TtsVsElevenlabs` at 144) probably lose readers before the CTA. Cheap upgrade: an inline mid-post strip anchored after the first major section. Open.
7. **Generic header copy** — `Take the next step` / `Putting what you read into practice`. Category-specific copy would resonate better. Open.

---

## Next-up shortlist

Reprioritized 2026-05-17 after the CTA consolidation push. Top of list is now the layout streamline — it touches every reader on every blog and undergirds everything else (rewrites, CTA visual polish, mid-post inline CTA).

### 1. Layout & visual polish — _new top priority_
Uniform basic layout across every blog (both `[slug]` pipeline and dedicated-folder pages) and the blog feed page. Scope:

- **No giant hero images** at the top of posts. Drop the floated `max-w-sm` hero from `app/[locale]/(public)/blog/[slug]/page.tsx` (and the equivalent in each dedicated-folder page). Either remove entirely, shrink to an inline thumbnail next to the title, or hoist to a true edge-to-edge banner if the image is worth that real estate — pick one pattern and apply everywhere.
- **Relaxed reading width** on every blog body and the feed. Today the `<article>` runs to whatever the parent provides; cap it for readable line length (~ 65-75 ch) on the body, keep the hero/feed cards on a wider container. Affected:
  - `[slug]/page.tsx` body article wrapper
  - The 5 dedicated-folder pages (`how-to-dub-videos-naturally`, `mbti-character-generator`, `mbti-relationship-style-visualizer`, `weird-science-facts-classroom-engagement`, `ai-collage-digital-wallpaper-guide`)
  - Blog feed page (`app/[locale]/(public)/blog/page.tsx` if it exists, or the listing wrapped elsewhere)
- **Consistent alignment.** Pick one and apply: most blog body text left-aligned, headings left-aligned, CTA / hero strips centered, captions left under image. Today there's a mix of `text-center` and default-left blocks across components.
- **CTA card theme — light purple + light blue.** `BlogCTACard.tsx` currently uses `border-blue-200` / `from-blue-50 to-white`. Rework to a two-tone light-purple + light-blue scheme (e.g. left card light-blue, right card light-purple; or unified gradient `from-purple-50 to-blue-50`). Keep the existing icon + tracking wiring.

Owner judgement call on each — these are design choices, not mechanical fixes. **Folds in the previously-separate "CTA polish (inline mid-post, category-specific headers)" item**, since both need to land in the same design pass.

### 2. Duplicate consolidation
**All 4 pairs + orphan + contamination shipped 2026-05-18 (second push).** See [Today's progress](#todays-progress-2026-05-18-second-push--duplicate-consolidation) for the commit-by-commit table. Net cleanup: ~6,200 lines across `blog.json`, 2 dedicated-folder routes removed, 4 new 301 redirects in `next.config.ts`.

### 3. Author the missing `contentTaggingSystem` sub-trees
`keyInsight.methods`, `pinterestPlatform.templateTags.geoTags.examples`, `…languageTags.examples`, `finalThought.systems`, `footer.tags`. The page no longer crashes, but those sections render empty until authored.

### 4. P1 fluff rewrite — top 5 by Search Console impressions
**All five shipped 2026-05-18.** See [Today's progress](#todays-progress-2026-05-18--p1-rewrites--2-new-dsai-posts) for commits + per-post fields touched. Next P1 cohort is gated on the post-2026-06-01 SC re-pull — most current P2 candidates are likely the right next batch once we see which positions moved.

### 5. P0 / P1 CTR follow-up
After 2026-06-01, re-pull Search Console for **15 rewritten posts**:
- 10 bleeders rewritten in `0803aab` + `bb5a8b2` + `4d24885`
- 3 P0 rewrites from 2026-05-17 (`mbiRelationshipStyleVisualizer`, `weirdScienceFactsClassroomEngagement`, `whatIsInfographics`)
- ~~3 P1 rewrites from~~ **5 P1 rewrites from 2026-05-18** (`9c8fe83`, `b533c55`, `db74b3e`, `b5925db`, `250e2b6`)

Lift > 2× CTR ⇒ the playbook is working; lift flat ⇒ try a stronger framing or a different position-rank cohort.

### 6. P2 audit pass
Skim the ~20 P2 bodies. If anchored in real templates and tools, leave alone; otherwise add to a future P1 list. The SC re-pull at #5 will reveal which P2 posts now matter most.

---

_Track sources used for this audit: `git log --since=2026-05-10`, `public/data/blogs.json`, `messages/en/blog.json`, `app/[locale]/_components/BlogCTACard.tsx`, commits `0803aab`, `ac14131`, `9c8fe83`, `b533c55`, `db74b3e`, `b5925db`, `250e2b6`, `225e2f7`, `e57377f`, `a7011b7`, `f11608f`, `7ef4e04`, `4355568`._

---

## SERP-emulation learnings for nano-banana / prompt-focused posts (added 2026-05-27)

Audit of the top SERP result for `brazil prompt` (`https://sajjadit.com/ai-soccer-poster-prompt-argentina-brazil/`, 2,000-2,500 words) surfaced five structural patterns missing from our nano-banana corpus. The Curify version shipped at `/blog/brazil-argentina-soccer-poster-prompts` adopts all five; the existing nano-banana posts (`nano-banana-prompt-ecosystem`, `10-prompting-tips-nano-banana`, `curify-nano-banana-template-tips`, `ultimate-directory-of-nano-banana-prompts`, `nano-banana-dedicated`) should be backfilled with these where applicable.

1. **Copyable prompt blocks (explicit copy UI).** Triple-backtick code blocks already render as `<pre><code>` via `formatContent`, which the user can select/copy. Prompt-focused posts should put every recommended prompt inside a code block. Today many of our prompts are buried in prose.

2. **Per-country/team/topic permutation as long-tail strategy.** sajjadit.com's sidebar lists Morocco, Portugal, Germany, France posts — each post hits a different long-tail query with the same structural skeleton. We should ship variants for high-search-volume entities (each World Cup nation, each MBTI universe, each tier-1 topic) where the structural cost of authoring drops to near-zero after the first one.

3. **AI tools mini-comparison table.** Standard inclusion in prompt-focused SERP winners — readers want to know which model fits before they commit to one. The four-column shape (Tool / Best for / Strength / Weakness) takes ~15 minutes to write and dramatically improves dwell time. Already in the new soccer-poster post and `image-generation-model-comparison`; backfill into the nano-banana directory + ecosystem posts.

4. **Settings & keyword vocabulary section.** Lens choice (`85mm portrait`, `wide-angle action`), lighting cue (`golden hour`, `floodlight glare`, `rim lighting`), color grading vocabulary (`teal-orange grade`, `commercial color grade`), negative prompts (`no warped jersey numbers`). This section feeds search-by-aesthetic queries that prompt-content readers actually type. Most existing nano-banana posts skip this entirely.

5. **"Other variants — same prompt, swap the entity" closer.** The conclusion of every prompt-focused post should be a list of 8-10 entity permutations with the prompt-shape held constant. Tells the reader: this post is one of many; here are the natural next searches. Sajjadit ends with "Morocco, France, Germany, Portugal" pointers. Our soccer post ends with 9 national-team variants. Should backfill into the nano-banana posts (e.g., the directory post's conclusion could end with "Other prompt families — same pattern: character, design, lifestyle, learning").

**Methodology captured for future GSC-driven posts:** `feedback_gsc_serp_emulation.md` in memory. The cadence is: pull weekly `Queries.csv` → find emergent queries with non-zero CTR at position 8-25 → WebFetch top-1 SERP result → audit structure → ship Curify version anchored in real templates.

---

## Significant rewrite tracker (fluff reduction)

_Living log of posts that underwent significant content rewriting to improve quality and reduce AI marketing flavour. Distinguished from the bleeder track (title + meta only) — these are body-level rewrites that materially change the reader experience. Add a row every time a post crosses the "substantial content swap" bar so we can measure cumulative quality lift across the catalog._

**Telltales that triggered a rewrite:** unverifiable claims ("10k+ creators", "47% higher engagement", "X faster"), opening clichés ("revolutionizing", "the pinnacle of"), benefit-bullet boilerplate with no real anchors, marketing slogans masquerading as conclusions ("Distribution is the new differentiation"), or sections that read identical across multiple posts (mass-generated from one template).

| Date | Slug | Scope | What changed |
| --- | --- | --- | --- |
| 2026-05-25 | `programmatic-seo-dtc-visual-first` | intro + market gap + curify section | Killed "AI marketing fluff" intro, labeled the two walls explicitly, acknowledged the market gap before pitching Curify. |
| 2026-05-25 | `multimodal-ai-educational-publishing` | full rewrite | Condensed from a 5,000-CN-char whitepaper to a ~12-min English deep-dive anchored in real Curify capabilities (deterministic templates, F5-TTS cross-lingual, MuseTalk). |
| 2026-05-25 | `ai-content-factory-for-agencies` | full rewrite | Original brief shipped; agency-buyer narrative anchored in batch-generation + autopost as proof. |
| 2026-05-27 | `nano-banana-prompt-ecosystem` | full library-tour rewrite | Replaced 11 sections of SEO keyword-stuffing with 4 visual library-by-tag sections (mood / subject / style / lighting+seasonal) anchored in real gallery thumbnails + tag pages. Deleted fluff sections (ecosystem, seo, generator, useCases, integration, community, conclusion). |
| 2026-05-27 | `nano-banana-prompt-ecosystem` (de-numbered) | counts + internal-path leaks | Replaced exact counts (4,117, 145 tags, per-tag chip counts) with vague phrasing ("4,000+", "many attributes") since gallery sync changes numbers daily. Removed `lib/taxonomy.json` internal-file references from prose. |
| 2026-05-27 | `translate-youtube-video-to-english` | full rewrite | Engineering deep-dive → solutions how-to with 3 methods (auto-subtitles / full dub / bilingual subtitles), differentiated from sibling `ai-youtube-video-translator`. |
| 2026-05-27 | `image-generation-model-comparison` | retitle + rewrite | "DALL-E 3 vs Midjourney vs Stable Diffusion" → "Midjourney vs Nano Banana vs Stable Diffusion". Refreshed 2026 model lineup (GPT Image 2 transition, Nano Banana Pro, MMDiT-X), added 4-tool comparison table, added newer-contenders closer. |
| 2026-05-28 | `ai-content-distribution-system` | full rewrite + Mermaid fix | Condensed 7+ steps to 4 named stages (Format Adaptation / Niche-First Distribution / Performance Instrumentation / Feedback into Next Batch). Replaced marketing slogans ("good distribution can save average content") with concrete numbers (5-10× niche engagement, 30-50% bilingual lift, 5 pieces/week manual cap). Removed visible "🔍 SEO Keywords" footer. Fixed Mermaid component for v11 API. |
| 2026-05-28 | `10-prompting-tips-nano-banana` | tip 10 + curify + conclusion rewrite + tips 1-10 anchored in real gallery prompts + rendering pipeline fix | Pivoted from "templates" anchor to "gallery prompts" anchor. Tip 10 = "Start From a Gallery Prompt, Not a Blank Page" with worked example (real gallery prompt id=4190). curifyContent rewritten as "Where to find prompts that already work" with subject-led + aesthetic-led browsing patterns. Differentiated from the Library directory post. **Second pass**: tipExamples 1-7 each get a real gallery prompt (id + image + tag chips) replacing the synthetic example text, plus a "why this lands" callout pointing at the specific principle being demonstrated. **Third pass**: tips 8 (negative prompts) and 9 (multi-turn iteration) get gallery anchors too — tip 8 uses /4314 (winter samurai portrait) framed for targeted negative prompts; tip 9 uses /4170 (golden hour airport traveler) as the Turn 1 base with 3 explicit follow-up iteration patterns. Tip 10 gets its image embed added. Dropped the "Popular Template Examples" section (NanoBananaExamples component). **Rendering pipeline fix**: tipNExample rendering switched from PromptBox + `<pre>` (which displayed the gallery markdown as raw text — what the user called "i18n key issues") to formatNanoBananaContent so images, blockquotes, and markdown links all render properly. |

| 2026-05-28 | `red-carpet-ai-looks` | intro + structural cleanup | Removed the gradient "Generate Fashion Looks with Nano Banana" CTA section (linked at /tools, not the right destination for prompt-readers). Removed the "Annual Refresh Note" block (fake-periodicity claim that the guide updates "every May and February"). Tightened intro — dropped "pinnacle of style innovation" framing for concrete observation about the corpus of red carpet looks and the four things that distinguish a fashion shot. Article width relaxed max-w-4xl → max-w-5xl. Fixed hardcoded `locale="en"` on RelatedBlogs. Style archetypes, prompt anatomy, and pitfalls table preserved — they're the concrete content. |
| 2026-05-29 | `red-carpet-ai-looks` (follow-up) | gallery template anchors | Added a "From the gallery" 3-up grid between corePromptRecipe and styleArchetypes — Met Gala / Paris Fashion Week / Couture gown design sheet template links with CdnImage cards. No body-copy edits; visual bridge from recipe to working template. |
| 2026-05-29 | `preserve-facial-features-ai-generation` | structural dedup + new mechanics section + concrete examples + real gallery visuals | **Top untouched bleeder** on 5/25 GSC (3c / 451imp / 0.67% CTR). Hero image migrated to [slug] adaptive convention. Removed dead-button gradient "Use Template" CTA + dead-link "Next Steps Character Journey" 2-card section (both were broken on prod) — BlogCTACard is now the only next-step surface. Visual examples (3 fabricated thumbnails) swapped for 3 live lifestyle-photo-grid template anchors (Met Gala / Paris Fashion Week / Wedding) — that template literally renders the SAME face across 9 scenes, which IS the post's thesis. `styleTransferFormula` code block replaced `[CHARACTER_FACE_BLUEPRINT] rendered in [art_style]` placeholders with a real worked prompt. **New section: "The Mechanics Behind the Lock"** — 3 levers most prompt guides skip: (1) Pin the seed in Gemini API (worked code block), (2) token weighting syntax `(deep-set hazel eyes:1.3)` for drift-prone features, (3) surgical negatives that name actual failure modes. en messages: `nanoBananaMethodExample` placeholder → real prompt, `biggestChallengeOutro` dropped "masterclass techniques", `nanoBananaSolutionDesc` dropped "DNA for your character" metaphor. 17 new keys + 4 rewrite keys fanned to 9 non-en locales. |
| 2026-05-29 | `voice-cloning-tools` | full body rewrite + dedicated component + honest Curify framing | **Biggest impression bleeder in the catalog** on 5/25 GSC (752 impr / 0 clicks; title+meta tweak in 5/13 cohort regressed CTR from 0.25% → 0%). Diagnosis: title sold a tool comparison; body delivered an F5-TTS dubbing-ops deep dive (WER, GPU pools, FCC TCPA, C2PA manifests). Reader landing on "best voice cloning tools" wanted to pick a tool, got an enterprise SRE playbook. **New dedicated component** `VoiceCloningToolsContent.tsx`; slug branch added to [slug]/page.tsx BEFORE the shared `voice-cloning*` branch so the sibling posts (`what-is-voice-cloning`, `f5-tts-voice-cloning`) keep the shared renderer untouched. New schema: intro that rejects the 10-tool listicle pattern; "Who this is for" audience filter; 3 color-banded per-tool detail boxes (ElevenLabs / F5-TTS / OpenVoice) each with tagline + 4-field micro-list (Best for / Pricing / Languages / Limitation) + "when to pick" paragraph; side-by-side comparison table; decision rubric "pick by use case"; gradient-banded **Curify callout** positioned honestly as "what if you don't need a voice cloning *tool*?" — Curify is a dubbing tool, voice cloning is internal, not a category competitor to ElevenLabs (user explicitly flagged the depth gap); compliance section retained from prior body (TCPA / consent / disclosure — genuinely useful, rare in SERP competitors). 32 new keys + 19 obsolete keys dropped. Non-en locales: voiceCloningTools wiped entirely + rebuilt by autotranslate from en (old schema structurally obsolete; partial overlap would have shipped a Frankenstein per-locale). All 10 locales: 43 keys populated, 0 ICU parse failures. WebFetch on the SERP target (autoppt.com) returns 403; per-tool detail copy + intro hook will refine after user sends screenshots. |
| 2026-05-29 | `voice-cloning-tools` (2nd pass) | apply SERP-winner structure from autoppt | Got past the WebFetch 403 with browser-headers `curl` and pulled autoppt's full structure (16 tools, buyer's guide / methodology / FAQ / 3 mini-tutorials). Borrowed three structural strengths without breaking the focused 3-tool decision shipped in v1. **New sections:** (1) Intro rewrite — problem-first hook ("Cloning a voice used to take a Hollywood studio and $1000s; today 30 seconds and a $5 plan — creative gift and scam vector") replacing v1's listicle-rejection opener. (2) **Quick buyer's guide** between Who-this-is-for and Tools — 4 numbered rules covering Consent & legality / Pricing model / Voice fidelity vs sample length / Privacy. Lets readers evaluate the tool picks instead of taking them on faith. (3) **Methodology note** — italic border-left blockquote explicitly listing the 12 tools we dropped (Murf, Play.ht, Speechify, Lovo, Listnr, TTSMaker, Fish, Hume, Respeecher...) and which bucket each collapses into. Pre-empts the "you missed Tool X" objection. (4) **FAQ** — 6 Q&A pairs (legality / sample length / celebrity voices / cloning vs TTS / speech-to-speech / **"I just want to dub a YouTube video in my voice"** → funnels to /tools/video-dubbing). 17 new keys, autotranslate fanned to 9 non-en locales, 0 ICU failures. |
| 2026-05-29 | `voice-cloning-tools` (3rd pass) | per-tool hero images, CDN-hosted | Tool cards now lead with a hero image of each tool's "front door": ElevenLabs marketing cover, F5-TTS GitHub social card (showing the 15k-star credibility signal), OpenVoice GitHub social card (37k stars + MIT credit). **Non-obvious decision worth recording**: GitHub social cards were the right call for F5-TTS / OpenVoice — they're dev-facing OSS projects without polished consumer homepages, so the social card IS their canonical front door. The star counts act as a built-in trust marker that autoppt's flat screenshots of proprietary tools can't match. Asset prep: `curl` with browser headers fetched each og:image; `magick` re-encoded to webp q82 at native 1200×600 (~78 KB total across 3 vs ~275 KB hot-linked); `gsutil` push to `gs://curify-static/images/voice-cloning-tools-<name>.webp`. Component flipped from external URLs to `/images/...` via CdnImage (toCdnUrl resolves). Click-through on the image opens each tool homepage in a new tab. Eliminates upstream dependency (no breakage if ElevenLabs redesigns or GitHub changes OG endpoint hashes). |

**Cumulative status as of 2026-05-29:** 13 significant content rewrites since 2026-05-25 (5 days; voice-cloning-tools counts once despite three passes). Roughly 2-3 per day. At this pace the P2 backlog (~20 posts) would clear in ~2 weeks of focused work.

---
