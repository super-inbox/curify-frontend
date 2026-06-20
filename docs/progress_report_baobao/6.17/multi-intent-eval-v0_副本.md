# Multi-intent Search V0 — Gold Evaluation Set

_Status: gold labels complete — awaiting model implementation._  
_Design spec: `docs/multi-intent-v0-design.md`._  
_Last updated: 2026-06-18. Owner: jay._

---

## 1. Purpose

This document is the human-authored ground truth for the Multi-intent Search V0 feature. It defines the correct sub-intent decomposition for 20 broad queries **before** the LLM implementation is built. This ordering is deliberate: writing expected answers before seeing model output prevents label contamination.

Once the feature is implemented (design doc Step 6), a human judge will fill in the **Actual model output** sections and score each query against the rubric below. The aggregate score determines whether V0 is ready to ship.

---

## 2. Relationship to the existing Search Eval Set

The existing search regression eval (`scripts/configs/search_eval_set.json`, documented in `docs/search-eval-set.md`) tests **recall and precision** — does a query return the right inspirations and templates from the catalog? It is evaluated by `scripts/eval_search.cjs`.

This document tests something orthogonal: **goal decomposition quality** — does the multi-intent system correctly identify the distinct user goals behind a broad query, express them in the right language, and produce search queries suitable for drilling in?

The two eval sets must remain independent:
- The search regression eval must not be modified as part of multi-intent work.
- Multi-intent chips are not expected to improve search regression scores directly; they are a UX layer above the existing search engine.

---

## 3. Gold-label rules

These rules governed how every expected sub-intent in this document was written. The same rules must be enforced in the LLM system prompt.

1. **Goal diversity**: every sub-intent must represent a meaningfully different user goal. Synonyms (旅行 / 旅游, wedding flowers / floral decor) are not acceptable as separate entries.
2. **Language preservation**: `label` and `searchQuery` must match the input query language. Chinese queries → Chinese labels and Chinese searchQuery values. English queries → English labels and English searchQuery values. Do not mix scripts within a sub-intent.
3. **No original-query echo**: no `searchQuery` may equal the parent query verbatim.
4. **Visual and actionable grounding**: sub-intents should lead toward a Curify visual product — a poster, infographic, guide, flashcard, map, collage, timeline, mood board, or similar artifact. Avoid purely transactional intents (booking a hotel, buying a ticket, checking live scores).
5. **No style as a primary differentiator**: "watercolor plants" and "minimalist plants" are not valid separate goals. Visual style is a secondary axis and must not appear as the primary distinction between two chips.
6. **Label ≤ 5 words**: labels must be chip-scannable at a glance.
7. **searchQuery must be a natural user query**: no special characters, no quotes, no internal syntax.
8. **Count**: 4 or 5 expected sub-intents per query. Fewer than 4 is too sparse; more than 5 is overwhelming on mobile.
9. **Avoid real-time intents**: weather forecasts, live prices, breaking news, bookings, legal applications, and other transactional / time-sensitive content are out of scope for a visual content platform.

---

## 4. Evaluation rubric

Each scored dimension uses a 1–3 scale applied to the **actual model output** (not the gold labels). All criteria scores are PENDING until model output is available.

### Relevance (C1)
Does every generated sub-intent clearly relate to the parent query?

| Score | Meaning |
|---|---|
| 3 | All generated sub-intents are clearly relevant to the parent query |
| 2 | Most sub-intents are relevant; one is a stretch or tangential |
| 1 | Two or more sub-intents are unrelated or misleading |

### Diversity (C2)
Do the sub-intents represent meaningfully different user goals?

| Score | Meaning |
|---|---|
| 3 | All sub-intents represent distinct goals; no synonyms |
| 2 | Mostly distinct; one borderline synonym pair |
| 1 | Two or more are synonyms or near-duplicates |

### Language consistency (C3)
Does the output language match the input query language?

| Score | Meaning |
|---|---|
| 3 | All labels and searchQuery values are fully in the input language |
| 2 | Minor mixed-script issue in one sub-intent |
| 1 | Wrong language or script in two or more sub-intents |

### Searchability (C4)
Are the `searchQuery` values usable as natural follow-up searches?

| Score | Meaning |
|---|---|
| 3 | All searchQuery values are clear, natural follow-up queries |
| 2 | Most are usable; one is awkward or overly long |
| 1 | Two or more are unusable (too abstract, broken syntax, empty) |

