"""Add /blog/50-wimbledon-2026-ai-prompts mega-hub. Compact edition.

WC50 pattern (validated 6/16) — but half the word count. 50 prompts stay;
prose scaffolding is trimmed. Only 2-3 lead prompts per pattern get full
```code``` blocks — the tail is inline single-line bullets.
"""
from __future__ import annotations
import json
from pathlib import Path
from collections import OrderedDict

REPO = Path(__file__).parent.parent
SLUG = "50-wimbledon-2026-ai-prompts"
KEY = "fiftyWimbledon2026AiPrompts"
DATE_HUMAN = "June 26, 2026"
DATE_ISO = "2026-06-26"

TITLE = "50+ Wimbledon 2026 AI Prompts: Free Tennis Templates That Generate in One Click"
META = ("50+ free Wimbledon 2026 AI prompts — player retro cards, 1v1 rivalry posters, "
        "iconic Centre Court moments, serve technique guides, shot-trajectory analysis. "
        "Copy-paste prompts + one-click generate. Alcaraz, Sinner, Djokovic, Świątek, "
        "Sabalenka, Gauff.")
SEO_KEYWORDS = ("wimbledon 2026 prompt, wimbledon ai prompt, tennis prompt, alcaraz "
                "prompt, sinner prompt, djokovic prompt, wimbledon poster prompt, "
                "tennis poster prompt, grand slam prompt, tennis 1v1 prompt")

INTRO = (
    "*Wimbledon 2026 prompts* are the next event-content wave — Alcaraz's title "
    "defense, Sinner's grass-court breakout, Djokovic chasing his 25th slam. The "
    "aggregators (`imagine.art`, `mediaio`, `vibemeai.net`) have not yet shipped "
    "their listicles.\n\n"
    "Every prompt below is paired with a **Curify template that generates it in one "
    "click**. Copy-paste anywhere (ChatGPT, Gemini, Nano Banana Pro) — or click the "
    "template link and get a working card, poster, or infographic in 30 seconds. "
    "All 50 target The Championships, Wimbledon 2026 (June 29 – July 13, SW19 London)."
)

WHAT_IS_TITLE = "What makes a good Wimbledon 2026 prompt"
WHAT_IS_CONTENT = (
    "Four ingredients separate viral tennis posters from generic AI output:\n\n"
    "- **Player + kit identity** — *\"Alcaraz Nike-white polo with red bandana\"* "
    "beats *\"tennis player\"*.\n"
    "- **Surface + venue** — *\"grass court\"*, *\"Centre Court roof half-closed\"*, "
    "*\"SW19 ivy backdrop\"*. Wimbledon has distinct visual grammar; specify it or you "
    "get clay-orange.\n"
    "- **Composition cue** — *\"vertical retro card\"*, *\"split-screen 1v1\"*, "
    "*\"cinematic dusk\"*. Tells the model what the output structure is.\n"
    "- **The right template** — parameterized templates encode the grammar. You supply "
    "the variable; the template handles the rest."
)

MODELS_TITLE = "Templates that back these prompts"
MODELS_CONTENT = (
    "Five template families cover all 50 prompts:\n\n"
    "- `template-pro-athlete-stat-infographic-poster` → vintage stats card / career-arc\n"
    "- `template-sports-battle` → 1v1 rivalry head-to-head\n"
    "- `template-celebrity-movie-group-poster` → tennis legends / champion posters\n"
    "- `template-sports-technique-guide` → serve / forehand / backhand breakdowns\n"
    "- `template-sports-court-shot-trajectory-analysis-infographic` → rally shot-maps"
)

HOW_TITLE = "The 50 prompts"

