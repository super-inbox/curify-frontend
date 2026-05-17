# Blog Quality Improvement — Status & Audit

_Last updated: 2026-05-17 (after P0 + coverage-gap sweep). Owner: jay. Update after every push that touches blog content or `BlogCTACard.tsx`._

## Framing

Two parallel tracks:

1. **Stop the bleeders** — surgical title + `metaDescription` rewrites driven by Search Console for high-impression / low-CTR URLs at positions ~6-12. No body changes; one sweep per 5-10 posts; bump `lastmod` so the sitemap signals a re-crawl.
2. **Significant content rewrites** — replace AI-marketing fluff with original prose anchored in actual Curify capabilities (real templates, real tool URLs, real example pages). One post per commit; expect to touch hero, sections, and remove ungrounded "benefit list" boilerplate.

Both tracks share the same i18n fan-out: edit `messages/en/blog.json`, delete the stale `title` field in each non-en locale, run `scripts/i18n_autotranslate.cjs --base en --files blog --write`, bump `lastmod` in `public/data/blogs.json`.

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
| `whatIsInfographics` | Intro literally reads `"Latest Article"` — **broken / placeholder**, treat as P0 |
| `aslVideoTranslator` | "Learn how to translate ASL video using advanced AI tools and computer vision…" |
| `bilingual-ai-flashcards-early-childhood-education` | "Learn how to generate highly visual bilingual AI flashcards…" |
| `chineseCostumeHistoryInfographic` | "Comprehensive guide to Chinese costume history—dynastic fashion evolution, textile analysis techniques, cultural symbolism frameworks…" |
| `evolutionTimelinesVisualization` | "Comprehensive guide to evolution timeline visualization—AI-powered historical progression, reproducible benchmarking methods…" |
| `videoTranscriptionBusinessGuide` | "Learn how to transcribe video to text using AI tools…" |
| `videoTranscriptionTechnicalDeepDive` | "Go beyond basic transcription tools and discover the technical architecture…" |
| `translateYoutubeVideoToEnglish` | "Go beyond basic translation tools and discover the technical architecture…" (same boilerplate template as the row above) |
| `aifacelesschannelpipeline` | "AI-powered faceless channels are reshaping how content is created and scaled…" |
| `lipSyncBusinessGuide` | "Discover how AI lip sync and dubbing technology is transforming video content creation…" |
| `ugcVideoTranslationScalingTiktoksShortsGlobalMarkets` | "Learn how to scale your UGC videos for global markets using AI translation…" |
| `imageToNarrativeVideo` | "Transform static images into compelling narrative videos with AI-powered storytelling. Our innovative mini-tool…" |
| `nanoBananaPromptEcosystem` | "Nano banana prompts that work. Get nano banana prompt examples for AI images, infographics, e-commerce…" (SEO keyword stuffing) |

### P2 — audit needed
No fluffy intro to flag, but body untouched in the last sweep and unlikely to be anchored. Skim before deciding rewrite vs leave:

`aiContentDistributionSystem`, `aiContentProductionSystem`, `creativeAiToolsWebsites`, `curifyNanoBananaTemplateTips` (newly split, worth a re-skim), `chineseHerbalMedicineVisualGuide`, `contentMultiplicationSystem`, `contentTaggingSystem` (intro is actually good — "When you have thousands of images…"), `preserveFacialFeaturesAiGeneration`, `nanoBananaDedicated`, `bestAiTools`, `visualLearningTools`, `viralLearningContent`, `aiVideoDubbingTutorial`, `emotionTtsMovie`, `curifyAiGrowthEngine`, `aeVsComfyUi`, `redCarpetAiLooks`, `seriesInfographicVsNotebookLM`, `nanoBananaDedicated`, `video_translation_eval`.

### Duplicates / orphans to consolidate
Each pair likely shares ~70%+ content — drop one and 301-redirect:

| Pair | Issue |
| --- | --- |
| `ugc-video-translation-scaling-tiktoks-shorts-global-markets` vs `ugcVideoTranslationScalingTiktoksShortsGlobalMarkets` | Kebab vs camel key — **same post twice** in `blog.json` |
| `aiCollageDigitalWallpaperGuide` vs `gridCollageAiPrompts` | Both 3x3 grid collage posts — one is canonical, one is fluff |
| `f5TtsVoiceCloning` (rewritten) vs `f5TtsVsElevenlabs` (144 keys, no intro) | Same comparison — consolidate |
| `videoTranscriptionTechnicalDeepDive` vs `translateYoutubeVideoToEnglish` | Same boilerplate intro ("Go beyond basic … and discover the technical architecture…") — probably mass-generated from one template |

### Coverage stats
- **48 / 54 real posts** now have `metaDescription` (was 24 / 54 before 2026-05-17). Remaining 6 are 5 shared keys + 1 orphan kebab dup — no real post is uncovered.
- **36 / 57 catalog entries** now have `lastmod` (was ~11 / 57). The other 21 are untouched-since-publish — top sitemap re-crawl candidates if those posts later need a CTR refresh.

---

## CTA section review

### Current mapping (`app/[locale]/_components/BlogCTACard.tsx`)
| Category | CTA(s) | Target |
| --- | --- | --- |
| `video-translation-dubbing` / `video-dubbing` | Try Video Dubbing | `/tools/video-dubbing` |
| `creator-tools` | Browse Creator Tools | `/tools` |
| `ds-ai-engineering` | Book AI / DS Coaching | `mentorcruise.com/mentor/jaywang/` (external) |
| `content-automation` | Email + Visit Contact Page | `mailto:team@curify-ai.com` + `/contact` |
| `nano-template` | _(none)_ | — |
| `learning-education` | _(none)_ | — |