### Visual / actionable value (C5)
Are the sub-intents suitable for visual search and content creation on Curify?

| Score | Meaning |
|---|---|
| 3 | All lead toward a visual artifact (poster, infographic, map, guide, etc.) |
| 2 | Most are suitable; one leads toward non-visual content |
| 1 | Two or more lead toward transactional or non-visual content |

---

## 5. Acceptance criteria

### Per-query pass threshold
- Average criterion score (C1–C5) ≥ **2.5**
- Duplicate `searchQuery` count = **0**
- Verdict: **PASS**

Queries with average ≥ 2.0 and < 2.5, or one minor duplicate, receive **WARN**. Below 2.0 or a major language failure receives **FAIL**. Any unscored query is **PENDING**.

### Ship threshold
- At least **16 of 20** parent queries must receive PASS.
- Every passing query must contain at least **3 relevant and distinct** generated sub-intents.
- No query may receive FAIL on C3 (Language consistency) — a language failure is a hard blocker regardless of other scores.

---

## 6. Query sections

---

## Query 1 — 北京

**Query:** 北京  
**Language:** zh (Simplified Chinese)  
**Category:** City / Place  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
北京 (Beijing) is a single proper noun that simultaneously triggers five orthogonal user goals: trip planning, attraction discovery, food exploration, historical learning, and spatial/map orientation. No single Curify content surface can serve all five goals equally. This is the flagship example from the product requirements document and serves as the primary calibration query for the eval set.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | 旅行攻略 | 北京旅行攻略 | Plan a Beijing trip: itinerary, logistics, timeline |
| 2 | 城市地图 | 北京城市地图 | Find a visual city or attraction map to orient spatially |
| 3 | 景点推荐 | 北京景点推荐 | Discover major landmarks and attractions as a curated visual list |
| 4 | 美食指南 | 北京美食指南 | Explore Beijing's local cuisine and food culture |
| 5 | 历史文化 | 北京历史文化 | Learn about Beijing's history, dynasty heritage, and cultural identity |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 2 — wedding

**Query:** wedding  
**Language:** en  
**Category:** Life Event  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"wedding" is one of the highest-traffic queries in the catalog. A user typing it could want to design an invitation, plan a ceremony schedule, select decoration styles, create a seating chart, or assemble a photo memory. These are all distinct creation tasks — a user working on invitations is not the same as a user planning a seating layout. The catalog is rich enough across all five goals to make the decomposition valuable.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | invitation design | wedding invitation design | Design a wedding invitation card |
| 2 | planning checklist | wedding planning checklist | Create or follow a step-by-step planning guide |
| 3 | decoration ideas | wedding decoration ideas | Visualize and choose ceremony and reception decoration |
| 4 | seating plan | wedding seating plan | Design a guest seating chart or table map |
| 5 | photo collage | wedding photo collage | Assemble wedding photos into a shareable memory collage |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 3 — football

**Query:** football  
**Language:** en  
**Category:** Sport  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"football" is highly polysemous in a visual content context: a user may want a match event poster, a player profile card, a tactics diagram, a team history timeline, or a World Cup content piece. These goals require different templates (single-player portrait vs. team grid vs. bracket infographic). The 2026 World Cup context also makes this a timely catalog-rich query.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | match poster | football match poster | Create a visual match announcement or preview poster |
| 2 | player profile | football player profile | Build a single player's profile card with stats and biography |
| 3 | tactics diagram | football tactics diagram | Visualize formations, positions, and strategic play patterns |
| 4 | team history timeline | football team history timeline | Show the evolution and milestones of a club or national side |
| 5 | World Cup infographic | football World Cup infographic | Explore tournament content: brackets, groups, and records |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 4 — plants

**Query:** plants  
**Language:** en  
**Category:** Nature / Lifestyle  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"plants" spans at least five independently useful visual directions: practical care guides, identification charts, interior decorating with plants, botanical fine-art illustrations, and science education. These goals differ in both content type (how-to vs. art vs. vocabulary) and the templates that serve them. A user searching for a plant care guide has different needs from one seeking a botanical illustration poster.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | plant care guide | plant care guide | Learn watering, light, and soil requirements in a visual guide |
| 2 | plant identification chart | plant identification chart | Identify plant species through a visual reference chart |
| 3 | indoor plant home decor | indoor plant home decor guide | Plan and visualize how to use plants in interior design |
| 4 | botanical illustration | botanical plant illustration | Create or explore fine-art botanical print imagery |
| 5 | plant science infographic | plant science infographic | Understand plant biology, anatomy, or ecology visually |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 5 — 日本

