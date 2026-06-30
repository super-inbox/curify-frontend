# Operator Onboarding Runbook

_Last updated: 2026-06-23. Owner: jay. Update when a new common workflow lands or when a prereq tool / access grant changes._

## Why this doc exists

A new team member with `.env.local` in hand still cannot complete the
content / generation / ingest / CDN loop end-to-end without missing
pieces (GCS auth, repo clones, gcloud SDK, etc.). This doc is the
**single starting point** — covers the prerequisites, the env vars, and
the recurring operator workflows, with hand-offs to the deeper per-
workflow runbooks.

It is the operational sibling of [`docs/search-and-content.md`](./search-and-content.md),
which holds the strategic + priority view across the four content
threads. Use that doc to understand WHY we run these workflows; use
this doc to learn HOW to run them. Each section links back to the
relevant `search-and-content.md` thread.

---

## 1. Prerequisites — what you need before any workflow runs

### Tools

| Tool | Minimum version | Why |
| --- | --- | --- |
| Node.js | ≥ 20 | Most gen / sync scripts (`scripts/*.cjs`) |
| Python | ≥ 3.9 | Daily-drop scripts, i18n autotranslate orchestration, ad-hoc admin SQL pulls |
| `gcloud` SDK + `gsutil` | latest | CDN sync (`scripts/sync_large_assets.sh` → `gs://curify-static`) |
| `git` | ≥ 2.30 | All commit / push / cherry-pick |
| Python `openai` package | latest | LLM tagging / autotranslate scripts (`pip install openai`) |
| Python `asyncpg` package | latest | Admin SQL pulls + ad-hoc DB checks (`pip install asyncpg`) |
| Python `Pillow` | latest | Watermark / preview helpers (already in the backend venv at `~/curify-studio/curify_background/.venv/`) |

### Repo clones

| Repo | Path used by scripts | Purpose |
| --- | --- | --- |
| `super-inbox/curify-frontend` | (this repo) | Templates, inspirations, search, frontend, gen + sync scripts |
| `super-inbox/curify-gallery` | `~/curify-gallery/` | Source images for the daily content drop (`daily_inspirations/<MonthName>_<DD>/`) |
| `super-inbox/curify-studio` | `~/curify-studio/` | Backend (`curify_background/`), admin portal, GTM tools, cross-repo scripts |

Some scripts hard-code these paths (e.g. `scripts/sync_nano_inspiration.cjs` defaults `SOURCE_DIR=/Users/qqwjq/curify-gallery/daily_inspirations/`). Override with `--source=…` if your local layout differs.

### Access grants (request from an org admin)

| Grant | Used by | How to verify |
| --- | --- | --- |
| GCS write on `gs://curify-static` | `scripts/sync_large_assets.sh` (CDN sync step) | `gsutil ls gs://curify-static` returns without permission denied |
| Supabase Postgres read/write (via shared `DATABASE_URL`) | `--supabase` ingest in `scripts/sync_nano_inspiration.cjs`, snapshot pulls, manual credit grants | `~/curify-studio/curify_background/.venv/bin/python -c "import asyncpg, asyncio, os; asyncio.run(asyncpg.connect(os.environ['DATABASE_URL']).close())"` connects |
| GitHub repo write on `super-inbox/curify-frontend` | Operator commits via your user; cron commits use the org bot app | `git push` works without 403 |
| (CI only) `BOT_APP_ID` + `BOT_APP_PRIVATE_KEY` | The bot that writes back from cron workflows (`sync_nanoprompts_to_redis.yml`, `update-nano-template-rankscore.yml`) | Already in GitHub Actions secrets — operators don't need a local copy |
| Azure Redis access (host + password) | Backend Redis sync of nano prompts | `REDIS_PASSWORD` in GH Actions secrets; not used from local |
| Curify product login with credits | UI-driven gen of one-off image2image examples, gallery remix testing | Log in at curify-ai.com; balance > 10 credits |

