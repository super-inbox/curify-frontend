"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Search,
  FileText,
  Captions,
  Sparkles,
  ImageIcon,
  Store,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import { useTracking } from "@/services/useTracking";

/**
 * Omni-Input Launcher — the "Source-First Routing" front-door (agentic doc P0-6).
 *
 * One box, three destinations: the user pastes a link, types an idea, or picks
 * an image start, and we route to the right EXISTING pipeline surface with a
 * proactive set of actions — instead of making them find one of a dozen tools.
 *
 * v1 is deliberately a smart *router* (deep-links to shipped tool routes); it
 * does not yet carry the source into the destination's internal state
 * (prefilling the video modal's URL / seeding the workbench's reference image is
 * the next increment). The pasted URL is still passed as `?src=` so that
 * follow-up is a one-line consume on each destination.
 */

type Chip = { key: string; label: string; icon: LucideIcon; href: string };

const isUrl = (v: string) =>
  /^https?:\/\//i.test(v.trim()) || /(?:youtube\.com|youtu\.be)/i.test(v.trim());

export default function HomeOmniInput() {
  const t = useTranslations("home.omni");
  const router = useRouter();
  const { track } = useTracking();
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const detectedUrl = trimmed.length > 0 && isUrl(trimmed);
  const detectedText = trimmed.length > 0 && !detectedUrl;

  const go = (href: string, kind: string) => {
    track({ contentId: `omni:${kind}`, contentType: "tool_card", actionType: "click" });
    router.push(href);
  };

  // URL detected → Education / Marketing pipeline (video tools accept a link).
  const urlChips: Chip[] = useMemo(() => {
    const src = `?src=${encodeURIComponent(trimmed)}`;
    return [
      { key: "summary", label: t("chips.summary"), icon: Sparkles, href: `/tools/video-summarizer${src}` },
      { key: "transcript", label: t("chips.transcript"), icon: FileText, href: `/tools/video-transcript-generator${src}` },
      { key: "subtitles", label: t("chips.subtitles"), icon: Captions, href: `/tools/bilingual-subtitles${src}` },
    ];
  }, [trimmed, t]);

  // Persistent "start from an image" row → Merch / E-commerce pipelines.
  const imageChips: Chip[] = [
    { key: "ecommerce", label: t("chips.ecommerce"), icon: Store, href: "/tools/ecommerce-photo" },
    { key: "poster", label: t("chips.poster"), icon: ImageIcon, href: "/tools/ai-product-photo-generator" },
    { key: "product-video", label: t("chips.productVideo"), icon: Clapperboard, href: "/tools/product-video" },
  ];

  const onSubmit = () => {
    if (!trimmed) return;
    if (detectedUrl) {
      go(urlChips[0].href, "url-enter"); // Enter defaults to the first (summary) action
    } else {
      go(`/search?q=${encodeURIComponent(trimmed)}`, "text-enter");
    }
  };

  const chipCls =
    "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-700 hover:shadow-md";

  return (
    <section className="mt-2">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900">{t("heading")}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>

        {/* The box */}
        <div className="mt-4 flex items-stretch gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!trimmed}
            aria-label={t("go")}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-purple-600 px-5 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">{t("go")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Proactive suggestions for what was typed/pasted */}
        {detectedUrl && (
          <div className="mt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t("urlLead")}
            </div>
            <div className="flex flex-wrap gap-2">
              {urlChips.map((c) => {
                const Icon = c.icon;
                return (
                  <button key={c.key} type="button" onClick={() => go(c.href, `url:${c.key}`)} className={chipCls}>
                    <Icon className="h-4 w-4 text-purple-600" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {detectedText && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(trimmed)}`, "text")}
              className={chipCls}
            >
              <Search className="h-4 w-4 text-purple-600" /> {t("searchFor", { q: trimmed.slice(0, 40) })}
            </button>
          </div>
        )}

        {/* Persistent image-start row (image source-carry is the next increment) */}
        <div className="mt-4 border-t border-neutral-100 pt-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("imageLead")}
          </div>
          <div className="flex flex-wrap gap-2">
            {imageChips.map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.key} type="button" onClick={() => go(c.href, `image:${c.key}`)} className={chipCls}>
                  <Icon className="h-4 w-4 text-purple-600" /> {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