**Query:** 日本  
**Language:** zh (Simplified Chinese)  
**Category:** Country / Place  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
日本 (Japan) is a country query typed in Chinese, indicating the user wants content about Japan but prefers a Chinese-language interface and output. It parallels Query 1 (北京) but tests country-level decomposition rather than city-level. The catalog has strong Japan content across travel, cuisine, traditional costume (kimono, hanbok), and cultural festivals, making all five sub-intents catalog-grounded.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | 旅行攻略 | 日本旅行攻略 | Plan a Japan trip with itinerary and destination highlights |
| 2 | 城市地图 | 日本城市地图 | Find visual maps of Japanese cities or regions |
| 3 | 日本美食 | 日本美食指南 | Explore Japanese cuisine, dishes, and food culture |
| 4 | 传统文化 | 日本传统文化 | Learn about Japanese traditions, arts, and customs |
| 5 | 节日与传统服饰 | 日本节日与传统服饰 | Discover Japanese festivals and traditional clothing such as kimono |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 6 — 猫

**Query:** 猫  
**Language:** zh (Simplified Chinese)  
**Category:** Animal / Pet  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
猫 (cat) is a two-byte CJK query that tests single-token Chinese decomposition. The user could want a breed reference guide, a pet care how-to, a science or knowledge card, an artistic portrait poster, or a practical product reference. These five goals map to five different template families in the catalog and differ at the content-type axis (reference vs. care vs. art vs. science vs. shopping). This query also tests whether the model preserves Chinese output for a minimal CJK input.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | 猫咪品种图鉴 | 猫咪品种图鉴 | Browse a visual reference of cat breeds and their characteristics |
| 2 | 养护指南 | 猫咪养护指南 | Learn how to feed, groom, and care for a cat |
| 3 | 猫咪知识科普 | 猫咪知识科普 | Understand cat anatomy, behavior, and biology through infographics |
| 4 | 猫咪肖像海报 | 猫咪肖像海报 | Create or explore artistic cat portrait poster designs |
| 5 | 猫咪用品清单 | 猫咪用品清单 | Reference a visual checklist of essential cat supplies and accessories |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 7 — anime

**Query:** anime  
**Language:** en  
**Category:** Entertainment / Culture  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"anime" is one of the strongest tier-2 topic slugs in the catalog (it has a `/topics/anime` redirect for exact-match). However, as a free-text query it surfaces users with at least four distinct goals: character posters, character grid comparisons (like MBTI grids), personality analysis, scene visualization, and series reference guides. These require different template families. The topic-slug redirect only fires on the exact string "anime" — the multi-intent chips are visible on the search results page when the query is slightly broader (e.g., "anime characters", "my anime") but this query specifically tests the boundary behavior.

_Note to evaluators: if the exact query "anime" redirects to `/topics/anime` rather than landing on the search page, the `from_intent` URL flag mechanism (design doc Section 18) needs to be confirmed as working correctly for this edge case._

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | character poster | anime character poster | Create or find a single character's visual profile poster |
| 2 | fandom character grid | anime fandom character grid | Browse a grid of characters from a specific franchise |
| 3 | personality chart | anime personality chart | Explore MBTI or archetype personality assignments for anime characters |
| 4 | scene storyboard | anime scene storyboard | Visualize a key scene or moment from an anime story |
| 5 | series visual guide | anime series visual guide | Reference a visual summary or overview of a complete series |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 8 — travel

**Query:** travel  
**Language:** en  
**Category:** Broad Domain  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"travel" is a tier-1 topic domain, but as a single word it represents at least five very different creation tasks: writing an itinerary, choosing a destination, reading a city map, packing for a trip, and keeping a journal. Each maps to a distinct template family in the catalog. This query tests whether the model can decompose a top-level domain term into goal-specific sub-intents rather than returning category-level synonyms.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | travel itinerary | travel itinerary | Plan a day-by-day trip schedule and route |
| 2 | destination guide | travel destination guide | Discover and compare travel destinations visually |
| 3 | city map | travel city map | Find a visual map of a specific city or region |
| 4 | packing checklist | travel packing checklist | Build a visual checklist of items to pack |
| 5 | travel journal collage | travel journal collage | Assemble trip memories into a photo journal or scrapbook |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 9 — music