# ── Pattern 1: Player vintage stats cards (12 prompts) ─────────────────────
STEP1_TITLE = "Pattern 1: Player vintage stats cards (12 prompts)"
STEP1_CONTENT = (
    "Vintage stats infographic — bold portrait + career slams + Wimbledon record + "
    "signature shot. Highest-CTR tennis format. Pair with "
    "[`template-pro-athlete-stat-infographic-poster`]"
    "(/nano-template/pro-athlete-stat-infographic-poster).\n\n"
    "![Novak Djokovic tennis pro athlete stat infographic poster]"
    "(/images/nano_insp/template-pro-athlete-stat-infographic-poster-novak-djokovic-tennis.jpg)\n\n"
    "[Open the Pro Athlete Stat Infographic template →]"
    "(/nano-template/pro-athlete-stat-infographic-poster)\n\n"
    "**1. Carlos Alcaraz** (defending champion)\n\n"
    "```\n"
    "Carlos Alcaraz Wimbledon 2026 vintage stats card, Nike white polo with red trim "
    "and red bandana, forehand mid-follow-through, career grand slam count (4 titles), "
    "Wimbledon 2x champion marker, Centre Court grass backdrop, editorial infographic "
    "layout with career-arc timeline\n"
    "```\n\n"
    "**2. Jannik Sinner** (world No. 1)\n\n"
    "```\n"
    "Jannik Sinner Wimbledon 2026 vintage stats card, Nike white kit with orange trim, "
    "two-handed backhand mid-swing, grand slam count (3 titles), world No. 1 marker, "
    "SW19 ivy-and-grass backdrop, editorial infographic layout with career-arc timeline\n"
    "```\n\n"
    "**3. Novak Djokovic** — `Djokovic Lacoste-white polo, return-of-serve pose, 24 "
    "slams chasing #25, Wimbledon 7x champion, Centre Court dusk backdrop`\n\n"
    "**4. Alexander Zverev** — `Zverev adidas-white with green accent, serve toss "
    "mid-motion, career-arc timeline, ATP Finals champion marker, Centre Court`\n\n"
    "**5. Daniil Medvedev** — `Medvedev Lacoste-white polo, flat forehand baseline "
    "pose, 1 slam (US Open 2021), SW19 grass court, career-arc timeline`\n\n"
    "**6. Iga Świątek** — `Świątek Nike-white with ribbon trim, open-stance forehand "
    "pose, 5 slams, world No. 1 marker, Centre Court grass backdrop`\n\n"
    "**7. Aryna Sabalenka** — `Sabalenka Nike-black-and-white kit, power-serve toss, "
    "3 slams, world No. 1 marker, SW19 grass court, career-arc timeline`\n\n"
    "**8. Coco Gauff** — `Gauff New-Balance-white with pink trim, two-handed backhand "
    "pose, 2 slams, teen-prodigy markers, Centre Court grass`\n\n"
    "**9. Elena Rybakina** — `Rybakina adidas-white with pastel accent, big-serve "
    "delivery, Wimbledon 2022 champion crown, SW19 grass court`\n\n"
    "**10. Jasmine Paolini** — `Paolini Nike-white with Italian-flag accent, "
    "scrambling defensive pose, Wimbledon 2024 finalist, Centre Court`\n\n"
    "**11. Taylor Fritz** — `Fritz Nike-white with USA-red trim, flat-serve delivery, "
    "US Open 2024 finalist, SW19 grass court, American-hope markers`\n\n"
    "**12. Holger Rune** — `Rune Nike-white with Danish-red trim, aggressive baseline "
    "pose, next-gen breakthrough markers, Centre Court grass backdrop`"
)

