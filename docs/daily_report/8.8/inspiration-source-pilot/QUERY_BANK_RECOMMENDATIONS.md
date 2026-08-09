# Query Bank Recommendation — C3

Phase C3, Part 4. Built entirely from C1 evidence (`QUERY_326_AUDIT.csv`,
`QUERY_COVERAGE_REPORT.md`) and C2 evidence (`SOURCE_DISCOVERY_PROGRESS.csv`,
`SOURCE_DISCOVERY_FINDINGS.md`, `SUPPLEMENTARY_QUERY_GAPS.md`). The
authoritative 326-query bank (`QUERY_326_AUDIT.csv`) is **not** edited or
replaced here. Every additional query mentioned below is explicitly tagged
`PROPOSED_NEW_QUERY` and carries no approval status.

**AUTHORITATIVE_326** = the existing, unmodified 326-row query bank.
**PROPOSED_SUPPLEMENT** = candidate additions from `SUPPLEMENTARY_QUERY_GAPS.md`,
none of which entered the C2 pilot and none of which are approved.

---

## Is the 326-query bank sufficient? — Not a single yes/no

The answer differs sharply by domain. Two domains (merch, and to a lesser
extent education/ecommerce) have real breadth; two domains (brand_logo,
packaging) are narrow or skewed **despite both producing excellent pilot
source-quality results on the 4 queries tested** — meaning the query bank's
weakness in those two domains is a *breadth* problem, not a *demonstrated
source-discoverability* problem. See per-domain sections below.

---

## MERCH

| metric | value |
|---|---|
| raw query count | 82 (AUTHORITATIVE_326) |
| distinct sub-intent breadth | 36 distinct subdomains; deepest of the 5 domains |
| known redundancy | None — 100% KEEP, no MERGE/REVIEW rows |
| known missing areas | Apparel-as-merch (T-shirts, hoodies), broader home/lifestyle merch beyond mug/pillow, NFT/digital-collectible adjacent, seasonal/holiday-themed merch |
| pilot-source quality | V004 ("figure"): 5/5 candidates, 2A/3B. V014 ("sticker"): 5/5 candidates, 2A/3B (incl. a real UNHCR institutional client and an independently-verified creator-commerce site) |
| **recommendation** | **SUFFICIENT_FOR_NEXT_PILOT** |

Merch is the strongest domain by both breadth (82 rows / 36 subdomains) and
demonstrated pilot performance (both tested queries hit the full 5-candidate
target with a majority A/B grade split, zero C or REJECT). The one real gap —
apparel-as-merch — is a genuine missing category but does not block scaling
the *existing* query set further; it is a secondary supplement, not a
blocker.

---

## ECOMMERCE

| metric | value |
|---|---|
| raw query count | 66 (58 KEEP / 4 MERGE / 4 REVIEW, AUTHORITATIVE_326) |
| distinct sub-intent breadth | Moderate — heavily concentrated in banners/posters (28 raw rows across 14 banner subdomains before merge) plus product photography basics |
| known redundancy | ecommerce-banner/online-store-banner merged; `promotion`(V175/176) and `advertisement`(V177/178) flagged REVIEW as too abstract to be single visual targets |
| known missing areas | Product-listing-page composition as a set (hero + lifestyle + size chart), marketplace-specific formats (Amazon A+, Shopify collection banner), livestream-commerce, email-marketing creative, mobile-app storefront UI |
| pilot-source quality | V174 ("product photo"): 5/5 candidates, 2A/2B/1C. V216 ("influencer post"): only 4/5 candidates, 3B/1C — the domain's own pilot surfaced a real weak spot |
| **recommendation** | **USABLE_BUT_IMBALANCED** |

