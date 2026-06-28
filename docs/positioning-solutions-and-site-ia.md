# Curify Positioning — Solutions, Platform Capabilities & Site Manifestation

> Filed 2026-06-27. Source: founder strategy note (this is the canonical writeup).
> Purpose: a single positioning frame that guides **website IA** and **marketing**.
> Key constraint: we already have the surfaces (use-cases, tools, topics, search,
> gallery) — this is a **better-manifestation** layer, not new scaffolding.

---

## 1. Master positioning (one line)

> **Curify is a Visual Content Infrastructure platform that helps creators and
> businesses search, generate, localize, and scale visual content across design,
> education, marketing, and commerce.**

Not "an AI image tool" (too small), not "we do everything" (too vague). The
shape is: **one platform of shared capabilities → packaged as a few Solutions
per workflow.** Externally we sell **Solutions**, not Features.

---

## 2. The model: Infrastructure + Solutions, positioned by Workflow

**5 platform capabilities (the roadmap axis — build around these, not products):**

| Capability | Why it exists | Powers |
|---|---|---|
| **Visual Search** | find inspiration / templates / cases | Merch, Education, SEO |
| **Assetization** | extract reusable assets from an image (subject, text, style, tags) | Search, Recommendation, Knowledge Base |
| **Generation** | image / video / template generation | All Solutions |
| **Localization** | translation, multilingual, subtitles | Education, Video, SEO |
| **Distribution** | API, SEO, content engine, batch publishing | Enterprise, Agencies |

**Position by Workflow, not by Model.** Peers brand by model (Midjourney=image,
Runway=video, ElevenLabs=voice, HeyGen=avatar). Curify brands by the job:

| Workflow | Curify position |
|---|---|
| Find inspiration | Search + Asset Library |
| Understand designs | Assetization + Tags |
| Create visuals | AI Templates + Generation |
| Adapt for production | Typography + Print-ready + Mockups |
| Scale globally | Translation + SEO + API |

The user isn't here to "make an image" — they're here to **finish a job.**

---

## 3. The 6 Solutions (+ how each is manifested today)

| Solution | Target customer | One-liner | Core workflow | Core capabilities | Competitors |
|---|---|---|---|---|---|
| **Merch Design & POD** | POD sellers, gift cos, museums, brand IP, print shops | Turn one idea into 100 production-ready products. | Inspiration → Design → Typography → Mockup → Print | Search, Templates, AI Image, Transparent PNG, Product Mockup, Asset Library | Canva, Kittl, Midjourney, Placeit |
| **Visual Search & Inspiration** | Designers, creative teams, agencies | Find reusable design inspiration instead of endless scrolling. | Search → Discover → Reuse → Generate | Search, Asset Extraction, Style Tags, Templates | Pinterest, Behance, Dribbble |
| **Education Content Studio** | Teachers, publishers, homeschool, EdTech | Create bilingual educational content at scale. | Topic → Flashcards → Posters → Worksheets → Localization | Templates, Image Gen, Translation, Asset Library | Canva Education, Twinkl |
| **Video Localization** | YouTubers, TikTok creators, marketing teams | Localize one video for global audiences. | Video → Subtitle → Translation → Burn-in → Publish | Subtitle, Translation, Video Gen | Captions, VEED, HeyGen |
| **Visual Content Engine** | SEO agencies, DTC brands, enterprise marketing | Generate & maintain multilingual visual content for every landing page. | Keywords → Images → Translation → Distribution | Image Gen, SEO, Translation, API | Jasper, Canva, programmatic-SEO tools |
| **Developer APIs** | AI startups, SaaS companies | Add visual AI to your product in days, not months. | API → Integration → Production | Image API, Video API, Translation API, Search API | Replicate, Fal, Stability API |

### Manifestation map — Solution → existing surfaces (the (b) point)

