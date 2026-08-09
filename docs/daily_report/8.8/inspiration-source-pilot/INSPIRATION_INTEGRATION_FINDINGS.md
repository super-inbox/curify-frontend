# Inspiration V1 — Existing System Integration Findings

Phase C3, Part 3. Uses only the actual Curify structures inventoried in
`EXISTING_DATA_STRUCTURE_AUDIT.md` and `EXISTING_STRUCTURE_FIELD_MAPPING.csv`
(both C1 outputs, read-only in this session, not modified). No greenfield
schema is proposed. No production code was read-written or changed — this
is a research classification only.

## The two existing systems, restated briefly

- **System A — "Inspiration Hub"** (`types/inspiration.ts`,
  `services/inspiration.ts`, `public/data/inspiration.json`): a feed of
  short-video content ideas. Has a `review_status` enum and a
  `sources: [{label}]`-shaped precedent (the `url` sub-field exists in the
  raw JSON fixture but is **not** part of the declared TS type).
- **System B — nano image catalog** (`lib/nano_pure.ts`,
  `public/data/nano_inspiration.json`, 3,611 rows in production): Curify's
  real thumbnail + tag + title/category catalog at scale. Has **zero**
  source-attribution field of any kind.

Inspiration V1 is an image-search/gallery product, so System B is the
correct base to extend — System A is the closer precedent for a couple of
specific fields (review-status enum, sources-array shape) but is the wrong
system architecturally (video-idea cards, not image records).

---

## Classification of every V1 requirement

| requirement | current field / structure | fit | limitation | minimal recommended action | classification |
|---|---|---|---|---|---|
| `thumbnail` | `asset.preview_image_url` (`RawNanoImageRecord`/`ImageView`) | YES | None — populated at production scale (3,611 rows) | None needed | **CAN_USE_NOW** |
| `title` | `locales.<lang>.title` (`RawNanoImageRecord`/`ImageView`) | YES | Per-locale, not a single canonical string | None needed | **CAN_USE_NOW** |
| `tags` | `tags: string[]` on `RawNanoImageRecord`, populated at scale, but **not re-exposed on `ImageView`** (the type actually used for rendering) | PARTIAL | Data already exists; it just doesn't survive to the client-rendering layer | Widen `ImageView` to re-expose `tags` — a type change, not a new data-collection effort | **MINIMAL_FIELD_EXTENSION** |
| `domain` | `topics: string[]` + `Topic.id`/`parentTopic` in `TopicWithTemplates` (`lib/topicRegistry_pure.ts`) already supports a 2-level tier-1/child hierarchy | PARTIAL | Structurally the right shape for domain→subdomain, but the current tier-1 topic set is not the 5 target domains | Add a mapping layer from the 5 target domains onto the existing topic-registry hierarchy, not a new taxonomy system | **MINIMAL_FIELD_EXTENSION** |
| `subdomain` | `category` field on `RawTemplate`/`RawNanoImageRecord`/`ImageView` | PARTIAL | Free-text, single-valued, locale-specific — not pre-aligned to the pilot's subdomain vocabulary (e.g. `figure_generic`, `food_beverage_packaging`) | Populate `category` (or a new sibling field) from the domain/subdomain vocabulary already used in `SOURCE_CANDIDATES.csv` | **MINIMAL_FIELD_EXTENSION** |
| `source_url` | **None** anywhere in System B. System A's `signal.sources[].url` exists only in a raw JSON fixture, undeclared in the TS type, populated only with placeholder values | NO | The single biggest confirmed schema gap | Add `source_url: string` to `RawNanoImageRecord`/`ImageView` — additive field, no rewrite | **MINIMAL_FIELD_EXTENSION** |
| `canonical_url` | None anywhere | NO | Same gap as `source_url`; C2 evidence (`pack_v098_003`) shows these two are a real, non-redundant distinction (discovery platform vs. richer original) | Add `canonical_url: string` alongside `source_url`, defaulting to the same value when no richer original exists | **MINIMAL_FIELD_EXTENSION** |
| `source_domain` | None anywhere. `source_platforms: string[]` on System A stores a platform *label*, not a parsed hostname | NO | No bare-domain field exists in either system | Derive/store `source_domain` alongside `source_url` (cheap, deterministic derivation, not new data collection) | **MINIMAL_FIELD_EXTENSION** |
| `creator_or_author` | None anywhere on either system | NO | No attribution/author field exists on any inspected type | Add `creator_or_author: string \| null` — additive | **MINIMAL_FIELD_EXTENSION** |
| `discovered_via` | None anywhere. `signal_source` on System A is the closest analog but is scoped to a different record shape (video-idea cards) | NO | No discovery-channel field exists for image records | Keep as acquisition-pipeline/QA metadata (see below) rather than a field every rendered image record must carry | **RESEARCH_METADATA_ONLY** |
| `query` | None anywhere — no stored search-term field on any image/template record; `search_aliases` is an editor-authored alias list, not a logged query | NO | No precedent at all | Keep in the acquisition pipeline's own logs/audit trail (as this pilot already does via `QUERY_326_AUDIT.csv`/`SOURCE_DISCOVERY_PROGRESS.csv`), not as a field on the production image record | **RESEARCH_METADATA_ONLY** |
| `content_understanding` | `locales.<lang>.category` + `title` give a short structured label; no long-form description/caption field at the per-image level (`TemplateView.description` exists only at template level) | PARTIAL | Short label only, not a generated "what is in this image" field | Add a `content_understanding: string` free-text field — additive, mirrors what `SOURCE_CANDIDATES.csv` already populates for all 47 pilot records | **MINIMAL_FIELD_EXTENSION** |
| `quality_status` | `rank_score?: number` exists as a relevance/quality proxy in production use (confirmed via recent repo history); no categorical PASS/FAIL/FLAGGED enum exists | PARTIAL | Numeric ranking signal, not a categorical acquisition-quality grade (A/B/C/REJECT) | Add a small categorical field alongside the existing `rank_score`, not a replacement for it | **MINIMAL_FIELD_EXTENSION** |
| `human_review_status` | `review_status: 'DRAFT'\|'APPROVED'\|'REJECTED'` exists on System A's `InspirationCardDTO` only — no equivalent on any System B record | PARTIAL | Real enum precedent exists elsewhere in the codebase, just not on the image catalog | Add the same enum pattern (or a `PENDING`-inclusive variant) to System B's image record | **MINIMAL_FIELD_EXTENSION** |

