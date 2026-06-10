# SEO opportunity — Flashcards / Visual Learning / Kids Subject Batch (2026-06-10)

_Findings + execution log for the KD-data-driven flashcards/kids/learning opportunity surfaced 2026-06-10. Pair with `docs/blog-quality.md` (running status) and `docs/blogs-hub-and-spoke-architecture.md` (interlink pattern)._

_Owner: jay. Last updated: 2026-06-10._

## Source

User-dropped SEMrush KD pull on 22 flashcard / visual-learning / kids / subject queries. Net read: ~14,000 vol/month addressable demand across green-dot + yellow-dot KDs; Curify ranks ~zero today despite owning the template inventory.

## Findings

### Query × KD × Volume × Curify-content map

| Query | KD | Vol | Curify match | Status |
|---|---|---|---|---|
| visual learning | 38 🟡 | **4,400** | `/blog/visual-learning-tools` | T1 retitle |
| picture dictionary | 53 🟠 | 1,600 | (none direct) | SKIP — too hard |
| printable flashcards | 28 🟡 | 1,300 | (would need new) | T3 hub |
| vocabulary flashcards | 35 🟡 | 1,300 | `template-detailed-vocab-flashcard` | T3 hub |
| **Phonics flashcards** | **10 🟢🟢** | 1,000 | `template-CVC-english-word-coloring-flower-card`, `template-children-english-vocab-spelling` | T2 new post — **cheapest dollar/impression** |
| visual dictionary | 37 🟡 | 590 | (would borrow bilingual-vocab template) | T3 (maybe) |
| biology flashcards | 17 🟢 | 480 | `template-species-science`, `template-species`, `template-herbal` | T2 hub spoke |
| chemistry flashcards | 20 🟢 | 480 | `template-science-education-infographic` | T2 hub spoke |
| animal flashcards | 17 🟢 | 390 | `template-species`, `template-mbti-animal`, `template-dog-breed-retro-infographic` | T2 new post |
| flashcards for kids | 31 🟡 | 390 | `/blog/bilingual-ai-flashcards-early-childhood-education` | T1 retitle |
| picture flashcards | 10 🟢 | 390 | (visual-cards family) | Covered by phonics + animal |
| visual vocabulary | 27 🟡 | 320 | (multilingual-vocab-poster, vocabulary templates) | (covered transitively by vocab hub) |
| kindergarten flashcards | 27 🟡 | 260 | (would borrow CVC + children templates) | T3 (kids long-tail) |
| science flashcards | 18 🟢 | 260 | `/blog/weird-science-facts-classroom-engagement` | T1 retitle |
| english flashcards | 40 🟡 | 210 | (multiple english-vocab templates) | T3 |
| language flashcards | 28 🟡 | 210 | (vocab templates) | (covered by vocab hub) |
| preschool flashcards | 35 🟡 | 210 | (would borrow CVC + children templates) | T3 (kids long-tail) |
| esl flashcards | 30 🟡 | 170 | (english-vocab templates) | T3 |
| learning flashcards | 56 🟠 | 170 | n/a | SKIP — too hard |
| plant flashcards | 6 🟢 | 50 | `template-herbal` | T3 micro |
| solar system flashcards | n/a | 40 | (would need new) | T3 micro |
| space flashcards | 14 🟢 | 40 | (would need new) | T3 micro |

### Subject-oriented tier-3 topic inventory (per user, 2026-06-10)

User confirmed Curify already has these tier-3 subject topics — these are the natural anchor for subject-specific flashcard posts. Useful as cross-link surface + hub-and-spoke anchor.

- Animals
- Nature
- Space
- Weather
- Dinosaur & Evolution
- Food & Drink
- Family
- School
- Transportation
- Celebration
- Body
- Emotions

**Gap noted:** Phonics topic was wanted earlier but not added. To register, add `phonics` slug to `lib/topicRegistry.ts` + `messages/en/topics.json` + autotranslate (see `feedback_topic_registration_checklist.md`).

## Strategy

### Tier 1 — Retool existing blogs (cheapest, ship today)

Three existing posts roughly align with bleeder queries — retitle to capture head term, ~30 min per post (title + meta + 9-locale autotranslate + Indexing API).