# ── Pattern 2: 1v1 Rivalry battles (10 prompts) ────────────────────────────
STEP2_TITLE = "Pattern 2: 1v1 rivalry battles (10 prompts)"
STEP2_CONTENT = (
    "Head-to-head split-screen posters — best format for the marquee matchups fans "
    "argue about on X. Pair with [`template-sports-battle`](/nano-template/sports-battle).\n\n"
    "**13. Alcaraz vs Sinner** (new-era title fight)\n\n"
    "```\n"
    "1v1 Rivalry battle poster Alcaraz vs Sinner, split-screen, Alcaraz Nike-white "
    "red-trim left, Sinner Nike-white orange-trim right, Wimbledon Centre Court "
    "backdrop, roof-lit dramatic lighting, vertical poster with VS center typography\n"
    "```\n\n"
    "**14. Djokovic vs Alcaraz** (generational handoff)\n\n"
    "```\n"
    "1v1 Rivalry battle Djokovic vs Alcaraz, split-screen, Djokovic Lacoste-white "
    "left, Alcaraz Nike-white with red bandana right, old-guard-vs-new-blood crossfade, "
    "Wimbledon Centre Court dusk backdrop, vertical poster with VS center typography\n"
    "```\n\n"
    "**15. Sinner vs Djokovic** — `Sinner Nike-orange-white left, Djokovic Lacoste-"
    "white right, Wimbledon grass crossfade, VS center typography`\n\n"
    "**16. Świątek vs Sabalenka** — `Świątek Nike-white left, Sabalenka Nike-black "
    "right, world-No.1-handoff framing, Centre Court crossfade`\n\n"
    "**17. Sabalenka vs Gauff** — `Sabalenka Nike-black left, Gauff New-Balance-pink "
    "right, US Open final rematch framing, Wimbledon grass crossfade`\n\n"
    "**18. Alcaraz vs Zverev** — `Alcaraz Nike-white-red-bandana left, Zverev adidas-"
    "white-green right, title-favorite showdown, Centre Court crossfade`\n\n"
    "**19. Gauff vs Świątek** — `Gauff New-Balance-pink left, Świątek Nike-white-ribbon "
    "right, next-gen women's rivalry framing, Wimbledon grass crossfade`\n\n"
    "**20. Djokovic vs Sinner** — `Djokovic Lacoste-white left, Sinner Nike-orange "
    "right, all-time-record chase framing (25th slam), Centre Court trophy backdrop`\n\n"
    "**21. Rybakina vs Sabalenka** — `Rybakina adidas-white left, Sabalenka Nike-black "
    "right, power-vs-power framing, Wimbledon grass court crossfade`\n\n"
    "**22. Fritz vs Rune** — `Fritz Nike-USA-red-trim left, Rune Nike-Danish-red-trim "
    "right, next-gen breakthrough battle, Wimbledon grass crossfade`"
)

# ── Pattern 3: Iconic Wimbledon moments (10 prompts) ───────────────────────
STEP3_TITLE = "Pattern 3: Iconic Wimbledon moments (10 prompts)"
STEP3_CONTENT = (
    "Historical champion moments + hypothetical 2026 champion posters — the format "
    "fans reshare when a match ends. Wimbledon's visual identity (strawberry-cream, "
    "Centre Court ivy, gold trophy) does most of the work. Pair with "
    "[`template-celebrity-movie-group-poster`]"
    "(/nano-template/celebrity-movie-group-poster).\n\n"
    "![Tennis legends group poster — vintage editorial layout]"
    "(/images/nano_insp/template-celebrity-movie-group-poster-tennis-legends.jpg)\n\n"
    "[Open the Celebrity Group Poster template →]"
    "(/nano-template/celebrity-movie-group-poster)\n\n"
    "**23. Alcaraz 2024 title moment** — `Alcaraz raising gold trophy at Centre Court, "
    "strawberry-cream palette, ivy backdrop, cinematic dusk, editorial vertical poster`\n\n"
    "**24. Djokovic's 7 Wimbledon crowns** — `Djokovic profile with 7 trophy silhouettes "
    "ascending, Centre Court dusk, gold-white palette, career retrospective`\n\n"
    "**25. Federer's farewell 2022** — `Federer in Uniqlo-white waving to crowd, "
    "strawberry-cream palette, golden hour, editorial vertical poster with 'thank you "
    "Roger' handwritten accent`\n\n"
    "**26. Świątek grass-court breakthrough** — `Świątek serving on Centre Court, roof "
    "half-closed, Nike-white ribbon-trim, spotlit backdrop, 'grass season' typography`\n\n"
    "**27. Sinner's Big-3 slayer breakout** — `Sinner returning serve on Centre Court, "
    "Nike-orange-white kit, Centre Court dusk, 'new era' typography accent`\n\n"
    "**28. Rybakina 2022 champion moment** — `Rybakina lifting Venus Rosewater Dish at "
    "Centre Court, adidas-white kit, strawberry-cream palette, editorial vertical poster`\n\n"
    "**29. Sabalenka grass-court breakout** — `Sabalenka serving on Centre Court, "
    "Nike-black kit, dusk floodlit backdrop, 'grass court queen' typography`\n\n"
    "**30. Nadal vs Federer 2008 classic tribute** — `split-screen Nadal Nike-blue-white "
    "left, Federer Nike-white right, Centre Court twilight, cinematic tribute lighting`\n\n"
    "**31. Gauff's 2019 teen prodigy debut** — `15-year-old Gauff with raised fists on "
    "Court 1, New-Balance kit, strawberry-cream palette, 'the future arrives' typography`\n\n"
    "**32. Hypothetical 2026 champion (customizable)**\n\n"
    "```\n"
    "Wimbledon 2026 champion poster [PLAYER NAME] lifting the trophy at Centre Court, "
    "[PLAYER NAME]'s signature kit, strawberry-cream palette, roof-lit backdrop with "
    "golden-hour cinematic lighting, editorial vertical poster with 'Wimbledon 2026 "
    "Champion' typography\n"
    "```"
)