**Query:** music  
**Language:** en  
**Category:** Arts / Entertainment  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"music" covers genre exploration, artist biography, instrument reference, event promotion, and historical timelines — five goals that each require a different content type. A genre guide is a categorization infographic; an artist profile is a character card; an instrument chart is a vocabulary-type reference; a concert poster is an event artifact; a history timeline is an evolution graphic. The catalog has explicit content for at least three of these, and the Generable Templates section can fill gaps for the others.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | music genre guide | music genre guide | Explore and compare different music genres visually |
| 2 | music artist profile | music artist profile | Build or view a visual profile card for a musician or band |
| 3 | musical instrument chart | musical instrument chart | Reference a visual chart of instruments by family or type |
| 4 | music concert poster | music concert poster | Design or find a concert or festival event poster |
| 5 | music history timeline | music history timeline | Trace the evolution of music movements and eras |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 10 — Christmas

**Query:** Christmas  
**Language:** en  
**Category:** Holiday / Seasonal  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"Christmas" is a seasonal event query that spans five distinct creation modes: promotion (event posters), gifting (gift guides), cooking (recipe cards), decorating (decoration ideas), and learning (vocabulary cards for language learners). These are not synonymous — a user creating a Christmas party poster has no overlap with a user building a holiday vocabulary flashcard deck. The catalog has content across multiple Christmas sub-domains, making all five chips meaningful.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | Christmas event poster | Christmas event poster | Design a Christmas party or event announcement poster |
| 2 | Christmas gift guide | Christmas gift guide | Create or reference a visual gift recommendation guide |
| 3 | Christmas recipe cards | Christmas recipe cards | Visualize holiday recipes in a shareable card format |
| 4 | Christmas decoration ideas | Christmas decoration ideas | Explore visual decoration concepts for home or event spaces |
| 5 | Christmas vocabulary cards | Christmas vocabulary cards | Build a vocabulary flashcard set around Christmas themes |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 11 — fashion

**Query:** fashion  
**Language:** en  
**Category:** Style / Design  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"fashion" is a tier-2 topic with rich catalog content across outfit styling, trend visualization, garment education, and product commerce. The five sub-intents span the full creation spectrum from personal styling (lookbook) to brand commerce (ecommerce product board) to editorial trend presentation (mood board) — these are different enough in purpose and audience that a single flat result grid obscures which direction to pursue.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | fashion outfit lookbook | fashion outfit lookbook | Create a personal style lookbook with outfit combinations |
| 2 | fashion trend mood board | fashion trend mood board | Visualize current or seasonal fashion trends as a mood board |
| 3 | fashion garment guide | fashion garment guide | Reference different garment types, names, and silhouettes |
| 4 | fashion styling guide | fashion styling guide | Learn how to pair and style clothing pieces visually |
| 5 | fashion ecommerce product board | fashion ecommerce product board | Create a commerce-ready product display board for garments |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 12 — coffee

**Query:** coffee  
**Language:** en  
**Category:** Food / Lifestyle  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"coffee" is a single food/lifestyle noun that maps to at least five different visual output types: a how-to brewing guide, a geographic origin map, a menu or product design, a recipe card collection, and a cultural history timeline. Each involves a different template family (how-to infographic, map, menu design, card grid, timeline). The five goals are sequentially different in what the user intends to make or learn, not variations of the same thing.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | coffee brewing guide | coffee brewing guide | Learn brewing methods (pour-over, espresso, French press) visually |
| 2 | coffee bean origin map | coffee bean origin map | Explore the geographic origins of coffee varieties on a visual map |
| 3 | coffee shop menu design | coffee shop menu design | Design a café menu or drinks board |
| 4 | coffee recipe cards | coffee recipe cards | Create or reference visual cards for coffee drink recipes |
| 5 | coffee history timeline | coffee history timeline | Trace the global spread and evolution of coffee culture |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 13 — 旅行

