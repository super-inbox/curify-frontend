# Pinterest landing and generation funnel repair

Legacy Pinterest template URLs with a known `utm_content` now redirect (307) to
that exact example, retaining locale and campaign parameters. The small edge
allowlist contains published examples present in this checkout's bundled corpus.
Unknown IDs, mismatched templates, topic hubs without an example ID, and existing
example URLs do not redirect. Update the allowlist when publishing more examples;
new Pins should always use the exact example URL directly.

On mobile, the shared workbench has a “Make your own” entry before the image and a
280px source preview. The entry and carousel customization link target `#customize`,
keeping the selected example's parameter prefills. Upload-required templates also
use this route. Desktop generation remains in the existing workbench.

## Events

`generation:<stage>:<contentId>` uses the existing backend `menu_link` content type.
`entry_view` and `cta_view` use action `view`, emitted once per mounted target when
at least half the control intersects the viewport. Other stages use action `click`:

- `entry_click`, `params_edit` (first changed field per mounted target; no values)
- `attempt`, `auth_required`, `auth_resumed`, `credits_required`
- `duplicate`, `reused` (existing image handed to a result surface)
- `request` (network submission attempted), `success` (result returned), `failure`

Both direct-template and freeform/output-format generation emit lifecycle stages.
An automatic auth resume is not a second attempt. Existing login/signup milestones
remain in `funnelEvents.ts`. Do not add the legacy `generate` event to `request`:
they describe the same submission. Prompt copying now emits `copy`, not `generate`.
Deduplicate funnel stages by session/user and target. These events do not provide
cross-device attribution or a durable server-side job completion guarantee; the
client must remain open through polling. Correlate completed projects separately.

## Validation and rollout

Regression tests cover exact/localized legacy redirects, unsafe or mismatched IDs,
anonymous auth resume, credit gates, duplicate reuse, async completion and in-flight
request deduplication, error paths, output-format generation, visible CTA exposure,
mobile anchor destination, parameter-edit privacy and prompt-copy semantics.
Run with `vitest run --config vitest.unit.config.ts` and the three test files:
`pinterestLanding.test.ts`, `generationFunnel.test.ts`, `pinterestWorkbench.test.ts`.
Also run `tsc --noEmit --incremental false` and `git diff --check`.

Browser connection was unavailable for this change. Before production release,
check 390px and desktop widths, carousel → selected example → customization,
required upload, Google/email login in Pinterest's in-app browser, and the live
tracking requests. No production generation was triggered during testing.

Code is pushed to an independent branch only; it has not been merged or deployed.
Pinterest API rejected live Pin edits with `pin_edit` unavailable. The separate GTM
branch holds the verified 68-Pin audit and 55 pending corrections. Do not report
those pending changes as saved until a browser edit and subsequent API GET agree.
