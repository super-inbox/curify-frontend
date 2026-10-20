# Search intent quality and focused content drop — 2026-10-20

Subtitle translation in Chinese now routes to the subtitle tool. The phrase matcher previously allowed two-character CJK aliases at its caller but rejected them in the shared helper. ASCII specificity rules remain unchanged.

Pasted video links open a tool chooser, retaining the original URL, including case-sensitive IDs. YouTube links prefill the existing import form; processing still requires the normal review/start action. Other sites show an upload fallback. URLs are parsed locally, never fetched by the search server. Tool-choice clicks use fixed-cardinality tracking IDs. Chooser copy supports English and Chinese, with English fallback in other locales.

Search applies narrow subject constraints for the evidenced art-movement, tulip, Filipino-poem, peacock, magnetic-box and dieline cases to every retrieval path. Rewrites cannot bypass the original subject/language requirements. Unaffected queries do not pay the extra record-serialization cost. Spanish industrial-design queries and the observed spelling variants use equivalent retrieval tokens while preserving display text. Cubism connects to existing Picasso examples. This is an evidence-bounded correction, not a general semantic relevance solution.

## Content

- The existing dieline-to-3D gallery record now has a title, description and explicit search aliases. Its original source/image/prompt remain intact.
- New original magnetic-box packaging concept: closed, open and wrap views. Explicitly labeled not a production dieline; no claim of engineering or fold accuracy.
- New original Filipino poetry infographic, “Munting Pag-asa.” The wording was reviewed and the second line corrected during image QA. No attribution to a real poet and no native-speaker certification claimed.
- New peacock couture example under the existing nature-inspired gown template, with its matching generation parameter.

Gallery additions use IDs 2026102001 and 2026102002. The gown inspiration is `template-fashion-inspired-gown-design-sheet-peacock-couture-20261020`. All six new CDN assets returned HTTP 200 with image/jpeg; the existing dieline image is also available. Six JPEG assets/previews are under `https://cdn.curify-ai.com/images/search-quality-20261020/`. Generated assets were visually reviewed and watermarked using the existing helper.

The canonical gallery source remains `public/data/nanobanana.json`. Run `python3 scripts/build_search_curated_gallery.py` after editing one of the three curated records. The resulting small index supports targeted search and detail pages independently of Redis sync, including branch previews. Other prompt details continue using the existing API. The normal main-branch workflow maintains the full Redis gallery.

## Validation

- 81 focused tests pass, including the actual server search page with deliberately irrelevant rewrite paths.
- Chinese subtitle query redirects; Spanish and English industrial-design top results agree; cubism finds Picasso; art movements starts with art history.
- Peacock query finds its new gown; packaging and Filipino-poem queries find their exact gallery concepts.
- Tulip planting remains empty rather than showing unrelated diagrams. A Filipino-plus-Korean request does not silently accept Filipino-only content.
- The 137-query legacy regression has 96 PASS, 41 WARN, 0 FAIL. It does not exercise the entire server path; the new page tests cover those integration cases.
- TypeScript and i18n command checks pass. The i18n checker still reports existing namespace-key discrepancies while returning success.

No private visitor identifiers or pasted visitor URLs are included in this commit. Analytics counts are not a claim of conversion improvement. Production result behavior remains to be measured after deployment.