Click tracking: `content_id = blog-cta:<category>:<cta-id>`, `content_type = menu_link`. Greppable in the admin Actions panel.

### Gaps / concerns
1. **`nano-template` (8+ posts) has no CTA card.** Original rationale: "the post already embeds a template grid; no second ask." Fair, but the template grid drives _remix_, not signup or use-case discovery. Add a soft CTA → `/use-cases` ("Find Your Use Case") so visitors can self-route to the persona page that fits.
2. **`learning-education` (5 posts) has no CTA card.** Map to **`/use-cases/for-parents`** by default, or pick **`/use-cases/for-esl-learners`** for ESL-focused posts. Affected: `visualLearningTools`, `viralLearningContent`, `whatIsInfographics`, `weirdScienceFactsClassroomEngagement`, `bilingual-ai-flashcards-early-childhood-education`, plus `seriesInfographicVsNotebookLM`.
3. **`creator-tools` CTA is generic** — every creator post sends to `/tools` index. Per-post targeting would lift CTR: `tenPromptingTipsVideoGeneration` → `/tools/video-dubbing`; `imageToNarrativeVideo` → its actual tool page if it exists; otherwise persona via `/use-cases/for-creators`.
4. **`ds-ai-engineering` → MentorCruise only.** Strong personal-brand CTA, but some posts in this category are engineering deep-dives that earn _partnership_ leads (e.g. `contentTaggingSystem`, `aiContentProductionSystem`, `video_translation_eval`). Add `/contact` as a secondary "Partner with us" CTA.
5. **`content-automation` → mailto + /contact.** Heavy-handed "talk to sales" framing for exploratory readers. Consider replacing the mailto with `/use-cases/for-marketers` for top-of-funnel posts.
6. **Single bottom-of-post placement.** Long posts (e.g. `preserveFacialFeaturesAiGeneration` at 190 keys, `f5TtsVsElevenlabs` at 144) likely lose readers before the CTA. Cheap upgrade: an inline mid-post strip anchored after the first major section.
7. **Generic header copy** — `Take the next step` / `Putting what you read into practice`. Category-specific copy will resonate better:
   - ds-ai-engineering → "Get unstuck. Book a 1:1 session."
   - content-automation → "Run this in production?"
   - video-* → "Try this on your own video."

### Suggested revised CTA map
```
nano-template       → /use-cases  ("Find your use case")
learning-education  → /use-cases/for-parents  (default; per-post override for ESL)
video-*             → /tools/video-dubbing  (unchanged)
creator-tools       → /use-cases/for-creators  (default; per-post override for known tools)
ds-ai-engineering   → MentorCruise (primary) + /contact (secondary, "Partner with us")
content-automation  → /contact (primary) + email (secondary)
```

---

## Next-up shortlist

1. **Duplicate consolidation** — pick canonical of the 4 dup pairs (`ugc-video-translation-…` kebab vs camel; `aiCollageDigitalWallpaperGuide` vs `gridCollageAiPrompts`; `f5TtsVoiceCloning` vs `f5TtsVsElevenlabs`; `videoTranscriptionTechnicalDeepDive` vs `translateYoutubeVideoToEnglish`); 301 the dead slug; update internal links. Also resolve the `video_translation_eval` orphan namespace.
2. **P1 fluff rewrite — top 5 by Search Console impressions.** Candidate list (highest-impact first, but verify against SC):
   - `nanoBananaPromptEcosystem` (keyword-stuffed intro — high impressions on "nano banana prompts")
   - `chineseCostumeHistoryInfographic` (boilerplate "Comprehensive guide to…")
   - `videoTranscriptionBusinessGuide` (boilerplate "Learn how to transcribe…")
   - `lipSyncBusinessGuide` (boilerplate "Discover how AI lip sync…")
   - `imageToNarrativeVideo` ("Transform static images into compelling…")
3. **CTA wiring expansion** — extend `BlogCTACard.tsx`:
   - Add `nano-template` → `/use-cases` ("Find your use case").
   - Add `learning-education` → `/use-cases/for-parents` (default; ESL variant for the appropriate posts).
   - Switch `creator-tools` from `/tools` index to `/use-cases/for-creators` (with per-post overrides).
   - Add secondary `/contact` for `ds-ai-engineering` posts that are engineering-heavy (e.g. `contentTaggingSystem`, `aiContentProductionSystem`).
   - Category-specific header copy (replace generic "Take the next step").
4. **P0 / P1 CTR follow-up** — after 2026-06-01, re-pull Search Console for the 10 bleeders rewritten in `0803aab` and the 3 P0 rewrites from today. Lift > 2× CTR ⇒ the playbook is working; lift flat ⇒ try a stronger framing or a different position-rank cohort.
5. **P2 audit pass** — skim the ~20 P2 bodies. If anchored in real templates and tools, leave alone; otherwise add to a future P1 list.

---

_Track sources used for this audit: `git log --since=2026-05-10`, `public/data/blogs.json`, `messages/en/blog.json`, `app/[locale]/_components/BlogCTACard.tsx`, commits `0803aab` and `ac14131`._
