# Blog Quality Improvement — Status & Audit

_Last updated: 2026-05-18 (second push — closed all 4 duplicate-consolidation pairs + the orphan namespace + the layer3 contamination, net −6,200 lines across `blog.json`). Owner: jay. Update after every push that touches blog content or `BlogCTACard.tsx`._

## Framing

Three parallel tracks:

1. **Stop the bleeders** — surgical title + `metaDescription` rewrites driven by Search Console for high-impression / low-CTR URLs at positions ~6-12. No body changes; one sweep per 5-10 posts; bump `lastmod` so the sitemap signals a re-crawl.
2. **Significant content rewrites** — replace AI-marketing fluff with original prose anchored in actual Curify capabilities (real templates, real tool URLs, real example pages). One post per commit; expect to touch hero, sections, and remove ungrounded "benefit list" boilerplate.
3. **Layout & visual polish** — uniform basic layout across every blog and the feed: no giant hero images, relaxed reading width, consistent alignment, CTA card themed in light-purple + light-blue. Affects every reader on every blog, so the impact compounds across the whole catalog rather than being per-URL.

Both tracks share the same i18n fan-out: edit `messages/en/blog.json`, delete the stale `title` field in each non-en locale, run `scripts/i18n_autotranslate.cjs --base en --files blog --write`, bump `lastmod` in `public/data/blogs.json`.

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