**No requirement was classified `FUTURE_OPTION`.** Every one of the 14
requirements is either already satisfied (`thumbnail`, `title`) or reachable
by an additive field/mapping-layer change on the existing nano image
structure — none required deferring past V1, and none required a new
system. This mirrors the C2 pilot's own finding of zero `DISCOVERY_ONLY`
candidates in `SOURCE_QUALITY_REVIEW.csv`: the evidence did not support
manufacturing entries in every bucket for the sake of appearing balanced.

---

## Recommended minimal integration shape

Per the manager's explicit preference, the recommendation is:

**existing nano image structure (`RawNanoImageRecord`/`ImageView`) +
existing tag/topic patterns (`lib/topicRegistry_pure.ts`) + a small set of
additive source-attribution fields**, not a new schema.

Concretely, the fields that need to be *added* (not replacing anything) are:
`source_url`, `canonical_url`, `source_domain`, `creator_or_author`,
`content_understanding`, `quality_status`, `human_review_status`, plus
re-exposing the already-populated `tags` on `ImageView` and layering a
domain/subdomain mapping onto the existing topic-registry hierarchy. Every
one of these fields is already populated, in exactly this shape, for all 47
records in `inspirations.jsonl` — that file is itself a working proof that
the additive shape is sufficient, not just a theoretical claim.

`discovered_via` and `query` are recommended to stay in the acquisition
pipeline's own audit trail (mirroring how this pilot used
`SOURCE_DISCOVERY_PROGRESS.csv`/`QUERY_326_AUDIT.csv` outside the per-record
schema) rather than becoming fields every production image record carries —
they matter for pipeline QA and source-type strategy work (see
`SOURCE_TYPE_STRATEGY.md`), not for end-user rendering.

---

## Can V1 work WITHOUT embeddings?

**Yes, based on the actual evidence gathered in C1/C2/C3.** This is an
evidence-based finding, not an assumption carried in from the manager's
instruction:

1. **Discovery worked without embeddings.** Per `SOURCE_DISCOVERY_FINDINGS.md`
   §16, every one of the 47 retained candidates was found via
   keyword-driven WebSearch and direct page fetch — no embedding, vector
   index, or similarity search of any kind was built, used, or considered
   anywhere in C1 or C2.
2. **Content description worked without embeddings.** Every
   `content_understanding` field in `SOURCE_CANDIDATES.csv` is grounded in
   text directly read off the source page (stated subject, style,
   composition, materials, production technique) — a manual/read-based
   process, not a generated embedding or caption model.
3. **The existing production catalog (System B) already organizes 3,611
   records by `tags`/`topics`/`category` — a keyword and taxonomy-based
   structure, not a vector index** — confirming Curify's current
   production system for the *closest analogous feature* (the nano image
   catalog) already operates without embeddings at meaningful scale.
4. **Filtering and search in the offline pilot gallery** (see Part 5,
   `gallery.html`) work entirely off exact/substring match over
   `tags`/`title`/`creator`/`content_understanding` — client-side text
   filtering, not similarity search — and this was sufficient to make all
   47 records browsable and searchable.

Nothing in the C1/C2/C3 evidence surfaced a need embeddings would uniquely
solve for V1's stated scope (thumbnail + link + tags + content
understanding, primarily routing users to the original source). If a
future phase needs "find visually similar inspiration" as a distinct
feature, that would be a new, separately-justified requirement — it is not
implied by anything found in this pilot.
