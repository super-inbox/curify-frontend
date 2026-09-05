# Query → page mismatch — 2026-08-04 → 2026-08-31

Rows pulled: 1201. Findings: 43 (gap ≥ 0.34, rival coverage ≥ 0.67, ≥2 query tokens, min impressions 1). 37 ranking URLs were not in the title index and were skipped rather than reported.

| class | count | meaning |
|---|---:|---|
| RIVAL_INDEXED | 27 | a better-titled page of ours also ranks — relevance bleed |
| RIVAL_UNRANKED | 16 | the better page is invisible — linking/authority |

## Cannibal leaderboard

URLs ranked by how often they outrank a better title-match.

| # | url | findings | impressions | distinct pages outranked |
|---:|---|---:|---:|---:|
| 1 | `/tools/video-dubbing` | 10 | 19 | 3 |
| 2 | `/blog/ai-video-dubbing-tutorial` | 5 | 18 | 2 |
| 3 | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-lloyd-pierce` | 2 | 77 | 1 |
| 4 | `/nano-template/mbti-generic` | 2 | 2 | 2 |
| 5 | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-jimmy-hurdstrom` | 1 | 9 | 1 |
| 6 | `/nano-template/mbti-marvel` | 1 | 3 | 1 |
| 7 | `/nano-template/mbti-nba/example/template-mbti-nba-erling-haaland` | 1 | 1 | 1 |
| 8 | `/nano-template/mbti-nba/example/template-mbti-nba-alleniverson` | 1 | 1 | 1 |
| 9 | `/nano-template/mbti-naruto` | 1 | 1 | 1 |
| 10 | `/blog/mbti-character-generator` | 1 | 1 | 1 |
| 11 | `/blog/footballer-mbti-types` | 1 | 1 | 1 |
| 12 | `/blog/world-cup-2026-ai-prompt-hub` | 1 | 1 | 1 |

## Top findings by impressions

