# Demo Storyboard — Education

**Status:** Proposed Curify demo flow. Not a final video. Built almost
entirely on Curify's own confirmed baseline (`VIDEO_CONFIRMED`:
story/episode → word cards → reading & translation → quiz → character map →
full learning pack — "Turn any story into a full learning pack"). No
`MANAGER_MEETING_CONFIRMED` detail exists for this domain.

**Important evidence caveat, carried through every scene below:** the
external EDU-01 case (`education_001`) is rated **PARTIAL** in B2 — it
documents the *learner-facing weekly content-delivery sequence* of a real
product, not that product's *internal production process*. This storyboard
therefore leans on EDU-01 only for two things it can actually support: (a)
direct confirmation that "story" and "word cards" are real, validated
patterns, and (b) three directly-quoted pedagogical *principles* (not
production steps) that can reasonably refine how Curify's own existing
steps are built. It does **not** import EDU-01's live-teacher-video,
WeChat-community, or simulated-phone-call features — those are learner-
facing delivery infrastructure fundamentally different from Curify's
asset-generation model, and importing them from a PARTIAL, non-production
source would overreach the evidence. See
`CURIFY_WORKFLOW_RECOMMENDATIONS.md` §Education for the full reasoning.

| # | SCENE | USER_INPUT | CURIFY_ACTION | VISIBLE_OUTPUT | WHY_THIS_STEP_MATTERS | SOURCE_OF_WORKFLOW_IDEA | EVIDENCE_CONFIDENCE | TAG |
|---|---|---|---|---|---|---|---|---|
| 1 | Any story, one input | A short prompt or theme (e.g., "a story about a lost puppy finding home") | Generate a short illustrated story/episode embedding target vocabulary | A story panel / storyboard frame with narrated text | Establishes Curify's own stated hook: "turn any story into a full learning pack" | `VIDEO_CONFIRMED` baseline step 1 | HIGH | EVIDENCE_BACKED |
| 2 | Word cards, right-sized | (none — automatic) | Extract target vocabulary from the story and generate illustrated, audio-enabled word cards, capped to a small age-appropriate set (not a long list) | 3–5 word cards (not 15) | Directly matches Curify's own "word cards" step by name and content — independently confirmed as a real pattern in a live commercial product. The *count cap* is a proposed refinement inspired by a well-quoted pedagogical principle (children aged 3–7 have short-term memory capacity of only "3±2" chunks), not a claim that the source describes Curify's product | `VIDEO_CONFIRMED` word-cards step, refined by `education_001` pc_01 (`EXTERNAL_SOURCE_CONFIRMED` principle; case overall PARTIAL) | MEDIUM | PRODUCT_PROPOSAL |
| 3 | Reading & translation | (none — automatic) | Generate an illustrated reading passage with translation | A picture-book-style page: illustrated scene, target-language text plus translation | Matches Curify's own stated step directly; no external modification proposed here | `VIDEO_CONFIRMED` baseline step 3 | HIGH | EVIDENCE_BACKED |
| 4 | A quiz that checks three things, not one | (none — automatic) | Generate a quiz that tests each word across three separate dimensions: pronunciation, meaning, and written form | A quiz screen showing three distinct question types for one word, rather than a single combined question | A directly-quoted, well-evidenced professional principle for *how* a quiz should be structured — genuinely new refinement to an existing baseline step, not a production-process claim, so it survives EDU-01's PARTIAL rating | `VIDEO_CONFIRMED` quiz step, refined by `education_001` step_04_quiz (`EXTERNAL_SOURCE_CONFIRMED` principle) | MEDIUM-HIGH | EVIDENCE_BACKED |
| 5 | Character map | (none — automatic) | Generate a visual relationship map of the story's characters and vocabulary | A character-map graphic connecting characters to the words/concepts they carry | Matches Curify's own stated step directly; no external modification proposed | `VIDEO_CONFIRMED` baseline step 5 | HIGH | EVIDENCE_BACKED |
| 6 | Full learning pack, ready to use | (none — automatic) | Bundle the story, word cards, reading page, quiz, and character map into one export | "Full Learning Pack" screen showing all five assets | The payoff scene, matching Curify's own stated framing exactly: "Turn any story into a full learning pack" | `VIDEO_CONFIRMED` | HIGH | EVIDENCE_BACKED |

**Scenes deliberately not included:** a simulated live-teacher review call
("Zebra Call"), daily human-teacher pronunciation videos, and
community/homework-feedback loops from EDU-01. These are human-operated,
live-delivery features from a different product category (real-time
interactive video) than Curify's packaged-asset-generation model, and
EDU-01's PARTIAL, learner-facing-only evidence status is not strong enough
to justify importing them into a product demo. Flagged in
`WORKFLOW_GAP_MATRIX.csv` as `HYPOTHESIS_REQUIRING_BETTER_SOURCE`, not as
confirmed findings.
