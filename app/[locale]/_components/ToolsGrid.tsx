"use client";

// Shared tool-card grid used on /tools, /use-cases/[slug], and the
// "Other tools" footer of /tools/[slug]. Same visual treatment across
// surfaces so the tools landing page card is the single source of truth.
//
// Auth + modal wiring lives here (instead of being duplicated in each
// caller) — every caller just passes a list of ToolDefs to render.
//
// 2026-08-16 — THE WHOLE CARD IS THE CONTROL. Previously each card carried its
// own CTA button ("Create" / "See demo") inside a card that was *also* clickable,
// which meant two hit targets doing near-identical things and a lot of vertical
// space spent saying what the card already implied. Now one card = one action,
// by status:
//
//   create       → card navigates to /tools/<slug>; the footer "Create →" button
//                  is what opens the dialogue
//   demo         → click goes to the tool page / demo
//   coming_soon  → click saves it as a demand signal (login required)
//
// 2026-09-22 — `create` CARDS NOW LINK TO THE TOOL PAGE. They used to be a
// bare <button> that opened the dialogue and never navigated, which meant the
// six create-status tools (video-dubbing, bilingual-subtitles,
// video-transcript-generator, video-summarizer, asl-video-translator,
// speech-translator) had NO link to their own /tools/<slug> page from anywhere
// this grid renders — /tools, the home strip, use-case pages, tool-page
// footers. Measured on the live site: /tools linked 17 of 23 tool pages, and
// the six missing ones include four of the five highest-traffic tool pages in
// GSC. Those pages carry the long-form copy and the bulk/batch callout, so the
// links are worth having for crawlers as much as for readers.
//
// The card is a "stretched link": an absolutely-positioned <Link> covering the
// card, with the Create button layered above it. A <button> nested inside an
// <a> would be invalid HTML, so the two controls are siblings, not nested.
//
// Each card keeps a small text affordance in the footer so the action is still
// legible before you click — it is a hint, not a second hit target.
//
// Click tracking: every card click fires one `tool_card` interaction with the
// tool id. Coming-soon saves additionally fire a `favorite` — that is the
// signal-collection mechanism, see below.

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import {
  modalAtom,
  userAtom,
  drawerAtom,
  clientMountedAtom,
  createJobContextAtom,
} from "@/app/atoms/atoms";
import { isInlineTool, type ToolDef } from "@/lib/tools-registry";
import { useTracking } from "@/services/useTracking";

type Props = {
  tools: ToolDef[];
  /** Override the responsive grid template — defaults to the 4-up grid
   *  used on /tools. /use-cases/[slug] passes a 2-up grid since it
   *  typically shows ≤4 tools and a wider card reads better. */
  gridClassName?: string;
};

const DEFAULT_GRID =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4";

