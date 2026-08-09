# Existing Curify Data Structure Audit (Phase 0, REPOSITORY_CONFIRMED)

Read-only audit of the current clean worktree
(`/Users/baobaoli/Desktop/curify-frontend-workflow-inspiration-2026-08-09`, branch
`baobao/creative-workflow-inspiration-2026-08-09`). Every entry below was directly
read from the file listed. No new schema is proposed here — this is inventory only.

**Important finding up front:** there are two structurally unrelated "inspiration"
systems in this codebase today. Any Inspiration V1 design work must not conflate them.

---

## System A — "Inspiration Hub" (video content-idea cards)

### 1. `types/inspiration.ts`
- **Structures:** `InspirationCardDTO` (API shape), `InspirationCardUI` (rendered shape).
- **Relevant fields (DTO):** `source_text`, `source_title`, `source_platforms: string[]`,
  `signal_source`, `subtitle`, `inspiration_tags: string[]`, `audiences: string[]`,
  `output_title`, `output`, `prompt`, `video_format`, `video_duration_sec`,
  `review_status: "DRAFT"|"APPROVED"|"REJECTED"`, `star_rating`, `image_url`,
  `preview_image_url`.
- **Current usage:** Backs `/inspiration-hub` — a feed of short-video content ideas
  (signal → translation/angle → hook → production beats), not an image-search gallery.
- **Active/current:** Yes — actively imported by `services/inspiration.ts` and
  `app/[locale]/(public)/inspiration-hub/InspirationHubClient.tsx`.
- **Inspiration V1 usefulness:** Has `source_platforms`/`source_text`/`source_title` —
  conceptually the closest existing field group to "source/original URL," but it stores a
  platform label + text snippet, not a resolvable source URL back to an original creator page.

### 2. `services/inspiration.ts`
- **Structure:** `inspirationService` — `getCards()`, `getCardById()`,
  `getNanoCardById()`, `getStats()`. Wraps `apiClient.request` calls to
  `/inspiration/cards`, `/api/inspiration/{id}`, `/api/nano-inspiration/{id}`,
  `/inspiration/stats`.
- **Current usage:** Server-side data-fetching layer for the Inspiration Hub feature above,
  React-`cache`-memoized.
- **Inspiration V1 usefulness:** Establishes an existing backend API surface
  (`/inspiration/cards`) and filter params (`review_status`, `lang`, `min_rating`,
  `limit`, `offset`) that a V1 gallery could potentially reuse or extend, if V1 ends up
  living on the same backend.

### 3. `public/data/inspiration.json`
- **Structure:** `{ "items": [...] }`, 3 items only.
- **Relevant fields:** `id`, `lang`, `status`, `featured`, `rank`, `createdAt`,
  `signal.sources[]` (each `{ label, url }`), `translation.tag`, `translation.angles[]`,
  `hook.text`, `production.format/beats[]/durationSec/platformHints[]`.
- **Current usage:** Appears to be a small local example/seed dataset for System A (matches
  `InspirationCardDTO`/`InspirationCardUI` shape). All 3 `signal.sources[].url` values observed
  are the placeholder `https://example.com` — i.e. the source-URL field exists structurally but
  contains no real resolvable URLs in this sample file.
- **CORRECTION (Phase C1, 2026-08-09):** the `url` sub-field observed in this JSON fixture is
  **not part of the declared TypeScript contract**. `InspirationCardUI.signal.sources` in
  `types/inspiration.ts` is typed as `{ label: string }[]` only — no `url` key. So `sources[].url`
  is real in the raw JSON sample but undeclared in the type both DTO and UI shapes use for
  rendering; it is weaker prior art for V1 than "the codebase already has a sources[{label,url}]
  pattern" suggests — a V1 design reusing this pattern would need to add `url` to the type, not
  just point at existing code.
- **Active/current:** Unclear scale — only 3 records, likely a fixture/seed rather than
  production data (the live Inspiration Hub is API-backed per `services/inspiration.ts`).
- **Inspiration V1 usefulness:** Confirms the codebase already has a `sources: [{label, url}]`
  pattern precedent, which is directly relevant prior art for V1's "source/original URL"
  requirement — but it lives in the wrong system (video-idea cards, not image search) and its
  only sample values are placeholders, not real provenance.

---

## System B — Nano image inspiration / template catalog (search + example galleries)

### 4. `lib/nano_pure.ts`
- **Structures:** `RawTemplate`, `RawNanoImageRecord`, `TemplateView`, `ImageView`.
- **Relevant fields (`RawNanoImageRecord`):** `id`, `template_id`,
  `asset.image_url`, `asset.preview_image_url`, `asset.audio_url?`, `asset.video_url?`,
  `params: Record<string, any>`, `locales?.{category, title}` (per-locale),
  `topics?: string[]`, `tags?: string[]`, `allow_i18n?: boolean`.
- **Current usage:** This is the client-safe type layer for the main nano image catalog
  (deliberately import-free of the actual ~4MB JSON to avoid client-bundle bloat — see
  in-file comment). `ImageView`/`TemplateView` are the resolved, locale-flattened shapes
  used for rendering.
- **Active/current:** Yes, and explicitly guarded (there is a build-time regression check
  preventing the raw JSON from leaking into client bundles).
- **Inspiration V1 usefulness:** This is Curify's real thumbnail + tag + "content
  understanding" (category/title) structure already at scale. **Gap: there is no
  source/original-URL field anywhere in this type** — `asset` only has `image_url` /
  `preview_image_url` / `audio_url` / `video_url`, all Curify-hosted CDN paths, not
  external source links. This is the concrete schema gap V1 needs to close.
