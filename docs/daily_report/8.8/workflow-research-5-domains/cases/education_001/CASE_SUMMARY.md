# education_001 — Case Summary

## Source

**明文密码** (contributor), "深度拆解：月营收3亿的"斑马ai课"长啥样？" (Deep-Dive: What Does the
¥300M/Month-Revenue "Zebra AI Class" Look Like?), published on **人人都是产品经理**
(woshipm.com), a well-established Chinese product-management analysis platform. The
article analyzes 斑马英语/斑马AI课 (Zebra English / Zebra AI Class), a real, currently
operating commercial product from the Zuoyebang/作业帮 family.

- URL: https://www.woshipm.com/pd/3673908.html
- Discovered in the B1 candidate pass as **EDU-01** (score 9/10, STRONG_SELECT_CANDIDATE).
- Independently re-verified in B2 via three WebFetch passes during the original build, and
  re-confirmed with a fourth independent pass during this recovery session on 2026-08-09
  — content matched consistently, with one additional detail confirmed (L2-level content
  density: 3 daily words / 1-3 sentence patterns for ages 6-8).

## Why this case was selected

B1 scored three education candidates:
- **EDU-01** (this case, 9/10) — third-party product-analysis journalism reconstructing
  Zebra's weekly content structure in detail, with real pedagogical-science backing (the
  3±2 short-term-memory-chunk claim; 9+ weekly repetition-cycling target).
- **EDU-02** (Duolingo Learning Designer case study, 7/10) — a real instructional-design
  artifact with explicit learning-science rationale, but scoped to a single internship
  assignment (not a shipped/tested product) covering only one grammar pattern — narrower
  than Curify's full "learning pack" baseline.
- **EDU-03** (Twinkl "How We Make Our Resources," 6/10) — an official first-party
  production-process account (writers/illustrators draft -> editorial review -> design
  integration -> QA -> update checks) with high source authority, but entirely generic:
  no single example project's input/process/output is shown.

EDU-01 was selected as the strongest candidate: it is a near-exact structural match to
Curify's own recorded education baseline ("story/episode -> word cards -> reading &
translation -> quiz -> character map -> full learning pack" — see
`CURRENT_CURIFY_WORKFLOW_BASELINE.md`), documenting an analogous component sequence
(video story -> word cards -> picture-book reading & follow-along -> multi-dimensional
quiz -> review/consolidation) for a real, named, high-revenue commercial product, with
concrete pedagogical rationale cited for each design choice. EDU-02 and EDU-03 were kept
as documented backups (see evidence_manifest.csv rows EV15/EV16) rather than selected,
per B1's own scoring.

## IMPORTANT — this source documents content delivery, not internal production

Unlike merch_001, ecommerce_001, and packaging_001 (which each document how a
designer/agency **produced** a deliverable) and brand_logo_001 (which documents a
design team's rebrand process), this source documents the **learner-facing weekly
content-delivery/consumption sequence** — what a child and parent experience across a
week of the product — not Zebra's internal editorial/content-production (教研) pipeline.
The article explicitly states it does not cover:
- Internal content/教研 team structure or role division
- End-to-end course-development timeline
- Curriculum copyright/licensing sourcing details
- Internal QA/review or content-approval mechanisms

This is disclosed prominently here, in `source_metadata.json`, in
`workflow_extraction.json`'s `source_limitations`, and in `QUALITY_REVIEW.md`, rather
than presented as an internal production trail. The workflow below is best read as: "the
set and sequence of distinct content-item types a themed weekly unit is built from" —
which is the same shape as Curify's own baseline (a theme is expanded into a story,
word cards, reading, quiz, and review artifacts), even though the source frames it from
the learner's experience rather than the content team's production steps.

## Input

A weekly curriculum theme with an associated target vocabulary/sentence-pattern set
(English-language, for children roughly 3-7 years old). Confirmed by source quote:
"each week, [the learner] studies one theme."

## Verified content-sequence (8 items, all EXTERNAL_SOURCE_CONFIRMED)

1. **Daily Story Video Lesson** (Mon-Thu) — 3-5 min English fairy-tale-drama video with a
   real foreign teacher; four days interlock into one weekly story arc.
