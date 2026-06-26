# Wedge 1 — Indexation rescue: scope + plan

> 2026-06-26. Follows from `docs/seo-funnel-audit-2026-06-26.md`. **22,299 of 25,764 sitemap URLs (87%) get zero Google impressions in 28d.** This doc scopes the link-injection plan to make 25-50% of those visible over 8-12 weeks.

## Current internal-link matrix

What links to what (✓ = has links, ✗ = none):

| Page family (sitemap count, % indexed) | Home | Blog | Topics | Tpl-Index | Tpl-Example | Banana | Tools | Use-Cases | Tag |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Homepage** | — | ✗ | **✗** | ✗ | ✗ | ✗ | ~5 | ✗ | ✗ |
| **Blog (960, 45%)** | ✓ | ~3 | ✗ | ~20 | ~50 | ✗ | ✗ | ✗ | ✗ |
| **Topics (1,740, 17%)** | ✓ | ~6 | — | ~30-100 | many | ~10 | ✗ | ✗ | ✓ |
| **Tpl-Index (514, 70%)** | ✓ | ✗ | ~5 | — | ~20 | ✗ | ✗ | ✗ | ✓ |
| **Tpl-Example (17,650, 15%)** | ✓ | ✗ | ~10 | parent | — | ✗ | ✗ | ✗ | rare |
| **Banana (4,610, 24%)** | ✓ | ✗ | ✗ | 30 | ✗ | — | ✗ | ✗ | 12 |
| **Tools (100, 65%)** | ✓ | 3 | ✗ | ✗ | ✗ | ✗ | 3 sibs | 3 | ✗ |
| **Use-Cases (100, 10%)** | ✓ | ✗ | ✗ | 30 | filtered | ✗ | ✗ | — | ✗ |

(Source: Explore agent audit of 9 page templates. Counts approximate; full citations in audit notes.)

## The 5 structural gaps that explain 87% invisibility

1. **Home → Topics is missing entirely.** Homepage has zero links to `/topics/*`. 1,740 topic URLs, 17% indexed. This is the single biggest discoverability hole. Topic hubs are only reachable from blog cross-links or direct search.
2. **Use-cases are isolated.** 100 URLs, 10% indexed, 0 clicks. Tools link FROM use-cases via personas, but use-cases have no outbound links to tools/topics/blogs, and no link comes FROM home or tools landing.
3. **Example pages (17,650 URLs) are dead-ends.** They link back to parent template + similar examples, but never up the funnel to topics/tools/blogs that could earn them authority.
4. **Blog ↔ Topic is uni-directional.** Topics curate ~6 blogs each; blogs almost never link back to their topic. Blog authority (76% of all clicks) never flows to topic hubs.
5. **Nano-banana prompts (4,610 URLs) never reach tools.** They link to template indexes and tag pages but not to `/tools/*` — even when the prompt's tags clearly map to a tool (subtitle, translation, image enhancement).

## Plan: 7 work items, ranked by expected click lift

### W1.7 — Technical hygiene pre-audit *(do FIRST, 1 day)*

Before pumping links at 22k invisible pages, verify they're not technically blocked. Sample 50 URLs from each invisible family, HEAD-check for:
- `noindex` meta or `X-Robots-Tag: noindex` header
- `<link rel="canonical">` pointing elsewhere
- 4xx/5xx responses
- `Disallow:` rules in robots.ts that incidentally cover the path

If >10% have a blocker, fix that BEFORE link-injection (otherwise we waste authority). Expected: most pages will be fine; the topic_hub and example families are large enough that even a 5% rate is worth catching.

**Effort:** 1 day. **Files:** ad-hoc script `scripts/sample_invisible_pages.cjs`. **Validation:** sampled-URL canonical/noindex report.

### W1.1 — Homepage → Topics chip row *(highest single lift, 1-2 days)*

The single biggest leverage point. Surface a `<TopicChipsRow>` on the homepage linking to the top 30-50 topic hubs by template inventory × SEMrush KD volume. Use the existing `getTopicNavList()` from `lib/topicRegistry.ts:131` (already callable). Mirror the existing `TopicNavRow.tsx:119-155` chip pattern.

**Selection rule:** tier-1 topics from `lib/taxonomy.json` (10) + tier-2 (10) + top-30 tier-3 by template count. Don't surface ALL 174 topics from home — dilutes authority.