1. **`visual-learning-tools`** → head term: "visual learning" (KD 38, vol 4,400)
2. **`bilingual-ai-flashcards-early-childhood-education`** → head term: "flashcards for kids" (KD 31, vol 390)
3. **`weird-science-facts-classroom-engagement`** → head term: "science flashcards" (KD 18 🟢, vol 260)

### Tier 2 — New posts (KD-green easy wins)

4. **Phonics flashcards** — KD 10 🟢🟢, vol 1,000 — **highest ROI new post in queue**. Proof: `template-CVC-english-word-coloring-flower-card` + `template-children-english-vocab-spelling`. Also register `phonics` as a new tier-3 topic in `lib/topicRegistry.ts` while writing.
5. **Animal flashcards** — KD 17 🟢, vol 390. Proof: `template-species`, `template-mbti-animal`, `template-dog-breed-retro-infographic`. Cross-link to `/topics/animals`.
6. **Subject Flashcards hub: Biology + Chemistry** — KD 17 + KD 20 🟢, vol 480 each. One post covers both. Proof: `template-species-science`, `template-herbal`, `template-science-education-infographic`. Cross-link to `/topics/nature` + `/topics/body` (anatomy/biology) etc.

### Tier 3 — Hub posts (more work, higher upside)

7. **Vocabulary flashcards hub** — KD 35 🟡, vol 1,300. Anchor on `template-detailed-vocab-flashcard`. Could absorb vocabulary flashcards + visual vocabulary (320) + language flashcards (210) + english flashcards (210) + esl flashcards (170) → ~2,250 combined vol/mo.
8. **Printable flashcards** — KD 28 🟡, vol 1,300. Print-ready angle. Doubles as tool-feature blog if PDF export ships. Defer until print/PDF capability is real.

### SKIP

- picture dictionary (KD 53), learning flashcards (KD 56) — too hard

## Execution log

### Tier 1 retitles — SHIPPED 2026-06-10 commit `6e73d5e8`

- [x] `/blog/visual-learning-tools` — title now: "Visual Learning: AI Tools, Flashcards, and Infographics for Modern Classrooms"
- [x] `/blog/bilingual-ai-flashcards-early-childhood-education` — title now: "Flashcards for Kids: AI Bilingual Vocabulary Templates for Ages 2-5"
- [x] `/blog/weird-science-facts-classroom-engagement` — title now: "Science Flashcards: AI Prompt Templates That Spark Classroom Engagement"
- [x] 9-locale autotranslate fan-out (6 keys × 9 locales = 54 translations)
- [x] Indexing API submit — 30 URLs (3 blogs × 10 locales), 30/30 OK

### Tier 2 new posts (queued)

- [ ] **Phonics flashcards** new post — task #80 — KD 10 🟢🟢, vol 1,000. **Highest-ROI new post in queue.** Also register `phonics` as a new tier-3 topic (`lib/topicRegistry.ts` + `messages/en/topics.json` + autotranslate).
- [ ] **Animal flashcards** new post — task #81 — KD 17 🟢, vol 390. Cross-link to `/topics/animals`.
- [ ] **Biology + Chemistry flashcards hub** — task #82 — KD 17-20 🟢, combined vol 960.

### Tier 3 / longer-term (backlog)

- [ ] **Vocabulary flashcards hub** — task #83 — KD 35 🟡, vol 1,300 + ~950 long-tail (incl. visual vocab, language flashcards, english flashcards, esl flashcards = ~2,250 combined).
- [ ] Printable flashcards (KD 28 🟡, vol 1,300) — gate on PDF export feature.
- [ ] Add `phonics` tier-3 topic registry entry (folded into task #80).

### Measurement

- Check GSC bleeder query CTR + impression movement on 2026-06-17 (7d) and 2026-06-24 (14d):
  - "visual learning" SERP position + impressions on `/blog/visual-learning-tools`
  - "flashcards for kids" → bilingual-flashcards blog
  - "science flashcards" → weird-science blog
- If retitles don't move position, content depth may be needed (not just title).

## Cross-refs

- `docs/blog-quality.md` — master quality status log
- `docs/blog-writing-guidelines.md` — voice + tone reference
- `docs/blogs-hub-and-spoke-architecture.md` — hub pattern for the Tier 3 work
- Memory: `feedback_blog_draft_default_tighter.md` (~1,700w default), `feedback_topic_registration_checklist.md` (tier-3 topic addition), `feedback_indexing_api_all_locales.md` (10-locale submission rule)
