# Task Scope and Execution Plan — 2026-08-09

Source: August 8 manager meeting. This document records Phase 0 scope only.
Phases B1+ and C1+ are planned but NOT executed in this document.

## 1. Workstream B goal

For each of the five domains (Section 3), find at least one strong, evidence-based
real-world professional creative workflow. Purpose:

external professional workflow → identify professional industry knowledge →
compare with Curify's current/planned workflow → identify gaps →
determine whether useful workflow nodes can improve Curify →
potentially simplify valuable workflows into Curify-style demo flows.

A workflow step with no evidence is not a workflow step. Industry-standard steps
must not be inferred merely because they are common elsewhere.

## 2. Workstream C goal

Creative Exploration / Inspiration source research, starting from Curify's
authoritative 326-query set. Future work: verify the query source, map queries to
the five domains, evaluate coverage, classify queries (KEEP / MERGE / REMOVE /
REVIEW), use selected queries to discover inspiration sources, and design a V1
data model (thumbnail, source/original URL, tags, content understanding) that
primarily routes users to the original source. No embeddings, no vector DB, no
new retrieval architecture — use Curify's existing data structures and tags.

## 3. Five domains

1. Merch / cultural creative design (文创设计)
2. Ecommerce design (电商设计)
3. Education content (教育内容)
4. Brand + Logo design (品牌 / Logo)
5. Packaging design (包装设计)

## 4. Evidence policy

Every claim in this task's outputs must be labeled with one of:

- `VIDEO_CONFIRMED` — stated or shown in one of the three reviewed Curify demo videos.
- `MANAGER_MEETING_CONFIRMED` — stated in the August 8 manager meeting, not shown in video.
- `REPOSITORY_CONFIRMED` — found directly in curify-frontend or a sibling repository.
- `EXTERNAL_SOURCE_CONFIRMED` — found in a verifiable external professional source (future phases).
- `INFERENCE` — reasoned conclusion, never presented as evidence for a workflow step.

`UNKNOWN` is used where no evidence category applies; it is never filled with
generic industry knowledge.

## 5. Current known workflow baseline

See `workflow-research-5-domains/CURRENT_CURIFY_WORKFLOW_BASELINE.md` for the
full evidence-labeled baseline. Summary: Merch, Ecommerce, and Education each
have a `VIDEO_CONFIRMED` baseline from the three reviewed demo videos; Merch and
Ecommerce also have additional `MANAGER_MEETING_CONFIRMED` scope. Brand/Logo and
Packaging have no uploaded demo video in this task and no current baseline beyond
one unverified manager statement (Brand/Logo) — both are otherwise `UNKNOWN`.

## 6. Human-review gates

- Source discovery model (Curify query → discovery surface → content page →
  original creator/professional source) requires human review before any
  discovery surface (Pinterest, Google Images, etc.) is treated as canonical.
- Query classification decisions (KEEP / MERGE / REMOVE / REVIEW) in Phase C1
  require human review before being finalized.
- High-quality source selection in Phase C2/C3 requires human review.

## 7. Explicit NO-EMBEDDING requirement

Per the manager: do not implement embeddings, image embeddings, text embeddings,
a vector database, FAISS, pgvector, Pinecone, Milvus, or any new vector-retrieval
architecture. Use Curify's existing data structures and tags. Any future schema
proposal must first inspect the current implementation (see
`inspiration-source-pilot/EXISTING_DATA_STRUCTURE_AUDIT.md`).

## 8. Git restrictions

This task operates only in the clean worktree
`/Users/baobaoli/Desktop/curify-frontend-workflow-inspiration-2026-08-09` on
branch `baobao/creative-workflow-inspiration-2026-08-09`. No commits, no pushes,
no pull requests. The original worktree (`/Users/baobaoli/Desktop/curify-frontend`)
and all sibling repositories under `/Users/baobaoli/Desktop/` are read-only for
this task. Only `docs/daily_report/8.8/` was newly written.

## 9. Planned future phases (not executed here)

- **PHASE B1** — Five-domain workflow candidate discovery.
- **PHASE B2** — Formal workflow extraction.
- **PHASE B3** — Curify workflow gap analysis + demo storyboards.
- **PHASE C1** — 326-query audit + coverage analysis.
- **PHASE C2** — Inspiration source pilot.
- **PHASE C3** — Source expansion + gallery + integration findings.
- **FINAL QA**

Phase 0 (this document set) covers environment/input verification only. B1 and
C1 are not started.