**Effort:** 1-2 days. **Files:** new `app/[locale]/_components/HomeTopicChipsRow.tsx`, edit `app/[locale]/(public)/page.tsx`. **Expected lift:** +200-500 clicks/day in 4-8 weeks (re-crawl window).

### W1.2 — Example page → Related topics row *(biggest tonnage, 1-2 days)*

17,650 example URLs × 3-5 topic chips each = **53k-88k new internal links pointing AT `/topics/*`.** Massive authority injection.

**Implementation:** existing example page template already imports topic data (it renders the merged topic row at top per the agent report). Add a "Related topics" 3-5-chip mini-row at bottom of example page using parent template's tier-1/2/3 topics from `taxonomy.json`. Reuse `TopicNavRow`.

**Effort:** 1-2 days. **Files:** edit `app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/page.tsx`. **Expected lift:** +300-700 clicks/day — boosts BOTH topic_hub indexation AND the example pages themselves (currently 15% indexed).

### W1.3 — Blog → Topic + Blog → Tools sidebar *(2-3 days)*

960 blog URLs each gain (a) 1-2 topic links matching the post's subject + (b) 1-2 tool links for cross-sell. Channels the blog family's 76% click share INTO the dead families.

**Implementation:** extend `app/[locale]/(public)/blog/[slug]/utils/blog-config.ts` with two new optional fields per blog: `relatedTopicIds?: string[]` and `relatedToolSlugs?: string[]`. Render a sidebar/footer row from `app/[locale]/(public)/blog/[slug]/page.tsx`. For unmapped blogs, derive a default topic from `category`.

**Effort:** 2-3 days incl. mapping the 50+ live blogs. **Files:** `blog-config.ts`, `blog/[slug]/page.tsx`. **Expected lift:** +200-500 clicks/day.

### W1.4 — Use-case discovery surfaces *(1 day, but lifts dead family)*

100 URLs at 10% coverage. Currently 0 clicks. Mostly a discoverability problem — content/templates already wired correctly per the audit.

**Implementation:** (a) add a `UseCaseChipsRow` to homepage (linking to all 10 personas — only 10 use-cases ship live currently per memory `feedback_tool_ship_persona_remapping.md`), (b) ensure tool detail page already renders `UseCaseChipsRow` (it does, per audit; verify).

**Effort:** 1 day. **Files:** new `HomeUseCasesRow.tsx`, edit `app/[locale]/(public)/page.tsx`. **Expected lift:** small in absolute terms (10 pages) but unblocks a structurally-dead family for future expansion.

### W1.5 — Nano-banana prompt → Tools CTA *(1-2 days)*

4,610 prompt detail URLs. Each prompt has tags that often map to a tool (e.g. `subtitle` → `/tools/bilingual-subtitles`). Each prompt gets one "Try this prompt in [tool]" CTA link.

**Implementation:** tag-to-tool mapping table (10-20 entries covers ~80% of prompts). Render one CTA card on `nano-banana-pro-prompts/[id]/page.tsx`. Default to `/tools/` index if no mapping.

**Effort:** 1-2 days. **Files:** new mapping in `lib/` or extend an existing tools registry, edit prompt page. **Expected lift:** indirect — boosts tool authority + creates a discovery path. Also compounds with task #103 (unblock AI assistant crawlers) when shipped.

### W1.6 — Targeted Indexing API resubmission *(1 day, after W1.1-W1.5 ship)*

After link-injection ships and propagates (~1 week for the build + first crawl), batch-submit the top 200-500 highest-value invisible URLs via `scripts/submit_indexing_api.cjs`. Priority order:
1. Tier-1 topic hubs (10 URLs × 10 locales = 100)
2. Top-30 tier-3 topics surfaced from home (300 URLs × 10 locales = 3,000 — paginate the submissions)
3. Live use-case pages (10 × 10 = 100)
4. Top-50 tool pages

Hold off on examples (17k) and banana prompts (4.6k) — let natural crawl pick those up via the new internal links rather than burning Indexing API quota.

**Effort:** 1 day to script the batch. **Files:** small wrapper script over `submit_indexing_api.cjs`. **Expected:** accelerates re-crawl by ~3-5 weeks for the priority cohort.

## Sequencing + total effort