The banner/poster family so dominates the raw query count that
template-supply effort would skew disproportionately there if queries were
run in proportion to volume. More importantly, the pilot itself
demonstrated (not merely predicted) that V216-shaped queries
(influencer/UGC/social-commerce content) underperform on Behance — this is
empirical evidence of imbalance, not a hypothesis: native UGC content lives
on Instagram/TikTok/Xiaohongshu, and Behance results for it skewed toward
video-ad case studies or generic templates rather than documented real
campaigns.

---

## EDUCATION

| metric | value |
|---|---|
| raw query count | 80 (AUTHORITATIVE_326) |
| distinct sub-intent breadth | 33 distinct subdomains — deep K-12 coverage (flashcards ×6, worksheets ×5, charts ×7, certificates ×4) |
| known redundancy | None — 100% KEEP, cleanest domain in the set, no cross-domain leakage |
| known missing areas | Higher-ed/university content (no syllabus, academic/research poster, thesis cover), STEM lab-report/rubric queries, e-learning/online-course UI assets, early-childhood non-flashcard formats (story book page, coloring page), language-learning-specific material |
| pilot-source quality | V248 ("flashcard"): only 4/5 candidates, all B grade. V260 ("certificate"): only 4/5 candidates, 1A/3B (one B being a real Anthropic-issued credential) — both tested queries landed below the 5-candidate target |
| **recommendation** | **USABLE_BUT_IMBALANCED** |

Education has the deepest K-12 breadth of any domain by row count, but both
of its pilot queries independently landed at 4 candidates rather than 5
because a meaningful fraction of Behance results were low-engagement,
generic template listings with no extractable distinguishing detail
(`SOURCE_DISCOVERY_FINDINGS.md` §14). This is a real, evidenced signal that
K-12 flashcard/certificate queries — despite deep *query-bank* coverage —
may need either query refinement or a second discovery surface, and the
entirely-untested higher-ed/e-learning territory is a wide open gap.

---

## BRAND_LOGO — particular scrutiny per task instruction

| metric | value |
|---|---|
| raw query count | 10 (8 KEEP / 2 MERGE, AUTHORITATIVE_326) — smallest of the 5 domains by far |
| distinct sub-intent breadth | Only **4 distinct concepts** after merge: logo, business card, branded stationery/envelope, storefront signage |
| known redundancy | 2 MERGE rows (storefront sign → shop sign) |
| known missing areas | Extensive: wordmark-specific query, brand style guide/guidelines document, brand mascot, letterhead, social-media profile/cover kit, favicon/app-icon, rebrand before/after comparison — none of these exist in any form |
| pilot-source quality | V084 ("logo"): 5/5 candidates, **3A/2B** — the strongest A-concentration of any pilot query. V094 ("business card"): 5/5 candidates, **4A/1B**, including two independently-verified real businesses |
| **recommendation** | **NEEDS_SUPPLEMENT** |

This is the paradox this domain requires making explicit: **the 2 existing
brand_logo queries produced the single best source-quality results in the
entire 10-query pilot** (7 of 10 candidates A-grade, real verified agency
and cafe clients, the strongest tested expansion chain of the domain set).
The problem is not query *quality* — it is query *breadth*. With only 4
concepts total, brand_logo cannot support a pilot larger than the 2 queries
already run without new queries; there is nothing else in the 326-bank left
to test for this domain. `NEEDS_SUPPLEMENT`, not `INSUFFICIENT`, because the
demonstrated discoverability is excellent — the bank itself is just too
small to scale from.

**PROPOSED_SUPPLEMENT** candidates (from `SUPPLEMENTARY_QUERY_GAPS.md`, none
approved, none used in C2): `PROPOSED_NEW_QUERY: wordmark logo`,
`PROPOSED_NEW_QUERY: brand style guide`/`brand guidelines document`,
`PROPOSED_NEW_QUERY: brand mascot design`, `PROPOSED_NEW_QUERY: letterhead design`,
`PROPOSED_NEW_QUERY: social media profile kit`/`brand cover kit`,
`PROPOSED_NEW_QUERY: favicon / app icon design`, `PROPOSED_NEW_QUERY: rebrand before/after`.