# ── Pattern 4: Serve / technique breakdowns (10 prompts) ───────────────────
STEP4_TITLE = "Pattern 4: Serve & technique breakdown guides (10 prompts)"
STEP4_CONTENT = (
    "Phase-by-phase technique infographics — the format tennis-instruction accounts "
    "publish on Instagram and TikTok. Pair with "
    "[`template-sports-technique-guide`](/nano-template/sports-technique-guide).\n\n"
    "![Tennis serve technique guide infographic — 4-phase breakdown with annotations]"
    "(/images/nano_insp/template-sports-technique-guide-tennis.jpg)\n\n"
    "[Open the Sports Technique Guide template →](/nano-template/sports-technique-guide)\n\n"
    "**33. Kick serve** — `Tennis kick serve technique guide, 4-phase breakdown (toss, "
    "trophy, contact, follow-through), biomechanical annotations, hand-drawn coaching-"
    "style, vertical infographic`\n\n"
    "**34. Flat serve** — `Tennis flat serve, 4-phase breakdown (toss, cock, drive, "
    "snap), contact point at maximum reach, biomechanical annotations, hand-drawn`\n\n"
    "**35. Slice serve** — `Tennis slice serve, 4-phase breakdown with side-spin arc, "
    "lateral-spin annotations, hand-drawn coaching-style, vertical infographic`\n\n"
    "**36. One-handed backhand** — `Tennis one-handed backhand, 5-phase (unit turn, "
    "backswing, contact, follow-through, recovery), shoulder-rotation annotations`\n\n"
    "**37. Two-handed backhand** — `Tennis two-handed backhand, 5-phase, hip-shoulder-"
    "hand kinetic chain annotations, hand-drawn coaching-style, vertical infographic`\n\n"
    "**38. Forehand topspin** — `Tennis forehand topspin, 5-phase, low-to-high swing "
    "path, topspin rotation annotations, hand-drawn, vertical infographic`\n\n"
    "**39. Net volley** — `Tennis net volley, 3-phase (split-step, punch, follow-"
    "through), compact-swing annotations, hand-drawn coaching-style, grass-court palette`\n\n"
    "**40. Return of serve** — `Tennis return of serve, 4-phase (ready, split-step, "
    "contact, recovery), reaction-and-block-swing annotations, hand-drawn`\n\n"
    "**41. Overhead smash** — `Tennis overhead smash, 4-phase (track, load, contact, "
    "finish), kill-shot annotations, hand-drawn coaching-style, vertical infographic`\n\n"
    "**42. Grass-court sliding footwork** — `Tennis grass-court sliding, 3-phase "
    "(approach, plant, recover), grass-vs-clay stopping mechanics callout, hand-drawn`"
)