- **CORRECTION (Phase C1, 2026-08-09):** `tags: string[]` lives on `RawNanoImageRecord`
  (confirmed populated at scale) but is **not re-exposed on `ImageView`** — the resolved,
  locale-flattened type actually used for rendering (see `lib/nano_pure.ts` lines ~107-119).
  Only `TemplateView.topics` survives to the rendering layer. If Inspiration V1 is built on top of
  `ImageView` (rather than the raw registry), per-image `tags` are not currently available there
  without widening that type.

### 5. `public/data/nano_inspiration.json`
- **Row count:** 3,611 records (verified: `json.load` + `len()`).
- **Structure:** matches `RawNanoImageRecord` above, plus observed `legacy_id`,
  `legacy_template_id`, `search_aliases: string[]`.
- **Sample fields present:** `asset.image_url`, `asset.preview_image_url`, `params`,
  `locales.<lang>.{category, title}`, `tags` (large open tag vocabulary, e.g.
  `"character"`, `"illustration"`, `"vintage-retro"`, `"chic"`), `search_aliases`
  (e.g. Chinese-language alias strings for search matching), `topics` (often empty array
  in sampled record).
- **No field observed:** any `source_url`, `origin_url`, `source_platform`, or
  `attribution` field of any kind.
- **Active/current:** Yes — this is the production nano-inspiration catalog referenced
  throughout `lib/nano_pure.ts`'s in-file comments as the ~4MB registry.
- **Inspiration V1 usefulness:** Best existing candidate for V1's thumbnail/tags/content-
  understanding requirements (image_url + preview_image_url + tags + category/title already
  satisfy 3 of V1's 4 stated needs). Source/original URL is the one field V1 would need to
  add — this file has zero existing precedent for it.

### 6. `public/data/inspiration_index.json`
- **Row count:** 1,410 records.
- **Structure:** A lighter subset of the same record shape — `id`, `template_id`,
  `locales: string[]` (just language codes present, not full locale objects),
  `params`, `tags`, `topics`.
- **Current usage:** Appears to be a smaller/derived index (fewer fields, fewer rows than
  `nano_inspiration.json`) — likely a search-index or filtering artifact rather than the
  full-detail catalog. Exact call sites not traced in this Phase 0 pass (out of scope; see
  Phase C1).
- **Inspiration V1 usefulness:** Confirms tags/topics/params are treated as first-class,
  independently-indexable fields elsewhere in the codebase — relevant precedent for how V1
  tags might be structured, but again no source-URL precedent.

### 7. `lib/topicRegistry_pure.ts` + `messages/<locale>/topics.json`
- **Structures:** `Topic {id}`, `TemplateLike {id, topics?}`, `InspirationLike {id,
  template_id, topics?}`, `TopicWithTemplates` (adds `templates[]`, `templateCount`,
  `isEnabled`, `parentTopic?`), `TopicRegistry` (maps of topic↔template relationships).
- **i18n side:** `messages/en/topics.json` (and 9 other locales) key topics by id with
  `displayName`, `title`, `description`, `intro`, `keywords: string[]`.
- **Current usage:** Drives topic navigation/hub pages (`TopicNavRow.tsx`, `TopicStrip.tsx`,
  `TopicFormatContent.tsx`) and topic-to-template association used across search and
  programmatic-SEO topic hubs (`docs/programmatic-seo-topic-hubs.md` exists in-repo).
- **Active/current:** Yes, actively built via multiple `lib/generated/topic_*.json`
  artifacts (`topic_icons.json`, `topic_cooccurrence.json`, `topic_thumbnails.json`).
- **Inspiration V1 usefulness:** This is the closest existing thing to a "domain/vertical
  category" taxonomy in the codebase (topic id → i18n label/description/keywords, plus a
  topic→template graph). A V1 domain/subdomain mapping (Merch/Ecommerce/Education/
  Brand-Logo/Packaging) could plausibly reuse this topic-registry pattern rather than
  inventing a new one — worth evaluating in Phase C1, not decided here.

---

## Summary table

| # | File | Structure | Thumbnail | Source URL | Tags | Content understanding | Active |
|---|---|---|---|---|---|---|---|
| 1 | `types/inspiration.ts` | `InspirationCardDTO` | `image_url`/`preview_image_url` (optional) | `source_platforms`/`source_text` (label/snippet, not a URL) | `inspiration_tags` | `output_title`/`output` | Yes (System A) |
| 3 | `public/data/inspiration.json` | items[] | — | `signal.sources[].url` (placeholder values only) | — | `translation`/`hook`/`production` | Sample/seed only |
| 4/5 | `lib/nano_pure.ts` + `nano_inspiration.json` | `RawNanoImageRecord` | `asset.image_url`/`preview_image_url` | **none** | `tags`, `search_aliases` | `locales.<lang>.category/title` | Yes (System B, 3,611 rows) |
| 6 | `inspiration_index.json` | subset record | — (not in subset) | **none** | `tags`, `topics` | — (not in subset) | Yes (System B, 1,410 rows) |
| 7 | `topicRegistry_pure.ts` + `topics.json` | `TopicWithTemplates` | via `topic_thumbnails.json` (generated, not inspected in detail) | — | `keywords` | `displayName`/`description`/`intro` | Yes |

## Conclusion for Phase 0

No existing structure in this codebase already satisfies all four of V1's stated needs
(thumbnail, source/original URL, tags, content understanding) at once. System B
(`nano_inspiration.json` + `lib/nano_pure.ts`) is the strongest base — it already has
thumbnail, tags, and content-understanding fields at production scale (3,611 rows) — but
has **zero existing source/original-URL field**, which is the one gap Phase C1/C2 will need
to design around, using the `signal.sources[].url` pattern from System A as prior art rather
than inventing something new. No new schema is proposed in this document, per Phase 0 scope.
