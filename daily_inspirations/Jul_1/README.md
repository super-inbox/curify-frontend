# Daily Inspirations — July 1, 2026

Working folder for the July 1 daily inspiration drop.

## Checklist
- [ ] Source / theme for the day
- [ ] New templates → `public/data/nano_templates.json` (id, base_prompt, params, topics)
- [ ] Examples → `public/data/nano_inspiration.json` (example_ids, tags, allow_i18n)
- [ ] 10-locale i18n via `add_<source>_<date>_i18n.py` — in the **same** drop, never a follow-up
- [ ] Backfill `rank_score` (default 90 / median) so items don't sink in feed sorts
- [ ] Sync assets to CDN/GCS (`scripts/sync_large_assets.sh`) if images were added
- [ ] Regen gallery metadata (`node scripts/regen_nanobanana_metadata.cjs`) if tags changed

## Notes
(sources, decisions, what shipped)
