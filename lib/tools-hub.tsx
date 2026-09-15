// lib/tools-hub.tsx
//
// Shared tool vocabulary. This file used to also export buildToolsHub(), a
// second card view-model built solely for /tools — which meant the hub rendered
// a different card from every other surface (home strip, /use-cases/[slug], the
// "Other tools" footer), with its own duplicated auth/modal/tracking wiring, and
// the two drifted. 2026-08-30: /tools now renders the shared ToolsGrid from
// groupTools(), and the builder is gone. Only the shared types remain.

// "demo" is a SEO landing page with a working demo + early-access CTA
// but no backend pipeline yet. Card on /tools and card-button both
// navigate to /tools/<slug>; the inside page is responsible for the
// early-access conversion. Distinct from "coming_soon" which renders
// as a disabled card with no destination.
export type ToolStatus = "create" | "demo" | "coming_soon";
export type ToolMode = "translation" | "subtitles";

// "audio" was removed 2026-09-15. It held exactly two tools: voice-clone
// (coming_soon, deleted with the other five that had no page) and
// speech-translator, which moved into "video" — so the group had no members
// left and the hub would have rendered an empty heading.
export type ToolGroupId = "video" | "image" | "design";