| Solution | Existing page(s) that ARE the landing page | Tools / proof | Gap to close |
|---|---|---|---|
| Merch Design & POD | `/use-cases/for-merch-operators` (+ `for-dtc-brands`) | `ai-product-photo-generator`, image2image + `template_workflows` (merch-mockup), ip-merch-demo; Customer-Delivery workstream | transparent-PNG + print-ready export; asset library framing |
| Visual Search & Inspiration | `/use-cases/for-designers` (+ `for-creators`); **`/search`** + gallery + `/topics/*` | intent routing (`searchTemplateMatch`), eval frameworks | Assetization (extract subject/text/style) is thin |
| Education Content Studio | `/use-cases/for-parents`, `for-esl-learners`, `for-publishers` | `bilingual-subtitles`, `speech-translator`, transcript; learning/language templates; education workstream | "Studio" packaging (flashcards/worksheets bundle) |
| Video Localization | `/use-cases/for-creators`, `for-marketers` | `TOOL_REGISTRY` video group (10 tools) — **shipped + traffic** | burn-in/publish polish; clearest proven solution |
| Visual Content Engine | `/use-cases/for-marketers`, `for-dtc-brands`, `for-programmatic-seo` | our own nano-gen + programmatic-SEO + autopost factory (10-locale) | **productize** the internal engine for customers |
| Developer APIs | — (no page yet) | backend pipelines exist; no public API product | **net-new**: keys, docs, rate-limiting, pricing |

Persona pages already carry `tier` (consumer/b2b) and `toolSlugs` in
`lib/use-cases.ts` — i.e. the audience routing + tool proof is half-built. The
work is alignment + naming, not new infra.

---

## 4. Maturity tiers (don't present all 6 as equally ready)

- **Proven (lead with these):** Video Localization (live tools + traffic),
  Visual Search (live `/search` + gallery).
- **Active build (real, show demos):** Merch Design & POD, Education Content Studio.
- **Early access / "talk to us" (don't imply a shipped product):** Visual Content
  Engine (internal engine, needs productizing), Developer APIs (aspirational).

Over-promising the **Developer API** is the biggest credibility risk — gate it
behind a waitlist/contact, not a "Get API key" CTA, until it's real.

---

## 5. Website IA (the manifestation)

**Homepage = 6 entry points by user type** (first message per the founder note):

| Entry | First message |
|---|---|
| 🎁 Merch & POD | Turn one character into 100 products. |
| 🎨 Designers | Find better design inspiration in seconds. |
| 📚 Education | Create bilingual learning content at scale. |
| 🎬 Video Creators | Translate and subtitle videos for global audiences. |
| 🌍 Marketing & SEO | Build multilingual visual content that ranks. |
| ⚙️ Developers | Integrate visual AI into your own product. |

**Each entry → a Solution landing page** = the **upgraded use-case page**
(problem → outcome → workflow → live demo/proof from tools+gallery+topics → CTA).
**Nav** reorganizes around Solutions (top) with Tools as the capability/proof
layer beneath. Topics + gallery + search stay as the discovery substrate feeding
Visual Search + Merch + Education.

So the build is: (1) homepage solution grid, (2) align the 6 persona pages to the
6 Solution names + one-liners + workflow, (3) add the two missing pages
(Visual Content Engine, Developer APIs — the latter as waitlist).

---

## 6. References
- Personas + tiers + tool mapping: `curify-frontend/lib/use-cases.ts`
- Tools: `curify-frontend/lib/tools-registry.ts` (16 tools; video/image/audio)
- Search / Visual Search: `curify-frontend/lib/searchTemplateMatch.ts`, `/search`,
  eval `docs/eval-framework-visual-intent-routing-2026-06-15.md`
- Generation + workflows: `lib/gallery_production_tiles.tsx`, `lib/template_workflows.tsx`,
  `curify_background/app/pipelines/nano_*`
- Workstreams: [`workstream-customer-delivery-pipeline.md`](workstream-customer-delivery-pipeline.md)
  (Merch), [`workstream-education-content-supply.md`](workstream-education-content-supply.md)
  (Education), [`workstream-tooling-and-engineering.md`](workstream-tooling-and-engineering.md) (tools/engine),
  [`workstream-agentic-image-rong.md`](workstream-agentic-image-rong.md) (Search/Assetization R&D)