```
Week 1:  W1.7 (hygiene audit)              ─┐
         W1.1 (home → topics row)          ─┤  ship as PR-1
         W1.4 (use-case discovery)         ─┘
Week 2:  W1.2 (example → topics row)       ─── ship as PR-2 (biggest tonnage)
Week 3:  W1.3 (blog → topic + tool sidebar) ─── ship as PR-3 (per-blog mapping work)
Week 4:  W1.5 (prompt → tool CTA)          ─── ship as PR-4
Week 5:  W1.6 (Indexing API batch)         ─── after PR-1 has 1+ week in prod
```

**Total: 9-12 dev days over 4-5 calendar weeks.**

## Expected lift, validated against measurement

If link-injection works as designed and re-crawl happens at typical pace:

| Wedge | Direct lift | Re-crawl window |
|---|---:|---|
| W1.1 home → topics | +200-500 / day | 4-8 weeks |
| W1.2 example → topics | +300-700 / day | 6-10 weeks |
| W1.3 blog → topics + tools | +200-500 / day | 4-8 weeks |
| W1.4 use-case surfaces | +20-80 / day | 4-8 weeks |
| W1.5 banana → tools | +50-150 / day | 4-8 weeks |
| **Total** | **+770-1,930 / day** | full payoff by ~8 weeks |

**Stacked on current 213/day → projected 1,000-2,150/day in 8 weeks.** Below the 10k/day target but ~5-10× the current baseline — confirms the audit conclusion that indexation rescue alone gets us to thousands, not tens of thousands.

## Validation checkpoints

| Date | Check | Source |
|---|---|---|
| 2026-07-10 (W2) | PR-1 + PR-2 shipped; GSC `Pages-all.csv` shows >500 newly-impressed topic_hub URLs | `audit_gsc_full.cjs` |
| 2026-07-24 (W4) | PR-3 + PR-4 shipped; topic_hub coverage from 17% → 30%+ | re-run `seo_funnel_audit.py` |
| 2026-08-21 (W8) | Full re-audit. Target: ≥1,000 sitemap URLs newly indexed; ≥+400 clicks/day on baseline | full audit re-run |
| 2026-09-21 (W12) | Either we're at +1,000-2,000 clicks/day baseline → Wedge 1 successful, move to Wedge 2 (event playbook). OR we're flat → indexation cap is structural (likely thin-content classifier), pivot focus to authority-building. | full audit |

## Risks + caveats

- **Helpful Content classifier risk.** Pumping 50k+ chips at a thin topic page can backfire. Mitigation: keep chip rows under 8 links per page, ensure each chip lands on a topic with ≥3 templates (so it's not a thin destination). Re-run a sample crawl 4 weeks after PR-1 to confirm topic hubs aren't getting *worse*.
- **Re-crawl is not instant.** Google may take 2-12 weeks to re-discover and reweight pages. The lift estimates assume normal crawl rates; sites under crawl-budget constraints (which Curify isn't, but worth noting) take longer.
- **The 1.2 clicks/page-mo math assumes new visibility produces clicks at our blended CTR.** Newly-indexed pages typically rank lower than mature pages (sandboxing). Realistic CTR for re-emerged pages is 50-70% of blended for the first 6-12 weeks.
- **W1.2 is the highest-tonnage / highest-risk wedge.** 53k-88k new internal links is significant. If executed poorly (e.g. all 17k examples linking to the same 5 topics, creating Pagerank loops), it could *hurt* topic hubs. Mitigation: spread links across all tier-1/2/3 topics in proportion to template membership.

## Open decisions before kickoff

1. **W1.1: which topics get surfaced from home?** Tier-1 + tier-2 + top tier-3 by inventory (~50 total) is my default. Alternative: only Tier-1 + Tier-2 (~20). Tighter is safer; wider is more aggressive. Recommend the 50-list.
2. **W1.3: do we manually curate per-blog mappings, or auto-derive from `category` + body content?** Hybrid: auto-derive defaults, allow per-blog override in `blog-config.ts`. ~50 blogs to map manually (1 day of mapping work).
3. **W1.6: aggressive Indexing API push vs conservative?** Indexing API has a 200/day quota per project. Recommend submitting top 200 priority URLs/day for 3-5 days = 600-1,000 priority URLs. Keep quota in reserve for ad-hoc rescue cases.