2. **Illustrated Audio Word Cards** — digital flashcards (image + audio + word) per
   target vocabulary item.
3. **Picture-Book Reading & Follow-Along** (Mon-Thu) — day's content re-contextualized in
   a new mini-story; read first, then read-aloud follow-along.
4. **Multi-Dimensional Quiz** — deliberately plain-format quiz testing the same knowledge
   point across pronunciation, meaning, and written form separately.
5. **Simulated Foreign-Teacher Phone Call ("Zebra Call")** — direct-address review
   checkpoint with built-in pause time for the child to respond.
6. **WeChat Chinese-Teacher Mini-Video** (daily) — Chinese-speaking teacher's follow-along
   read-through plus pronunciation-point coaching, delivered outside the core app.
7. **WeChat Group Recorded-Practice Task & Feedback** (daily) — child records real-object
   practice video; teacher reviews/comments in-group.
8. **Friday Interactive Live-Format Class** — ~20-minute simulated-live class with
   competitive game-style interaction, closing out the week's new-content phase.

See `workflow_extraction.json` for full structured detail and `evidence_manifest.csv`
for quote-level evidence backing each item.

## Step-order caveat

The article lists these 8 components in a stated order (numbered 1-8) but does not use
explicit "then/next" sequencing language for the intra-day placement of Word Cards, Quiz,
and Zebra Call relative to each other. The sequence used here follows the article's own
listed presentation order; step **existence/content** confidence is HIGH throughout, but
**intra-day micro-ordering** confidence is MEDIUM for steps 2, 4, and 5. There is also a
disclosed internal inconsistency in the source itself: its stated overall cadence
("first 3 days new content, last 2 days review") does not cleanly reconcile with the
day-specific labels given elsewhere (Video/Story&Speaking explicitly Monday-Thursday = 4
days; TV Live Class explicitly Friday) — the content of the stated "review days" (day 5+)
is never described in the article. This is flagged in `source_limitations`, not resolved
by invention.

## Outputs

- Weekly content-delivery cycle spanning 8 distinct content-item types across the week.
- Parent-facing learning report (学习报告) — existence and purpose (an "immediate-
  effectiveness signal" to parents) directly quoted, but no content/format detail is
  given, so it is listed as a known output artifact only (PARTIALLY_SUPPORTED), not as a
  workflow step.

## Professional knowledge found

- Cognitive-load ceiling: children aged 3-7 have short-term memory capacity of only
  "3±2" chunks, cited as the rationale motivating the whole repetition/reinforcement
  design.
- Spaced/varied repetition target: each target word is cycled through 9+ distinct
  exposures per week, deliberately varied in modality (listening, multi-channel
  presentation, reading, oral communication, guided reading, self-expression).
- Teaching-methodology principle: foreign teachers combine rhythm-based instruction and
  TPR (Total Physical Response) — songs/rhythm, exaggerated expressions/gestures,
  repetition.
- Quiz-design principle: test the same knowledge point across multiple separate
  dimensions (pronunciation/meaning/written form) rather than one combined item; visual
  polish of the quiz itself is explicitly deprioritized.
- Build-vs-license strategy: the company chose self-developed ("自研") content over
  licensing existing curricula — noted by the article as a deliberate, harder path.

## Important limitations

- This source documents learner-facing content delivery, not internal production (see
  callout above) — the single most important caveat for this case.
- Third-party analyst commentary (woshipm.com), not an official first-party account from
  Zebra/Zuoyebang; source_authority capped at 1/2 in source_metadata.json accordingly.
- Intra-day ordering of Word Cards/Quiz/Zebra Call is inferred from listed article order,
  not explicit sequencing language (MEDIUM confidence on order, not HIGH).
- Internal inconsistency in the source's own stated weekly cadence vs. day-specific
  component labels (see Step-order caveat above); "review day" content is never
  described.
- The source itself flags product weaknesses: "AI" branding described as still largely
  conceptual ("AI仍停留概念阶段"), and content density noted as relatively low vs.
  competitors (L2 level: 3 daily words / 1-3 sentence patterns, with 2 of 5 weekly days
  devoted solely to review).
