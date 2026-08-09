# Brand Direction Explorer — Real-Effect Validation: Final Report

**Date:** 2026-08-07
**Branch:** `baobao/brand-direction-explorer-tool-demo-2026-08-04`
**Overview / visual index:** [README.md](./README.md)

## 1. Implementation scope

Replaced the Brand Direction Explorer's Stage 1 (creative-direction
generation) from hand-curated static content to a real, live call to OpenAI
(`gpt-4o-mini`). Stage 2 (final image generation) was intentionally left
untouched — it continues to use the existing Gemini-backed Curify
image-generation backend.

### Files changed (exactly six)

| File | Type | Change |
|---|---|---|
| `lib/brandDirectionOpenAI.ts` | new | Server-only module (`import "server-only"`). Sole caller of OpenAI for this feature. Builds the prompt from case/field metadata, calls `gpt-4o-mini` (`temperature: 0.9`), parses and validates the JSON response into exactly three `GeneratedCreativeDirection` objects, retries once on malformed JSON (max 3 attempts), maps rate-limit/timeout/upstream errors to sanitized failure kinds (`missing_api_key`, `invalid_input`, `rate_limited`, `timeout`, `upstream_error`). No static/hardcoded direction content exists anywhere in this module or anything it imports — the failure branch returns only a sanitized error string, never fallback content. |
| `app/api/brand-direction-explorer/directions/route.ts` | new | `POST /api/brand-direction-explorer/directions`. The only caller of `lib/brandDirectionOpenAI.ts`. Validates `{ caseId, fieldValues }` against the case's own `inputFields` metadata (required/maxLength — no separate validation schema), then calls `generateCreativeDirections()`. Returns `{ success: true, directions }` (200) or `{ success: false, error }` with a status mapped from the failure kind (400/500/502/503/504). Not gated on login/credits — direction browsing has always been pre-login content. `runtime = "nodejs"`, `dynamic = "force-dynamic"`. |
| `lib/brand_direction_explorer.ts` | modified | Removed all static/hand-written direction content per case (previously baked-in `CreativeDirection[]` per case). Cases now carry only metadata (`inputFields`, `outputFormat`, prompt-building helpers) used to construct the OpenAI prompt (`buildProjectBrief`) and to validate field submissions. Added a new `brandDescription` field (400-char max) to the `tea-brand-exploration` case (see §4, field-schema fix). |
| `app/[locale]/(public)/brand-direction-explorer/BrandDirectionExplorerClient.tsx` | modified | Client component reworked to fetch directions from the new API route (debounced ~600ms on field changes) instead of reading a static per-case list. Added `directions`/`directionsLoading`/`directionsError` state, a fetch-sequence guard against out-of-order responses, and loading/error/retry UI copy (en/zh). Preview swatches/gradients are now generic per case-kind (placeholder vs. preset-reference) rather than keyed to now-model-generated direction ids. Updated the FAQ copy to state directions are generated in real time by OpenAI (previously stated they were hand-curated). This component only ever calls the internal API route — it does not and cannot import `lib/brandDirectionOpenAI.ts` directly (that module is `server-only`-guarded, which would fail the build on a client-side import). |
| `lib/__tests__/brand_direction_explorer.test.ts` | modified | Updated to match the metadata-only shape of `lib/brand_direction_explorer.ts` (no more static direction fixtures to assert against); added coverage for the new `brandDescription` field on the tea case. |
| `lib/__tests__/brandDirectionOpenAI.test.ts` | new | Covers `generateCreativeDirections()`: success path, malformed-JSON retry-then-success, retry exhaustion, rate-limit mapping, timeout mapping, missing-API-key short-circuit (no model call), and empty/blank required-field rejection before any model call. |

## 2. Test and build verification

- **Unit tests: 54/54 passed.**
  ```
  npx vitest run --config vitest.unit.config.ts \
    lib/__tests__/brand_direction_explorer.test.ts \
    lib/__tests__/brandDirectionOpenAI.test.ts

  ✓ |unit| lib/__tests__/brand_direction_explorer.test.ts (33 tests)
  ✓ |unit| lib/__tests__/brandDirectionOpenAI.test.ts (21 tests)
  Test Files  2 passed (2)
       Tests  54 passed (54)
  ```
  (The repository's default `vitest.config.ts` also wires up a Storybook
  test project that requires a `.storybook/main.js` this checkout does not
  have; running against `vitest.unit.config.ts` directly avoids that
  unrelated failure and is the correct config for these two suites.)

- **`npm run build`: passed (exit 0).** The new route appears in the build
  output as `ƒ /api/brand-direction-explorer/directions` (dynamic, 223 B).

- **`npm run lint`: did not run cleanly — blocked by a pre-existing
  repository ESLint configuration mismatch, unrelated to this change:**
  ```
  tseslint.config(): Config at index 0 (anonymous) has an 'extends' array
  that contains a string ("next/core-web-vitals") at index 0. This is a
  feature of eslint's `defineConfig()` helper and is not supported by
  typescript-eslint. Please provide a config object instead.
  ```
  This is a `next lint` / `typescript-eslint` config-shape incompatibility
  in the repository's existing ESLint setup, not something introduced by
  the six files above.