export default function ToolsGrid({ tools, gridClassName }: Props) {
  const [, setModalState] = useAtom(modalAtom);
  const [, setCreateJobCtx] = useAtom(createJobContextAtom);
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);
  const t = useTranslations();
  const { trackAction, track } = useTracking();

  // Which coming-soon tools this visitor has registered interest in. Local
  // only — the durable record is the `favorite` interaction event, which is
  // what makes this a demand signal we can actually query later.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const trackToolClick = (toolId: string) => {
    trackAction(
      { contentId: toolId, contentType: "tool_card", viewMode: "cards" },
      "click",
    );
  };

  const openToolModal = (tool: ToolDef) => {
    trackToolClick(tool.id);
    if (!user) {
      track({ contentId: `auth-modal:tool-launch:${tool.id}`, contentType: "topic_capsule", actionType: "click" });
      setDrawerState("signin");
      return;
    }
    setCreateJobCtx({ toolId: tool.id, slug: tool.slug, job_type: tool.job_type });
    setModalState("add");
  };

  /** Coming-soon card click = "I want this", gated on login.
   *
   *  The login gate is the point, not friction for its own sake: an anonymous
   *  click tells us a tool is interesting, a signed-in save tells us WHO to go
   *  back to when it ships. That is the difference between a counter and a
   *  waitlist. */
  const saveComingSoon = (tool: ToolDef) => {
    trackToolClick(tool.id);
    if (savedIds.has(tool.id)) return;
    if (!user) {
      track({
        contentId: `auth-modal:tool-interest:${tool.id}`,
        contentType: "topic_capsule",
        actionType: "click",
      });
      setDrawerState("signin");
      return;
    }
    setSavedIds((prev) => new Set(prev).add(tool.id));
    trackAction(
      { contentId: tool.id, contentType: "tool_card", viewMode: "cards" },
      "favorite",
    );
  };

  return (
    <div className={gridClassName ?? DEFAULT_GRID}>
      {tools.map((tool) => {
        const showFreeBadge = !!tool.i18n.showFreeBadge;
        // `title` can be JSX (free badge), so keep a plain string for aria.
        const plainTitle = t(tool.i18n.titleKey);
        const title = showFreeBadge ? (
          <span>
            {t(tool.i18n.titleKey)}{" "}
            <span className="font-bold text-red-600">{t("tools.free_badge")}</span>
          </span>
        ) : (
          t(tool.i18n.titleKey)
        );
        const desc = t(tool.i18n.descKey);

        const canCreate = tool.status === "create";
        const isComingSoon = tool.status === "coming_soon";
        const isInline = isInlineTool(tool);
        const isSaved = savedIds.has(tool.id);

        // Footer affordance — small, so the card stays compact, but present so
        // the action is legible before the click.
        const hint = canCreate
          ? t("tools.create")
          : isComingSoon
            ? isSaved
              ? t("actionButtons.saved")
              : t("actionButtons.save")
            : isInline
              ? t("tools.create")
              : t("tools.see_demo");

        const hintClass = canCreate || isInline
          ? "text-[#5a50e5]"
          : isComingSoon
            ? isSaved
              ? "text-green-600"
              : "text-blue-500"
            : "text-purple-700";

        // Footer affordance content, shared by all three card kinds. On
        // `create` cards it becomes the label of a real button; elsewhere it is
        // inert text inside the surrounding link.
        const hintContent = (
          <>
            {isComingSoon && (
              <span className="mr-1 font-normal italic text-blue-500">
                {t("tools.coming_soon")}
              </span>
            )}
            <span className="group-hover:underline">
              {isComingSoon && isSaved ? `✓ ${hint}` : hint}
            </span>
            {!isComingSoon && <span aria-hidden="true">→</span>}
            {/* Lock only where signing in is actually required to proceed. */}
            {clientMounted && !user && (canCreate || isComingSoon) && !isSaved && (
              <span className="ml-1 opacity-70" aria-hidden="true">🔒</span>
            )}
          </>
        );

        const card = (
          <div
            className={`group relative flex h-full flex-col rounded-xl border border-gray-100 bg-[linear-gradient(135deg,_#E0E7FF_0%,_#F0F4FF_100%)] p-4 text-left shadow-md transition-shadow hover:shadow-lg ${
              isComingSoon && isSaved ? "ring-1 ring-green-300" : ""
            }`}
          >
            <h3 className="mb-1 text-base font-bold leading-snug text-gray-900">
              {title}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
              {desc}
            </p>

            {/* The card-wide hit target for `create` tools. Covers the card so
                anywhere outside the Create button navigates to the tool page,
                and is a real <a> so crawlers follow it too — which is the point
                of the change. The other two kinds are wrapped by their own
                outer element below, so they do not need it. */}
            {canCreate && (
              <Link
                href={`/tools/${tool.slug}`}
                onClick={() => trackToolClick(tool.id)}
                aria-label={plainTitle}
                className="absolute inset-0 rounded-xl"
              />
            )}

            <div
              className={`mt-3 flex items-center gap-1 text-xs font-semibold ${hintClass} ${
                // Let clicks in the footer's empty space fall through to the
                // stretched link; only the button itself takes them back.
                canCreate ? "pointer-events-none relative" : ""
              }`}
            >
              {canCreate ? (
                <button
                  type="button"
                  onClick={() => openToolModal(tool)}
                  className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 hover:underline"
                >
                  {hintContent}
                </button>
              ) : (
                hintContent
              )}
            </div>
          </div>
        );

        // (a) live tools — the card links to the tool page, the footer button
        // opens the dialogue. No outer wrapper: both controls live inside.
        if (canCreate) {
          return <div key={tool.id}>{card}</div>;
        }

        // (c) coming soon — the card IS the save/interest control.
        if (isComingSoon) {
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => saveComingSoon(tool)}
              aria-pressed={isSaved}
              className="block h-full w-full cursor-pointer text-left"
            >
              {card}
            </button>
          );
        }

        // (b) demo tools — the card navigates, no separate CTA.
        return (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}${isInline ? "#reproduce" : ""}`}
            onClick={() => trackToolClick(tool.id)}
            className="block h-full hover:no-underline"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