# ── Pattern 5: Shot-trajectory rally analysis (5 prompts) ──────────────────
STEP5_TITLE = "Pattern 5: Shot-trajectory rally analysis (5 prompts)"
STEP5_CONTENT = (
    "Top-down court diagrams with color-coded shot paths — the format tennis analytics "
    "sites use for match recaps. Great for post-match Twitter threads. Pair with "
    "[`template-sports-court-shot-trajectory-analysis-infographic`]"
    "(/nano-template/sports-court-shot-trajectory-analysis-infographic).\n\n"
    "![Tennis serve trajectory shot-analysis infographic]"
    "(/images/nano_insp/template-sports-court-shot-trajectory-analysis-infographic-tennis-serve-trajectory.jpg)\n\n"
    "[Open the Shot Trajectory Analysis template →]"
    "(/nano-template/sports-court-shot-trajectory-analysis-infographic)\n\n"
    "**43. Alcaraz serve placement map** — `Top-down Wimbledon Centre Court diagram, "
    "Alcaraz serve placement zones color-coded (wide-slice cyan, T-flat red, body-kick "
    "amber), 6 sample serves annotated with speed markers, vertical infographic`\n\n"
    "**44. Sinner forehand court map** — `Top-down Centre Court diagram, Sinner "
    "forehand court-coverage heatmap, cross-court-vs-down-the-line paths color-coded, "
    "topspin RPM annotations, vertical infographic`\n\n"
    "**45. Djokovic return-and-block pattern** — `Top-down Centre Court diagram, "
    "Djokovic return-of-serve coverage, block-return paths color-coded by opponent-"
    "serve zone, vertical analytics infographic`\n\n"
    "**46. Świątek forehand cross-court dominance** — `Top-down Centre Court diagram, "
    "Świątek forehand cross-court trajectory paths color-coded by depth zone, 8 rallies "
    "annotated with winner/error labels, vertical infographic`\n\n"
    "**47. Alcaraz vs Sinner marquee rally chart** — `Top-down Centre Court, Alcaraz-"
    "vs-Sinner shot-by-shot trajectory, alternating red-vs-orange ball paths, shot-type "
    "labels, editorial analytics style, vertical infographic`"
)

# ── Bonus (3 more prompts to hit 50) ───────────────────────────────────────
TOOLS_TITLE = "Bonus: SW19 miniature + trophy + fan outfit (3 more)"
TOOLS_CONTENT = (
    "**48. SW19 host miniature** — pair with "
    "[`template-city-miniature`](/nano-template/city-miniature)\n\n"
    "```\n"
    "SW19 London Wimbledon host miniature, All England Club Centre Court centered "
    "with roof half-closed, 2026 Championships tournament markers, strawberry-cream "
    "palette, isometric 3D miniature, vertical poster with SW19 script header\n"
    "```\n\n"
    "**49. Wimbledon trophy infographic** — pair with "
    "[`template-sports-trophy-infographic`](/nano-template/sports-trophy-infographic) — "
    "`Gentlemen's Trophy + Venus Rosewater Dish paired symmetrical composition, gold-"
    "silver palette, 'The Championships 2026' typography, history-callout sidebar`\n\n"
    "**50. Wimbledon fan outfit** — pair with "
    "[`template-wc-fan-outfit-poster`](/nano-template/wc-fan-outfit-poster) (image2image) — "
    "`Upload selfie + white-linen tennis polo, strawberry-cream scarf, pleated skirt, "
    "cream trainers, straw sun hat, accessory panels left side, RedNote 4:5 format`\n\n"
    "All 50 above work standalone in any AI image generator. They work better through "
    "the linked Curify template — parameterized prompt engineering produces 30-50% "
    "sharper output because the template encodes composition, lighting, and styling "
    "cues that get dropped in copy-paste."
)