| query | impr | pos | ranked | should be | gap | class | probe |
|---|---:|---:|---|---|---:|---|---|
| yellowstone mbti | 71 | 6.6 | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-lloyd-pierce` | `/nano-template/mbti-yellowstone` | 0.50 | RIVAL_INDEXED | none |
| itachi mbti | 42 | 4.1 | `/nano-template/mbti-naruto` | `/nano-template/mbti-naruto/example/template-mbti-naruto-itachi` | 0.50 | RIVAL_UNRANKED | none |
| itachi uchiha mbti | 26 | 3.4 | `/nano-template/mbti-naruto` | `/nano-template/mbti-naruto/example/template-mbti-naruto-itachi` | 0.67 | RIVAL_UNRANKED | none |
| kevin durant mbti | 18 | 4.6 | `/nano-template/mbti-nba` | `/nano-template/mbti-nba/example/template-mbti-nba-kevendurant` | 0.67 | RIVAL_UNRANKED | none |
| shaq mbti | 17 | 4.6 | `/nano-template/mbti-nba/example/template-mbti-nba-shaquilleoneal` | `/nano-template/mbti-generic/example/template-mbti-generic-Basketball-Michael-Jordan-LeBron-James-Kawhi-Leonard-Shaquille-ONeal` | 0.50 | RIVAL_UNRANKED | none |
| ai sticker sheet prompt | 13 | 20.8 | `/blog/50-ai-sticker-design-prompts` | `/nano-template/vintage-watercolor-hobby-sticker-sheet` | 0.50 | RIVAL_UNRANKED | none |
| rip wheeler mbti | 12 | 8.9 | `/nano-template/mbti-yellowstone` | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-ripwheeler` | 0.67 | RIVAL_UNRANKED | none |
| kevin durant mbti | 11 | 4.5 | `/nano-template/mbti-nba/example/template-mbti-nba-michaeljordan` | `/nano-template/mbti-nba/example/template-mbti-nba-kevendurant` | 0.67 | RIVAL_UNRANKED | none |
| ai video dubbing | 10 | 83.0 | `/blog/ai-video-dubbing-tutorial` | `/tools/video-dubbing` | 0.50 | RIVAL_INDEXED | title-in-markup+title-in-payload+desc-in-payload |
| yellowstone mbti | 9 | 8.8 | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-jimmy-hurdstrom` | `/nano-template/mbti-yellowstone` | 0.50 | RIVAL_INDEXED | none |
| mbti yellowstone | 6 | 4.5 | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-lloyd-pierce` | `/nano-template/mbti-yellowstone` | 0.50 | RIVAL_INDEXED | none |
| ai dubbing tools | 4 | 63.3 | `/tools/video-dubbing` | `/blog/lip-sync-business-guide` | 0.50 | RIVAL_INDEXED | title-in-payload+desc-in-markup+desc-in-payload |
| tim curry mbti | 4 | 4.0 | `/nano-template/mbti-generic` | `/nano-template/mbti-generic/example/template-mbti-generic-Basketball-Kobe-Bryant-Stephen-Curry-Kevin-Durant-Tim-Duncan` | 0.67 | RIVAL_UNRANKED | — |
| ai dub video | 3 | 79.3 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
| free video dub | 3 | 68.3 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
| how to make dubbing video | 3 | 56.7 | `/blog/ai-video-dubbing-tutorial` | `/tools/video-dubbing` | 0.50 | RIVAL_INDEXED | — |
| hulk mbti | 3 | 3.3 | `/nano-template/mbti-marvel` | `/nano-template/mbti-marvel/example/template-mbti-marvel-marvel-hulk` | 0.50 | RIVAL_INDEXED | — |
| kevin durant mbti | 3 | 5.0 | `/nano-template/mbti-nba` | `/nano-template/mbti-nba/example/template-mbti-nba-kevendurant` | 0.67 | RIVAL_UNRANKED | — |
| ai dub videos | 2 | 74.0 | `/tools/video-dubbing` | `/blog/how-to-dub-videos-naturally` | 1.00 | RIVAL_INDEXED | — |
| dubbing video | 2 | 77.0 | `/blog/ai-video-dubbing-tutorial` | `/tools/video-dubbing` | 0.50 | RIVAL_INDEXED | — |
| video dub | 2 | 81.0 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
| video dubbing | 2 | 90.0 | `/blog/ai-video-dubbing-tutorial` | `/tools/video-dubbing` | 0.50 | RIVAL_INDEXED | — |
| ai video dub | 1 | 77.0 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
| beth dutton mbti | 1 | 11.0 | `/nano-template/mbti-yellowstone` | `/nano-template/mbti-yellowstone/example/template-mbti-yellowstone-bethdutton` | 0.67 | RIVAL_UNRANKED | — |
| brand identity prompt generator | 1 | 74.0 | `/topics/branding` | `/nano-template/brand-identity-moodboard-visual-system-poster/example/template-brand-identity-moodboard-visual-system-poster-crema-gelato` | 1.00 | RIVAL_UNRANKED | — |
| cristiano ronaldo | 1 | 13.0 | `/blog/portugal-soccer-poster-prompts` | `/nano-template/soccer-star-comic-retro-poster-card/example/template-soccer-star-comic-retro-poster-card-cristiano-ronaldo` | 0.50 | RIVAL_UNRANKED | — |
| de bruyne mbti | 1 | 3.0 | `/nano-template/mbti-nba/example/template-mbti-nba-erling-haaland` | `/nano-template/mbti-generic/example/template-mbti-generic-Football-Lionel-Messi-Cristiano-Ronaldo-Kevin-De-Bruyne-Neymar-Jr` | 0.67 | RIVAL_INDEXED | — |
| derrick rose mbti | 1 | 4.0 | `/nano-template/mbti-nba/example/template-mbti-nba-alleniverson` | `/nano-template/mbti-nba/example/template-mbti-nba-derrickrose` | 0.67 | RIVAL_INDEXED | — |
| dub video | 1 | 70.0 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
| dub video with ai | 1 | 71.0 | `/tools/video-dubbing` | `/blog/ai-video-dubbing-tutorial` | 0.50 | RIVAL_INDEXED | — |