---

## PACKAGING — particular scrutiny per task instruction

| metric | value |
|---|---|
| raw query count | 66 (AUTHORITATIVE_326) — high count, but **borrowed, not purpose-built** (no dedicated original scenario; all 66 harvested from `brand_business`) |
| distinct sub-intent breadth | Skewed — 40 of 66 rows (~61%) are food/beverage + cosmetic packaging; no other vertical comes close |
| known redundancy | None flagged (no MERGE/REVIEW rows), but generic-noun-only phrasing even within its strong verticals (e.g. "cosmetic package" rather than "jar"/"pump bottle"/"sachet") |
| known missing areas | Toy packaging, electronics packaging, supplement/nutraceutical, apparel/textile, shipping/mailer, nearly all format-specific phrasing, mockup/die-line presentation queries |
| pilot-source quality | V098 ("coffee package"): 5/5 candidates, **4A/1B**, incl. a real award-winning roastery and a real KakaoBank institutional case. V120 ("gift box"): 5/5 candidates, **4A/1B**, incl. real Edifier and real Xiaohongshu institutional clients |
| **recommendation** | **NEEDS_SUPPLEMENT** |

Same paradox as brand_logo: **both tested packaging queries produced 8 of
10 A-grade candidates** — the second-best result in the pilot after
brand_logo. But the query bank's coverage is real-but-borrowed and skewed
61% toward two verticals, with several major categories (toy, electronics,
supplement, apparel, shipping) entirely untested. Notably, two gap
categories — electronics packaging and kraft/eco-material packaging —
**appeared organically** among the strongest V098/V120 candidates (Edifier,
the Xiaohongshu campus gift box) despite no query targeting them directly,
which is empirical evidence that real discoverable supply exists ahead of
query-bank coverage for these verticals specifically.

**PROPOSED_SUPPLEMENT** candidates (from `SUPPLEMENTARY_QUERY_GAPS.md`, none
approved, none used in C2): `PROPOSED_NEW_QUERY: toy packaging`/`blister pack`/`window box`,
`PROPOSED_NEW_QUERY: electronics packaging`,
`PROPOSED_NEW_QUERY: supplement / nutraceutical packaging`,
`PROPOSED_NEW_QUERY: apparel / textile packaging`,
`PROPOSED_NEW_QUERY: shipping / mailer packaging`,
`PROPOSED_NEW_QUERY: stand-up pouch`/`pump bottle`/`sachet`/`tube packaging`,
`PROPOSED_NEW_QUERY: sustainable / eco packaging`/`kraft packaging`,
`PROPOSED_NEW_QUERY: packaging mockup`/`die-line`/`flat lay packaging`.

---

## Summary table

| domain | status | why |
|---|---|---|
| merch | SUFFICIENT_FOR_NEXT_PILOT | Deep breadth + both pilot queries hit target with strong grades |
| ecommerce | USABLE_BUT_IMBALANCED | Deep in banners/posters, thin in marketplace/UGC formats; pilot itself showed a real weak spot (V216) |
| education | USABLE_BUT_IMBALANCED | Deep K-12 breadth, but both pilot queries landed below target (4/5) and higher-ed/e-learning is entirely untested |
| brand_logo | NEEDS_SUPPLEMENT | Only 4 concepts total despite excellent (best-in-pilot) source quality on both tested queries |
| packaging | NEEDS_SUPPLEMENT | Skewed 61% to 2 verticals despite excellent (second-best) source quality on both tested queries |

**No domain was rated `INSUFFICIENT`** — every domain's tested queries
produced usable, real, professionally-sourced candidates. The two
`NEEDS_SUPPLEMENT` domains need more *queries*, not a different discovery
methodology — the methodology (Behance search → project page → creator
profile) is proven to work on the queries these domains do have.