**Query:** 旅行  
**Language:** zh (Simplified Chinese)  
**Category:** Broad Domain  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
旅行 is the Chinese equivalent of "travel" and provides a direct language-parity test for Query 8. It tests whether the system correctly produces Chinese-language output for a Chinese input on the same broad domain. While the user goals are the same as Query 8, the output must remain fully in Chinese — label and searchQuery both. This pair (Query 8 / Query 13) allows the evaluator to confirm there is no Chinese-to-English language drift in the model's response.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | 行程规划 | 旅行行程规划 | Plan a day-by-day trip schedule and route (Chinese output) |
| 2 | 目的地指南 | 旅行目的地指南 | Discover and compare travel destinations visually (Chinese output) |
| 3 | 城市地图 | 旅行城市地图 | Find a visual map of a specific destination (Chinese output) |
| 4 | 打包清单 | 旅行打包清单 | Build a visual checklist of items to pack (Chinese output) |
| 5 | 旅行相册拼贴 | 旅行相册拼贴 | Assemble trip memories into a photo journal or scrapbook (Chinese output) |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 14 — dog

**Query:** dog  
**Language:** en  
**Category:** Animal / Pet  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"dog" is the English language-parity test for Query 6 (猫). It tests single-word animal decomposition in English and verifies the model can produce five distinct goals that differ from each other in artifact type: a reference chart (breed guide), a checklist (care), a how-to (training), an anatomy diagram (science), and a portrait (art). These five types are each served by different template families in the catalog.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | dog breed guide | dog breed guide | Browse a visual reference of dog breeds and their characteristics |
| 2 | dog care checklist | dog care checklist | Build a visual checklist for daily dog care and health routines |
| 3 | dog training tips | dog training tips | Learn training commands and methods through a visual guide |
| 4 | dog anatomy guide | dog anatomy guide | Understand dog body structure and anatomy visually |
| 5 | dog portrait poster | dog portrait poster | Create or find an artistic dog portrait design |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 15 — paris

**Query:** paris  
**Language:** en  
**Category:** City / Place  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"paris" is the English equivalent of Query 1 (北京) — a city name that triggers at least five distinct creation goals. It tests city-level decomposition in English and verifies that the model produces goals appropriate for an international city with strong associations across travel, food, art, fashion, and landmarks. The catalog has Paris content in at least travel posters and maps, and the Generable Templates section fills remaining gaps.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | paris travel itinerary | paris travel itinerary | Plan a Paris visit with day-by-day itinerary and highlights |
| 2 | paris city map | paris city map | Find a visual map of Paris neighborhoods and landmarks |
| 3 | paris food guide | paris food guide | Explore Parisian cuisine, cafes, and food culture |
| 4 | paris landmark poster | paris landmark poster | Create a visual poster featuring Paris landmarks and icons |
| 5 | paris fashion mood board | paris fashion mood board | Visualize Paris fashion and style as an editorial mood board |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 16 — love

**Query:** love  
**Language:** en  
**Category:** Abstract / Emotion  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"love" is an abstract noun that is unusually polysemous in a visual content context. It could drive relationship compatibility content (MBTI-style), an inspirational quote poster, a romantic anniversary memory collage, a vocabulary learning card set, or a gift guide. These five interpretations span nearly every content type Curify offers. This query also tests the model's ability to handle abstract nouns without drifting into transactional intents (avoid: "find a lover", "online dating apps").

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | relationship compatibility chart | love relationship compatibility chart | Explore romantic compatibility through a visual MBTI or archetype chart |
| 2 | love quote poster | love quote poster | Design or find an inspirational love quote typography poster |
| 3 | anniversary photo collage | love anniversary photo collage | Assemble a couple's photo memories into a romantic collage |
| 4 | love vocabulary guide | love vocabulary guide | Build a visual vocabulary card set around love and relationship terms |
| 5 | romantic gift guide | romantic love gift guide | Reference a visual gift idea guide for romantic occasions |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 17 — 美食

**Query:** 美食  
**Language:** zh (Simplified Chinese)  
**Category:** Food / Cuisine  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
美食 (gourmet food / delicious food) is a Chinese food domain noun that is broader than any specific dish or cuisine. It is the Chinese language-parity test for "coffee" and "food" concepts, but specifically tests the food domain in Chinese. The five goals span recipe creation, regional discovery, ingredient reference, menu design, and cultural education — each requiring a different template type.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | 食谱海报 | 美食食谱海报 | Create a visual recipe poster for a dish |
| 2 | 地方特色美食指南 | 地方特色美食指南 | Explore regional and local specialty foods visually |
| 3 | 食材词汇卡 | 美食食材词汇卡 | Learn food ingredient vocabulary through visual flashcards |
| 4 | 菜单设计 | 美食菜单设计 | Design a restaurant or café menu visually |
| 5 | 世界美食文化海报 | 世界美食文化海报 | Explore global food culture through an infographic or poster |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 18 — sport