CHALLENGES_TITLE = "Where these prompts still fail"
CHALLENGES_CONTENT = (
    "- **Grass-vs-clay confusion** — models default to clay-orange. Explicit *\"grass "
    "court\"* + *\"Wimbledon\"* locks the surface.\n"
    "- **Player likeness drift** — AI drifts to generic-face after 5-10 iterations. "
    "Compare to reference before publishing.\n"
    "- **Kit accuracy is approximate** — reads authentic for fan content; for licensed "
    "merch, source actual product photography.\n"
    "- **Trademark on AI likeness** — for commercial use, get player likeness rights "
    "via ATP / WTA / player agencies. Curify vintage-card templates render derivative-"
    "original compositions, safer than verbatim portraits."
)

CURIFY_TITLE = "Why through Curify beats ChatGPT alone"
CURIFY_CONTENT = (
    "- **Composition encoding** — template underlying prompt has layout, format, "
    "lighting, header style baked in. You supply the variable; model gets a complete "
    "spec.\n"
    "- **Parameter discipline** — 12 player cards through one template look like a "
    "coordinated series. ChatGPT copy-paste drifts style every generation.\n"
    "- **One-click generate** — no iteration. Click template → pick player → 30s to "
    "share-ready output.\n\n"
    "See also: [50+ World Cup 2026 AI Prompts](/blog/50-world-cup-2026-ai-prompts), "
    "[AI 1v1 Soccer Rivalry Prompts](/blog/ai-1v1-soccer-rivalry-prompts), "
    "[WC 2026 AI Prompt Hub](/blog/world-cup-2026-ai-prompt-hub)."
)

CONCLUSION_TITLE = "Pick one prompt — 30 seconds to a poster"
CONCLUSION_CONTENT = (
    "Pick the prompt matching the player you back, click the template. 30 seconds to "
    "your first Wimbledon 2026 poster, share-ready for Instagram, TikTok, RedNote, X.\n\n"
    "[Reach out via /contact](/contact) for brand-activation licensing during The "
    "Championships."
)

NANO_TEMPLATES = [
    {
        "groupKey": "wimbledon-50-popular-pro-athlete-stat-infographic-poster-novak-djokovic-tennis",
        "template_id": "template-pro-athlete-stat-infographic-poster",
        "sample_parameters": {"athlete": "Novak Djokovic — 24 slams, 7 Wimbledon titles"},
        "category": "sports",
        "description": "Djokovic vintage stats card — career-arc infographic",
        "image_urls": ["/images/nano_insp/template-pro-athlete-stat-infographic-poster-novak-djokovic-tennis.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-pro-athlete-stat-infographic-poster-novak-djokovic-tennis-prev.jpg"],
    },
    {
        "groupKey": "wimbledon-50-popular-celebrity-movie-group-poster-tennis-legends",
        "template_id": "template-celebrity-movie-group-poster",
        "sample_parameters": {"star_movie_group": "Tennis legends — Federer, Nadal, Djokovic, Alcaraz, Sinner"},
        "category": "sports",
        "description": "Tennis legends cinematic group poster",
        "image_urls": ["/images/nano_insp/template-celebrity-movie-group-poster-tennis-legends.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-celebrity-movie-group-poster-tennis-legends-prev.jpg"],
    },
    {
        "groupKey": "wimbledon-50-popular-sports-technique-guide-tennis",
        "template_id": "template-sports-technique-guide",
        "sample_parameters": {"sport_technique": "Tennis serve — 4-phase breakdown"},
        "category": "sports",
        "description": "Tennis serve technique breakdown infographic",
        "image_urls": ["/images/nano_insp/template-sports-technique-guide-tennis.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-sports-technique-guide-tennis-prev.jpg"],
    },
    {
        "groupKey": "wimbledon-50-popular-sports-court-shot-trajectory-analysis-infographic-tennis-serve-trajectory",
        "template_id": "template-sports-court-shot-trajectory-analysis-infographic",
        "sample_parameters": {"trajectory_context": "Tennis serve placement — Centre Court"},
        "category": "sports",
        "description": "Tennis serve trajectory shot-analysis infographic",
        "image_urls": ["/images/nano_insp/template-sports-court-shot-trajectory-analysis-infographic-tennis-serve-trajectory.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-sports-court-shot-trajectory-analysis-infographic-tennis-serve-trajectory-prev.jpg"],
    },
    {
        "groupKey": "wimbledon-50-popular-sports-battle-alcaraz-sinner",
        "template_id": "template-sports-battle",
        "sample_parameters": {"battle_context": "Alcaraz vs Sinner — Wimbledon 2026"},
        "category": "sports",
        "description": "Alcaraz vs Sinner 1v1 rivalry battle poster",
        "image_urls": [],
        "preview_image_urls": [],
    },
]