## 3. Real end-to-end validation — three cases

All three cases were run against the actual local Next.js dev server
(`POST http://localhost:3000/api/brand-direction-explorer/directions`),
not mocks. Each case is archived in its own directory alongside this
report with `input.txt` (what was submitted), `notes.txt` (full run notes),
`stage1-directions.json` (raw API response), a Stage 1 screenshot, and two
Stage 2 final-image variants.

| Case | Directions returned | Round-trip latency | Titles distinct? |
|---|---|---|---|
| 01 — Morrow Coffee (coffee-opening) | `warm-invitation`, `minimalistic-appeal`, `artistic-collage` | ~10.55s | No — all 3 shared `title.en` "Morrow Coffee" (subtitle/tags differed) |
| 02 — 山岚茶事 / Shanlan Tea (tea-brand-exploration) | `modern-minimalism`, `earthy-elegance`, `contemporary-vibrance` | ~8.63s (corrected run) | Yes |
| 03 — Afterglow Market (event-poster) | `vibrant-abstract`, `retro-vinyl`, `minimalist-geometric` | ~8.84s | Yes |

Every case returned **exactly three** directions with unique ids, HTTP 200,
and no static fallback content — confirmed by inspecting
`lib/brand_direction_explorer.ts`, which carries no direction content for
any case; the only path to a direction is `generateCreativeDirections()` in
`lib/brandDirectionOpenAI.ts`. No secret values (API key, cookies,
credentials, authorization headers) appeared in any terminal or browser
output across any of the three runs.

Each case's Stage 2 (final image generation) was run independently by the
user through the browser UI against the existing Gemini-backed backend
(`useFreeformGenerate` → the pre-existing `/nano-freeform/generate` path),
producing two retained variants per case (primary + alternative). This
session did not independently verify which of the three Stage 1 directions
was selected for each Stage 2 image, or whether the two images came from
two separate direction selections vs. one generation + one regenerate —
that is documented based on the user's description and visual inspection of
the resulting files, not directly observed via this session's own API
calls.

## 4. Tea case: zero-cost validation error, then field-schema fix

The `tea-brand-exploration` case originally had only two input fields:
brand name and a `productType` field capped at 80 characters. The user's
brief for 山岚茶事 did not fit that shape — it included a brand name, a
long brand description, applications, and desired tone, with no short
"product type" at all.

- **First attempt:** the long description was submitted into the 80-char
  `productType` field and correctly failed client-side/route validation
  with a real HTTP 400 before any OpenAI call was made — **zero API cost**.
- **Fix (with user approval):** added a new `brandDescription` field
  (400-char max) to the tea case in `lib/brand_direction_explorer.ts`,
  updated the tea case's base brief and prompt construction, updated the
  affected unit tests, rebuilt, restarted the dev server, and re-verified
  with a zero-cost validation-only request before re-running for real.
- **Re-verification after the fix:** `vitest` (54/54 pass) and `npm run
  build` (exit 0) were re-run after this change, matching the same
  before/after verification done for the coffee-case field expansion
  earlier in this work.
- **Corrected run result:** the tea case then completed successfully —
  HTTP 200, ~8.63s round-trip, three unique directions
  (`modern-minimalism`, `earthy-elegance`, `contemporary-vibrance`), UI
  confirmed by the user (spinner, then three real direction cards). The
  archived screenshot for this case,
  [`02-shanlan-tea/stage1-directions-full-page-corrected.png`](./02-shanlan-tea/stage1-directions-full-page-corrected.png),
  is this corrected post-fix run; there is no separate pre-fix screenshot
  in this report since the pre-fix attempt never reached direction
  rendering (it failed validation before any UI directions state existed).

## 5. Stage 1 vs. Stage 2 generation paths — exact separation

- **Stage 1 (creative directions):**
  `BrandDirectionExplorerClient.tsx` (client)
  → `POST /api/brand-direction-explorer/directions` (`app/api/brand-direction-explorer/directions/route.ts`, server)
  → `generateCreativeDirections()` in `lib/brandDirectionOpenAI.ts` (server-only)
  → OpenAI `gpt-4o-mini`.
  This is the only path introduced/changed by this work.

- **Stage 2 (final image):**
  `BrandDirectionExplorerClient.tsx` (client)
  → `services/useFreeformGenerate.ts` (pre-existing, unchanged)
  → the existing Gemini-backed Curify image-generation backend
  (`/nano-freeform/generate`, `google-genai` / `GEMINI_IMAGE_MODEL`, via
  `curify-studio/curify_background`).
  **Not OpenAI. Not changed by this work.** The final images in this
  report were produced by this pre-existing path, run manually by the
  user through the browser UI for each of the three cases.

## 6. Security / secrets

- No API keys, credentials, cookies, authorization headers, or raw server
  logs are included anywhere in this report directory.
- `logs/dev-server.log` from the source run directory was intentionally
  excluded from this report.
- `.env.local` was not read, modified, copied, or referenced by this work.

## 7. Scope note

No pull request was created as part of this work. This report and the
underlying code changes exist only on the current branch,
`baobao/brand-direction-explorer-tool-demo-2026-08-04`, pending review and
an explicit decision to push.