**Query:** sport  
**Language:** en  
**Category:** Broad Domain  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"sport" (singular) is the British English domain term for athletics in general and tests broad-domain decomposition distinct from Query 3 ("football") which is sport-specific. The five sub-intents cover the full spectrum of sports content: athlete biography, event promotion, rules and structure, training, and team history. The model must not conflate "sport" with "football" specifically — the sub-intents should be sport-agnostic and applicable to any sport.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | sport athlete profile | sport athlete profile | Build a visual profile card for any athlete |
| 2 | sport event poster | sport event poster | Create an announcement or event poster for a sporting event |
| 3 | sport rules infographic | sport rules infographic | Explain the rules and structure of a sport visually |
| 4 | sport training guide | sport training guide | Visualize a fitness or training plan for a sport |
| 5 | sport team history timeline | sport team history timeline | Show a team's history, milestones, and achievements over time |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 19 — space

**Query:** space  
**Language:** en  
**Category:** Science / Knowledge  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"space" is a science domain word with strong educational and visual content demand. The five sub-intents span system reference (solar system), biography (astronaut profile), historical narrative (mission timeline), vocabulary learning, and general science education — each a different content type suited to a different template. This query tests whether the model avoids trivializing "space" into purely decorative "space aesthetic" content and instead produces educationally grounded goals.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | solar system infographic | space solar system infographic | Visualize the planets and structure of the solar system |
| 2 | astronaut profile | space astronaut profile | Create a visual profile card for a space explorer or astronaut |
| 3 | space mission timeline | space mission timeline | Trace the history of key space missions and milestones |
| 4 | space vocabulary cards | space vocabulary cards | Build a vocabulary flashcard set around space and astronomy terms |
| 5 | space science poster | space science poster | Create an educational science poster on a space topic |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## Query 20 — history

**Query:** history  
**Language:** en  
**Category:** Knowledge / Academic  
**Competitor review:** PENDING  
**Status:** PENDING

**Why this is a valid broad-query candidate:**  
"history" is the broadest academic domain noun in the eval set. It tests whether the model can decompose a subject-area label into five specific creation artifact types: a timeline poster, a biography profile, a comparative event analysis, a spatial historical map, and an education infographic. These are meaningfully different in both format and purpose. The catalog has strong history content via timeline templates, historical figure profile cards, and comparison infographics.

### Expected sub-intents

| # | label | searchQuery | Distinct user goal |
|---|---|---|---|
| 1 | history timeline poster | history timeline poster | Visualize a sequence of historical events as a timeline |
| 2 | historical figure profile | historical figure profile | Build a visual biography card for a historical person |
| 3 | historical event comparison | historical event comparison | Compare two or more historical events or eras side by side |
| 4 | historical map infographic | historical map infographic | Show a historical territory, route, or region on a visual map |
| 5 | history education poster | history education poster | Create a classroom-ready educational poster on a history topic |

### Actual model output

PENDING — Multi-intent implementation has not been built yet.

### Evaluation

| Criterion | Score (1–3) | Notes |
|---|---|---|
| C1 Relevance | PENDING | |
| C2 Diversity | PENDING | |
| C3 Language consistency | PENDING | |
| C4 Searchability | PENDING | |
| C5 Visual / actionable value | PENDING | |

| Metric | Value |
|---|---|
| Duplicate count | PENDING |
| Average score | PENDING |
| Verdict | **PENDING** |

---

## 7. Final summary table

| # | Query | Language | Category | Gold sub-intent count | Actual output | C1 | C2 | C3 | C4 | C5 | Avg | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 北京 | zh | City / Place | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 2 | wedding | en | Life Event | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 3 | football | en | Sport | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 4 | plants | en | Nature / Lifestyle | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 5 | 日本 | zh | Country / Place | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 6 | 猫 | zh | Animal / Pet | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 7 | anime | en | Entertainment / Culture | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 8 | travel | en | Broad Domain | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 9 | music | en | Arts / Entertainment | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 10 | Christmas | en | Holiday / Seasonal | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 11 | fashion | en | Style / Design | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 12 | coffee | en | Food / Lifestyle | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 13 | 旅行 | zh | Broad Domain | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 14 | dog | en | Animal / Pet | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 15 | paris | en | City / Place | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 16 | love | en | Abstract / Emotion | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 17 | 美食 | zh | Food / Cuisine | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 18 | sport | en | Broad Domain | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 19 | space | en | Science / Knowledge | 5 | PENDING | — | — | — | — | — | — | PENDING |
| 20 | history | en | Knowledge / Academic | 5 | PENDING | — | — | — | — | — | — | PENDING |