BLOG_ENTRY = OrderedDict([
    ("slug", SLUG),
    ("title", TITLE),
    ("date", DATE_HUMAN),
    ("readTime", "6 min read"),
    ("tag", "Wimbledon"),
    ("image", "/images/nano_insp/template-pro-athlete-stat-infographic-poster-novak-djokovic-tennis.jpg"),
    ("heroLink", "/nano-template/pro-athlete-stat-infographic-poster/example/template-pro-athlete-stat-infographic-poster-novak-djokovic-tennis"),
    ("category", "nano-template"),
    ("relatedLinks", ["50-world-cup-2026-ai-prompts", "ai-1v1-soccer-rivalry-prompts", "world-cup-2026-ai-prompt-hub"]),
    ("lastmod", DATE_ISO),
    ("metaDescription", META),
    ("nanoTemplates", NANO_TEMPLATES),
])

MESSAGES_ENTRY = OrderedDict([
    ("title", TITLE),
    ("metaDescription", META),
    ("seoKeywords", SEO_KEYWORDS),
    ("date", DATE_HUMAN),
    ("readTime", "6 min read"),
    ("intro", INTRO),
    ("whatIsTitle", WHAT_IS_TITLE),
    ("whatIsContent", WHAT_IS_CONTENT),
    ("modelsTitle", MODELS_TITLE),
    ("modelsContent", MODELS_CONTENT),
    ("howTitle", HOW_TITLE),
    ("step1Title", STEP1_TITLE),
    ("step1Content", STEP1_CONTENT),
    ("step2Title", STEP2_TITLE),
    ("step2Content", STEP2_CONTENT),
    ("step3Title", STEP3_TITLE),
    ("step3Content", STEP3_CONTENT),
    ("step4Title", STEP4_TITLE),
    ("step4Content", STEP4_CONTENT),
    ("step5Title", STEP5_TITLE),
    ("step5Content", STEP5_CONTENT),
    ("toolsTitle", TOOLS_TITLE),
    ("toolsContent", TOOLS_CONTENT),
    ("challengesTitle", CHALLENGES_TITLE),
    ("challengesContent", CHALLENGES_CONTENT),
    ("curifyTitle", CURIFY_TITLE),
    ("curifyContent", CURIFY_CONTENT),
    ("conclusionTitle", CONCLUSION_TITLE),
    ("conclusionContent", CONCLUSION_CONTENT),
])


def upsert_blogs_json() -> None:
    path = REPO / "public" / "data" / "blogs.json"
    data = json.loads(path.read_text())
    data = [b for b in data if b.get("slug") != SLUG]
    data.insert(0, BLOG_ENTRY)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"✓ blogs.json — upserted {SLUG} at index 0")


def upsert_messages_json() -> None:
    path = REPO / "messages" / "en" / "blog.json"
    data = json.loads(path.read_text(), object_pairs_hook=OrderedDict)
    if KEY in data:
        del data[KEY]
    data[KEY] = MESSAGES_ENTRY
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    wc = sum(len(str(v).split()) for v in MESSAGES_ENTRY.values() if isinstance(v, str))
    print(f"✓ messages/en/blog.json — upserted {KEY}  (~{wc} words)")


if __name__ == "__main__":
    upsert_blogs_json()
    upsert_messages_json()
    print("\nNext:")
    print("  1. Edit blog-config.ts (namespaceMap + availableKeys)")
    print("  2. Edit blog-related-hubs.ts")
    print(f"  3. Run: node scripts/i18n_autotranslate.cjs blog {KEY}")