### `.env.local` keys actually consumed by scripts

These are loaded automatically by every script that needs them. Don't commit `.env.local` to the repo.

```
GEMINI_API_KEY            # nano-banana-pro-image-preview gen
OPENAI_API_KEY            # auto-tag (gpt-4o-mini) + i18n autotranslate
DATABASE_URL              # admin SQL pulls + --supabase ingest
NEXT_PUBLIC_API_URL       # backend URL the snapshot script hits
NEXT_PUBLIC_SITE_URL      # absolute URL building (SEO + sharing)
```

---

## 2. Common operator workflows

Each workflow has a deeper per-workflow runbook linked. This section is a launch pad — high-level steps + commands so a new joiner can complete each loop end-to-end on their first day.

### 2.1 Daily content drop (`hongjie28-patch-N`)

**Frequency:** ad-hoc, whenever the upstream content collaborator pushes a new patch branch. Most days during active content production.

**What it does:** ingest the new templates + example images from a `hongjie28-patch-N` branch on `super-inbox/curify-frontend`, plus the matching image assets in `~/curify-gallery/daily_inspirations/<Month>_<DD>/`.

**Cross-reference:** [`search-and-content.md` § Thread c — Content production + daily drop](./search-and-content.md#thread-c--content-production--daily-drop).

Steps (~10-15 min):

1. **Fetch + identify new templates.** `git fetch origin && git ls-remote origin | grep hongjie` to confirm the branch exists. Run `python3 scripts/extract_hongjie28_patch2_2026-06-20.py` (or a copy of it dated to today) — it brace-tracks per-template extraction so unescaped interior quotes and `parameters`-as-dict don't crash JSON parse.
2. **Backfill `topics[]`** on the new templates (the patches ship `topics: null` often — without it, auto-tag skips and the topic page shows them as untagged). Hand-pick using existing taxonomy slugs.
3. **Sync image assets + ingest.** `node scripts/sync_nano_inspiration.cjs --source=/Users/qqwjq/curify-gallery/daily_inspirations/<Month>_<DD> --supabase --auto-tag` — watermarks, generates previews, ingests into `nano_inspiration.json` + Supabase, runs auto-tag.
4. **Hand-tag inspirations** if auto-tag didn't fire (it skips templates with no T1 ancestor topic, even after backfill — has a known race with same-run ingestion).
5. **Add 10-locale i18n** for the new templates by copying `scripts/add_hongjie28_patch2_2026-06-XX_i18n.py` from a recent date and editing the `EN` block.
6. **CDN sync.** `bash scripts/sync_large_assets.sh` pushes new images to `gs://curify-static`.
7. **Commit + push** the diff to `jwang/vercel` (or current working branch).
8. **Delete the consumed remote branch.** `git push origin --delete hongjie28-patch-N`.

**Gotchas captured in memory (read before first run):**
- `feedback_hongjie_patch_branches.md` — never merge the branch, cherry-pick the diff and delete.
- `feedback_daily_drop_i18n.md` — i18n must be in the same workflow, never a follow-up.
- `feedback_daily_drop_rank_score.md` — backfill `rank_score: 90` if patch omits it.
- `feedback_auto_tag_client_shape.md` — `tryBuildOpenAIClient()` returns `{client}`; destructure or autotag silently fails.

### 2.2 Batch generation (config-driven)

**Frequency:** as needed for content packs, gap fills, or pilot batches.

**Runbook:** [`docs/batch-generation.md`](./batch-generation.md) (the deep doc — config format, flags, recent batches).

**Cross-reference:** [`search-and-content.md` § Thread c](./search-and-content.md#thread-c--content-production--daily-drop) + the "3D content gap matrix" section.

Quickref:

```bash
# 1. Write a config at scripts/configs/<batch-name>.json
# 2. Dry-run to validate
node scripts/generate_template_examples.cjs --config=scripts/configs/<name>.json --dry-run
# 3. Real run (gen + watermark + preview + auto-tag + search_aliases + ingest)
node scripts/generate_template_examples.cjs --config=scripts/configs/<name>.json
# 4. CDN sync
bash scripts/sync_large_assets.sh
# 5. Commit + push
```

### 2.3 WC daily recap (manual paste-and-ship)

**Frequency:** daily during the World Cup window (2026-06-15 → ~2026-07-19).

**Input template:** [`scripts/configs/wc_daily_recap_input_TEMPLATE.md`](../scripts/configs/wc_daily_recap_input_TEMPLATE.md).

**Cross-reference:** [`search-and-content.md` § 2026-06-03 — World Cup expansion plan](./search-and-content.md#2026-06-03--world-cup-expansion-plan).

Steps (~10 min):

1. Operator pastes yesterday's match results + scorers + golden boot + tournament total (5-min ESPN / BBC Sport lookup).
2. Build a one-entry config like `scripts/configs/wc_daily_recap_<YYYY-MM-DD>.json` with `template_id: "template-wc-daily-recap-poster"` and the full `wc_daily_data` string.
3. Run `node scripts/generate_template_examples.cjs --config=scripts/configs/wc_daily_recap_<YYYY-MM-DD>.json` (handles gen + watermark + auto-tag + ingest).
4. `bash scripts/sync_large_assets.sh` to push to CDN.
5. Commit + push. Home rail's `template-wc-daily-recap-poster` example for that date now ships.

**Gotcha:** `lib/wc_2026_schedule.ts` uses bare local-venue times; the multi-TZ rendering in the recap poster is built into the prompt itself.

### 2.4 Prefill pool quality check

**Frequency:** before swapping any entry in `lib/popularPrefillQueries.ts` and quarterly to audit drift.

**Runbook section:** the maintenance note in [`lib/popularPrefillQueries.ts`](../lib/popularPrefillQueries.ts) itself.

**Cross-reference:** [`search-and-content.md` § Thread a — Search quality](./search-and-content.md#thread-a--search-quality--experience).

```bash
node scripts/inspect_prefill_pool_quality.cjs   # human-eyeball verdict: OK / NARROW / WEAK
```

Drop entries that come back NARROW with ≤7 hits unless they have strategic intent (image2image rank-boosted, popular single-template).

### 2.5 Snapshot regen — top remix prompts

**Frequency:** weekly via `.github/workflows/sync_nanoprompts_to_redis.yml` (Mondays 06:00 UTC), or manual on demand.

**Cross-reference:** [`search-and-content.md` § Thread b — Content tagging](./search-and-content.md#thread-b--content-tagging--topic-taxonomy) (the snapshot fuels the home rail's gallery-prompt interleave).

```bash
node scripts/snapshot_top_remix_prompts.cjs   # writes public/data/top_remix_prompts.json
```

Reads `featured_boost` from `nanobanana.json` and merges into the SQL-derived top-25. To pin a prompt to the rail without waiting for organic copies:

```bash
# Edit public/data/nanobanana.json, set featured_boost: 1000 on the prompt(s)
node scripts/snapshot_top_remix_prompts.cjs    # regenerate snapshot
git commit -am "..." && git push                # rail updates after Vercel rebuild
```

### 2.6 Gallery remix surface end-to-end test

**Frequency:** ad-hoc smoke test of the freeform gen path.

**Cross-reference:** memory `project_gallery_reproduce_surface.md` for the underlying design (NANO_TEMPLATE_GENERATION vs NANO_FREEFORM_GENERATION).

Flow:
1. Log into curify-ai.com as a user with ≥ 10 credits.
2. Open `/nano-banana-pro-prompts/<id>` for any prompt.
3. Use the "Make it yours" panel — edit prompt, optionally upload reference image, click Generate.
4. Backend hits `POST /nano-freeform/generate` → image lands at `images/nano_freeform/<project_id>.jpg` in GCS. Result tile shows on the gallery [id] reproduce surface.
5. Verify the project shows up in the user's workspace (`/workspace`).

### 2.7 Image text-overlay edit (`image_text_overlay_agent.cjs`)

**Frequency:** ad-hoc — when an operator wants to add or replace text on an existing image (meme captions, headline overlays, prompt-driven typography).

**Pipeline:** [`scripts/image_text_overlay_agent.cjs`](../scripts/image_text_overlay_agent.cjs)
1. Loads an image config from `public/data/nanobanana.json` by `id` (or reads a raw file directly in a per-job one-off — see below).
2. Calls OpenAI (`gpt-4.1` by default) to PROPOSE 3 text-overlay ideas given the image + an editorial brief.
3. For each idea, asks OpenAI to write a Gemini image-edit prompt.
4. Calls Gemini image-edit (`gemini-2.5-flash-image` default) with the original image + edit prompt; saves output under `public/image_text_layout/`.

**When you already know the exact caption**, skip the OpenAI propose step and write a focused one-off (see `scripts/oneoff_wc_meme_text_overlay_2026-06-30.cjs` as a template — it reuses the Gemini edit call directly).

**Critical model gotcha — Chinese / CJK captions:**

The pipeline's default `gemini-2.5-flash-image` **mangles longer Simplified-Chinese strings** — drops characters, garbles stroke composition, hallucinates near-homophones. For any CJK caption longer than ~6 characters, override the model:

```bash
GEMINI_IMAGE_EDIT_MODEL=gemini-3-pro-image-preview \
  node scripts/<your-overlay-script>.cjs
```

`gemini-3-pro-image-preview` renders 20-30 character Chinese captions cleanly. Latin-only / short labels stay fine on flash (faster + cheaper).

**Memory:** `feedback_chinese_caption_gemini_model.md` — captures this lesson + a productization follow-up (auto-detect CJK in the prompt and route to the right model inside the pipeline).

**Concrete example (2026-06-30):** WC meme reskin of the classic 朱时茂/陈佩斯 frame with a soccer-themed caption replacement. Flash garbled the characters; pro rendered exactly. See `raw/wc-meme-06-30/` for input + edited output and `scripts/oneoff_wc_meme_text_overlay_2026-06-30.cjs` for the one-off shape.

**Pattern — multi-line / multi-language / multi-variant overlay:**

When you need more than a single caption replacement (e.g. a poster-style image with a top headline + bottom strip, or the same image rendered in several language combos for A/B), don't fire one call per output. Drive a `VERSIONS = [{ name, out, prompt }, ...]` array from a single script and loop. Keeps the image read once, makes side-by-side review trivial, and avoids prompt drift across variants.

Two layout primitives that work well in the edit prompt:

- **3-zone layout** — TOP sky / BOTTOM stack. Specify each line's text, language, color (white-with-outline vs bold-red-with-outline), size (% of image height, e.g. "~4%"), and placement (% from edge). The model honors percentage anchors better than vague "above" / "below".
- **Per-language styling** — different language, different style: JP/EN white sans/serif with thin black outline reads as international tribute; bold red (#E63329) with black outline reads as Chinese meme house style. Mixing both signals "global support" vs single-culture joke.

Always say what to **preserve** explicitly ("Snoopy, Mt. Fuji, the trophy, the train must remain pixel-identical — ONLY add the captions") — without it the model often re-renders the subject.

**Concrete example (2026-06-30):** Japan WC tribute poster (Snoopy + Mt. Fuji + trophy). One script rendered two variants: J+E+C (3 lines, 3 languages, mixed styles) and J+E only (2 lines, white serif). See `raw/wc-meme-06-30/japan-wc-jec.jpg` / `japan-wc-je.jpg` and `scripts/oneoff_japan_wc_meme_text_overlay_2026-06-30.cjs`.

### 2.8 Manual credit grant

**Frequency:** rare — typically for internal users or partner accounts.

```python
# Run from a Python shell with DATABASE_URL set
# (or via ~/curify-studio/curify_background/.venv/bin/python)
import asyncio, asyncpg, os
from datetime import datetime
URL = os.environ["DATABASE_URL"].replace("+asyncpg", "")
USER_ID, GRANT = 1117, 1000.0

async def main():
    conn = await asyncpg.connect(URL, ssl={"rejectUnauthorized": False} if "supabase" in URL else None)
    async with conn.transaction():
        now = datetime.utcnow()
        tx_id = await conn.fetchval(
            "INSERT INTO transaction (user_id, transaction_type, credits, "
            "transaction_date, description, created_at, updated_at) "
            "VALUES ($1, 'INITIAL_REWARD', $2, $3, 'Manual credit grant', $3, $3) "
            "RETURNING transaction_id",
            USER_ID, GRANT, now,
        )
        await conn.execute(
            'UPDATE "user" SET non_expiring_credits = COALESCE(non_expiring_credits, 0) + $1, '
            "updated_at = $2 WHERE user_id = $3",
            GRANT, now, USER_ID,
        )
    await conn.close()
    print(f"granted {GRANT} → user {USER_ID}, tx_id={tx_id}")

asyncio.run(main())
```

`INITIAL_REWARD` is the closest existing `TransactionType` enum value — manual grants don't have their own enum slot. Re-balance the `description` field if you need post-hoc filtering. See `feedback_jobtype_enum_addition.md` for why we don't `ALTER TYPE` for one-off labels.

---

## 3. Where each piece lives

| Piece | Path | Owner doc |
| --- | --- | --- |
| Template data | `public/data/nano_templates.json` | `batch-generation.md`, `search-and-content.md` |
| Inspirations data | `public/data/nano_inspiration.json` | `batch-generation.md` |
| Gallery prompts | `public/data/nanobanana.json` | (none — schema documented inline in `sync_nanoprompts_to_redis.cjs`) |
| Top remix snapshot (home rail) | `public/data/top_remix_prompts.json` | this doc § 2.5 |
| Taxonomy | `lib/taxonomy.json` | `search-and-content.md` Thread b |
| Topic registry | `lib/topicRegistry.ts` | `search-and-content.md` Thread b |
| Section A matcher | `app/[locale]/(public)/search/page.tsx` | `search-quality.md` |
| Section B matcher | `lib/searchTemplateMatch.ts` | `template-matching-section-a-vs-b-2026-06-17.md` |
| Gen pipeline | `scripts/generate_template_examples.cjs` + `scripts/lib/auto_tag.cjs` + `scripts/lib/watermark.cjs` | `batch-generation.md` |
| Daily-drop ingest | `scripts/sync_nano_inspiration.cjs` | this doc § 2.1 |
| CDN sync | `scripts/sync_large_assets.sh` | this doc § 1 (Access) |
| Backend gen (template) | `curify-studio/curify_background/app/pipelines/nano_template_pipeline.py` | (none — schema in `feedback_jobtype_enum_addition.md`) |
| Backend gen (freeform) | `curify-studio/curify_background/app/pipelines/nano_freeform_pipeline.py` | memory `project_gallery_reproduce_surface.md` |

---

## 4. Hand-off

If a workflow lives entirely outside this doc, it gets a pointer here. If a workflow is new and not yet documented anywhere, write its runbook in `docs/` and add the launch-pad section here.

**See also:**
- [`docs/search-and-content.md`](./search-and-content.md) — strategic umbrella across the four content threads.
- [`docs/batch-generation.md`](./batch-generation.md) — deep dive on config-driven batch gen.
- [`docs/template-matching-section-a-vs-b-2026-06-17.md`](./template-matching-section-a-vs-b-2026-06-17.md) — matcher design.
- [`docs/search-quality.md`](./search-quality.md) — search-side tuning, low-result review, alias work.
- `feedback_*` memory files in `~/.claude/projects/-Users-qqwjq-curify-frontend/memory/` — operator gotchas + lessons learned, surfaced automatically per session.