**Gold sub-intents total: 100**  
**Queries passing: 0 / 20 (PENDING)**  
**Ship threshold: 16 / 20 PASS required**

---

## 8. Instructions for filling actual model results after implementation

Once `lib/searchMultiIntent.ts` and `/api/search-multi-intent` are implemented (design doc Step 6), follow these steps to complete the eval:

### Step A — Run the model against all 20 queries

For each query, POST to `/api/search-multi-intent` with `{ query, locale }` using the locale matching the query's language (zh for Chinese queries, en for English queries). Record the raw JSON response.

### Step B — Fill in actual model output

In each **Actual model output** section, replace the PENDING placeholder with the model's raw output in this format:

```json
{
  "query": "<query>",
  "subIntents": [
    { "label": "...", "searchQuery": "..." },
    ...
  ]
}
```

### Step C — Score each criterion

For each query, score C1–C5 on the 1–3 scale defined in Section 4. Apply the rubric against the **actual model output**, not the gold labels.

### Step D — Count duplicates

Check whether any two `searchQuery` values in the model output are the same after case-insensitive normalization. Record the count in the Duplicate count row.

### Step E — Compute average and assign verdict

Average = (C1 + C2 + C3 + C4 + C5) / 5

- Average ≥ 2.5 AND duplicate count = 0 → **PASS**
- Average ≥ 2.0 AND < 2.5, OR one minor duplicate → **WARN**
- Average < 2.0, OR two or more duplicates, OR any C3 = 1 → **FAIL**

### Step F — Update the summary table

Fill in the C1–C5 scores, average, and verdict columns in Section 7.

### Step G — Iterate on the system prompt if needed

If fewer than 16 queries receive PASS, return to `lib/searchMultiIntent.ts` and revise the system prompt. Common failure patterns to address:

- **C2 failures (synonyms)**: tighten the "no synonyms" rule with concrete examples in the prompt.
- **C3 failures (language)**: add more explicit language-preservation examples, especially for zh input.
- **C5 failures (transactional)**: add examples of what NOT to generate (booking, live scores, prices).

Re-run all 20 queries after each prompt revision and re-score from scratch.

---

## 9. Competitor review status

Manual review of how Bing Images and Pinterest handle sub-intent decomposition for these 20 queries — to validate that our gold labels reflect real user demand and are not purely hypothetical.

**Status: PENDING for all 20 queries.**

This review should be completed before the implementation goes to production. For each query, check whether the top Bing Images and Pinterest results cluster around the same 4–5 goal dimensions captured in the gold labels. If a major goal dimension visible in competitor results is missing from the gold labels, update the gold labels with a note explaining the change.

| # | Query | Bing Images reviewed | Pinterest reviewed | Notes |
|---|---|---|---|---|
| 1 | 北京 | PENDING | PENDING | |
| 2 | wedding | PENDING | PENDING | |
| 3 | football | PENDING | PENDING | |
| 4 | plants | PENDING | PENDING | |
| 5 | 日本 | PENDING | PENDING | |
| 6 | 猫 | PENDING | PENDING | |
| 7 | anime | PENDING | PENDING | |
| 8 | travel | PENDING | PENDING | |
| 9 | music | PENDING | PENDING | |
| 10 | Christmas | PENDING | PENDING | |
| 11 | fashion | PENDING | PENDING | |
| 12 | coffee | PENDING | PENDING | |
| 13 | 旅行 | PENDING | PENDING | |
| 14 | dog | PENDING | PENDING | |
| 15 | paris | PENDING | PENDING | |
| 16 | love | PENDING | PENDING | |
| 17 | 美食 | PENDING | PENDING | |
| 18 | sport | PENDING | PENDING | |
| 19 | space | PENDING | PENDING | |
| 20 | history | PENDING | PENDING | |

---

_This document is the authoritative gold set for Multi-intent Search V0. Do not modify gold labels after the model implementation begins unless a competitor review finding reveals a materially missing user goal. Record any such change in the Notes column of Section 9._
