"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Wand2, Loader2, Download, ArrowUpRight, ChevronDown, Copy } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import LanguagePairSelector from "@/app/[locale]/_components/LanguagePairSelector";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import { fillPrompt } from "@/lib/nano_pure";
// Use the superset TemplateParameter (adds "daterange" + array placeholder) so
// both the example page (nano_pure params) and the template-detail page
// (nano_prompt_utils params) assign cleanly.
import { normalizePrefills, type TemplateParameter } from "@/lib/nano_prompt_utils";
import type { ExistingExampleRef } from "@/lib/editDistance";
import { useDirectGenerate } from "@/services/useDirectGenerate";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";
import { getTemplateWorkflows, videoShowWorkflow, packPdfWorkflow } from "@/lib/template_workflows";
import { getPackTiers } from "@/lib/template_packs";
import { getOutputIntent } from "@/lib/output_intent";
import { resizeToSocialBundle, resizeToAspect, sliceIntoGrid, makePrintReady, SOCIAL_ASPECTS } from "@/lib/resize_bundle";
import { templatePacksService } from "@/services/templatePacks";
import { userAtom, clientMountedAtom, drawerAtom, modalAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

const CREDITS_COST = IMAGE_GENERATION_CREDITS;

/**
 * Column-1 configuration. The 3-column workbench is shared across surfaces; the
 * only real difference is what column 1 holds:
 *   - "source": a static image (the example / og image) + action bar. The
 *     reference-image upload (for image2image templates) lives in column 2.
 *     This is the example-page arrangement.
 *   - "upload": column 1 IS the reference-image upload (image2image template
 *     detail + the ecommerce-photo tool). Column 2 is then just the prompt
 *     preview + Generate.
 */
export type WorkbenchCol1 =
  | {
      mode: "source";
      image: ReactNode;
      sourceReferenceUrl: string;
      copyText: string;
      shareUrl: string;
      title: string;
      batchEnabled?: boolean;
    }
  // `optional: true` = the upload is offered but NOT required — the user can
  // generate from parameters alone (text→image) OR upload their own product photo
  // to apply the template to it (image→image). Used for product / e-commerce /
  // photography templates so visitors can drop in their own product (2026-08-19).
  | { mode: "upload"; label?: string; hint?: string; hideUploadLabel?: boolean; optional?: boolean }
  // A finished project result opens in the workbench: column 1 shows the output,
  // column 3 (designer pack) operates on it, and column 2 is HIDDEN — a loaded
  // project carries no template/params to drive parametric regeneration (that's a
  // later phase). See docs/image-workflow-page-design-2026-07-11.md.
  | {
      mode: "result";
      image: ReactNode;
      resultUrl: string;
      title: string;
      downloadHref?: string;
    };

type Props = {
  locale: string;
  templateId: string;
  /** Per-locale description, kept in the DOM (sr-only) for SEO. */
  description?: string;
  parameters: TemplateParameter[];
  initialParams: Record<string, string>;
  basePrompt: string;
  allowGeneration: boolean;
  requiresImageUpload?: boolean;
  existingExamples?: ExistingExampleRef[];
  useCaseFilter?: readonly string[];
  /** content_id for tracking (example page: `${templateId}:${exampleId}`; others: templateId). */
  trackingContentId: string;
  /** Template-level intro video (relative CDN path). When present, column 3 gets
   *  a zero-cost "Watch video" tile that reveals this already-rendered MP4. */
  introVideoUrl?: string;
  col1: WorkbenchCol1;
};

// `kind` distinguishes a PRIMARY result (the main column-2 generation, or a
// loaded project result) from a DERIVATIVE (a designer-pack output: resize,
// print-ready, icon set, IG tiles, etc.). Designer-pack transforms always run
// off the latest PRIMARY (the "hero"), never the previous derivative — so
// applying several design tiles in a row each operates on the hero, not on the
// output of the tile before it. See issue (c), 2026-07-15.
type ResultItem = { id: string; url: string; label: string; kind: "primary" | "derivative" };

// Column-2 parameter ergonomics: collapse the list past this many params
// (rest behind a "Show N more" toggle), and switch a free-text field to a
// wrapping textarea once its value/placeholder exceeds this many chars.
const PARAM_COLLAPSE_AT = 6;
const LONG_VALUE_CHARS = 60;

export default function ReproduceWorkbench({
  locale,
  templateId,
  description,
  parameters,
  initialParams,
  basePrompt,
  allowGeneration,
  requiresImageUpload = false,
  existingExamples = [],
  trackingContentId,
  introVideoUrl,
  col1,
}: Props) {
  const t = useTranslations("actionButtons");
  const { trackAction, track } = useTracking();
  const [user] = useAtom(userAtom);
  const [clientMounted] = useAtom(clientMountedAtom);
  const [, setDrawer] = useAtom(drawerAtom);
  const [, setModal] = useAtom(modalAtom);

  // Seed empty params from their placeholder/default so a required field is
  // never sent blank (some examples ship empty values + have no picker).
  const [form, setForm] = useState<Record<string, string>>(() => {
    const seeded: Record<string, string> = { ...initialParams };
    for (const p of parameters) {
      if (!seeded[p.name] || !seeded[p.name].trim()) {
        const { candidates } = normalizePrefills(p.placeholder);
        const fallback = (p as { default?: string }).default || candidates[0];
        if (fallback) seeded[p.name] = fallback;
      }
    }
    return seeded;
  });
  const [results, setResults] = useState<ResultItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Collapse long parameter lists — show the first few, reveal the rest on
  // demand. Hidden params stay in `form` (already seeded), so generation is
  // unaffected; only their inputs are tucked away to keep column 2 scannable.
  const [showAllParams, setShowAllParams] = useState(false);
  const [soonNote, setSoonNote] = useState<string | null>(null);
  // Set when the user taps the "Watch video" tile — reveals the template's
  // already-rendered intro video in column 3 (free, no generation).
  const [shownVideoUrl, setShownVideoUrl] = useState<string | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // (e) A result the user clicked to "move to column 1": it becomes the visible
  // source AND the base every design-work tile builds from. Cleared when a fresh
  // primary generation lands (that becomes the new hero) or via the revert (✕).
  const [promotedUrl, setPromotedUrl] = useState<string | null>(null);
  // (B) The output format the Generate button produces. null = the default
  // "standard image" (base template generation); otherwise a workflow key whose
  // transform runs on Generate. Chosen ABOVE the Generate button.
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  // Chosen ratio for the "Resize for socials" format ("all" = every size).
  const [resizeAspect, setResizeAspect] = useState<string>("1x1");
  const resultSeq = useRef(0);

  const tracking = {
    contentId: trackingContentId,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const pushResult = (
    key: string,
    label: string,
    url: string,
    kind: "primary" | "derivative" = "derivative",
  ) => {
    resultSeq.current += 1;
    setResults((prev) => [{ id: `${key}-${resultSeq.current}`, url, label, kind }, ...prev]);
  };

  const { generate, dismissAndGenerate, isGenerating: directGenerating, duplicateWarning, clearWarning } =
    useDirectGenerate({
      templateId,
      params: form,
      existingExamples,
      tracking,
      referenceImageUrl: referenceImageUrl ?? undefined,
      onSuccess: (signedUrl) => {
        // A fresh primary is the new hero — drop any pinned/promoted result so
        // the design-work tiles build from this generation, not a stale pin.
        setPromotedUrl(null);
        pushResult("generate", "Your generation", signedUrl, "primary");
      },
    });

  const { generate: freeformGenerate, isGenerating: freeformGenerating } = useFreeformGenerate({
    tracking,
    // A design-work tile rejected for credits opens the top-up modal instead of a
    // dead-end alert (matches the PDF-pack path). See (f) 2026-08-19.
    onInsufficientCredits: () => {
      setSoonNote("You're out of credits — top up to run this output format.");
      setModal("topup");
    },
    onStart: (args) => setActiveKey((args.meta?.key as string) ?? null),
    onSuccess: async (url, args) => {
      const key = (args.meta?.key as string) ?? "wf";
      const label = (args.meta?.label as string) ?? "Result";
      // The Instagram 9-grid workflow generates ONE composite 3x3 image; slice it
      // client-side into 9 separate tiles so the user gets 9 post-ready files, not
      // one image they'd have to cut up. Falls back to the composite on failure.
      if (key === "ig-grid") {
        try {
          const tiles = await sliceIntoGrid(url, 3, 3);
          tiles.forEach((t, i) => pushResult(`ig-grid-${i + 1}`, `Grid tile ${i + 1}`, t.url));
          return;
        } catch {
          // CORS/decode failure — fall through and keep the composite.
        }
      }
      pushResult(key, label, url);
    },
    onSettled: () => setActiveKey(null),
  });

  const anyGenerating = directGenerating || freeformGenerating;
  const latestUrl = results[0]?.url ?? null;
  const col1Source =
    col1.mode === "source" ? col1.sourceReferenceUrl
    : col1.mode === "result" ? col1.resultUrl
    : referenceImageUrl ?? "";
  // Reference image for the designer-pack workflows = the "hero": the latest
  // PRIMARY result (the main generation), or — before any generation — the
  // column-1 source (loaded project result / uploaded / source image). It is
  // deliberately NOT `latestUrl`: designer-pack tiles are parallel finishing
  // passes on the hero, so applying several in a row must each read the hero,
  // not the previous tile's derivative output (issue (c), 2026-07-15).
  const heroUrl = results.find((r) => r.kind === "primary")?.url ?? col1Source;
  // A promoted (clicked-to-source) result wins as the transform base — that IS
  // the "move it to column 1" gesture (e): tiles then build on what the user picked.
  const transformSource = promotedUrl ?? heroUrl;
  const workflows = useMemo(() => {
    const base = getTemplateWorkflows(templateId);
    // Education / learning / language templates: the intro video is a readable
    // LESSON asset, so it earns a tile. The intent map tags vocab/dialogue/
    // worksheet as "education" but misses a few language ids (e.g. the HSK
    // reading-lesson poster resolves to "remix") — catch those by id too.
    const educational =
      getOutputIntent(templateId) === "education" ||
      /hsk|reading-(?:text|lesson)|vocab|flashcard|phonics|language|lesson|worksheet|dialogue|bilingual|learn/i.test(
        templateId,
      );
    // Lead the tiles with the concrete deliverables: any downloadable PDF pack
    // (free 5-pack + paid 50/100 via points) first. (c) The zero-cost intro-video
    // reveal tile is kept ONLY for education/learning/language templates (labeled
    // "Read this"); on visual templates the "Watch video" tile competed with the
    // design work, so it's gated out.
    const lead = getPackTiers(templateId).map(packPdfWorkflow);
    if (introVideoUrl && educational) {
      lead.push(videoShowWorkflow(introVideoUrl, { label: "Read this", hint: "Read the lesson" }));
    }
    return [...lead, ...base];
  }, [templateId, introVideoUrl]);

  // (B) Output formats the Generate button can produce (select-then-generate):
  // the image-producing workflows (transform / resize / print-ready). PDF packs
  // and the video-reveal are different-natured quick actions, kept separate.
  const genFormats = useMemo(
    () => workflows.filter((w) => w.kind === "transform" || w.kind === "resize" || w.kind === "print-ready"),
    [workflows],
  );
  const quickActions = useMemo(
    () => workflows.filter((w) => w.kind === "pack-pdf" || w.kind === "video-show" || w.kind === "soon"),
    [workflows],
  );
  const selectedWf = selectedFormat ? genFormats.find((w) => w.key === selectedFormat) ?? null : null;

  const filledPrompt = useMemo(() => fillPrompt(basePrompt, form), [basePrompt, form]);

  // Generate the SELECTED output format: the default (null) is the base template
  // generation (the plain image); any other selection runs that format's transform
  // on the current source/hero.
  const handlePrimaryGenerate = () => {
    if (selectedWf) {
      runWorkflow(selectedWf);
      return;
    }
    generate();
  };

  const canGenerateInline = allowGeneration || requiresImageUpload;
  const needsImage = requiresImageUpload && !referenceImageUrl;
  // In upload mode the reference upload is column 1; in source mode it stays in
  // column 2 (only rendered there for image2image templates).
  const uploadInCol2 = col1.mode === "source" && requiresImageUpload;
  // "result" mode = a finished project loaded to keep producing. Column 2 is
  // hidden, so column 1 + column 3 widen to fill the 12-col grid.
  const resultMode = col1.mode === "result";
  const col1Span = resultMode ? "lg:col-span-4" : "lg:col-span-3";
  // (d) Design-work tiles now live in column 2 (as "output formats"), so column 2
  // is wider and column 3 (the result panel only) is narrower. Result mode keeps
  // the old split (col 2 is hidden; tiles fall back into the wide column 3).
  const col2Span = "lg:col-span-5";
  const col3Span = resultMode ? "lg:col-span-8" : "lg:col-span-4";

  const onFormChange = (name: string, value: string) => {
    clearWarning();
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyGenerate = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt || basePrompt);
      trackAction(tracking, "generate");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const runWorkflow = async (wf: (typeof workflows)[number]) => {
    // "Watch video" — reveal the pre-rendered intro video. Free, instant, no
    // backend. (The first, most-clicked tile for the templates that have one.)
    if (wf.kind === "video-show") {
      if (!wf.videoUrl) return;
      setSoonNote(null);
      setShownVideoUrl(wf.videoUrl);
      track({ contentId: `workflow-video:${templateId}`, contentType: tracking.contentType, actionType: "click" });
      return;
    }
    // Download a pre-built PDF pack: free 5-pack, or a paid 50/100-pack via points.
    // The backend serves the signed URL and charges points on the first paid
    // download (buy-once; free re-download after). Insufficient balance comes back
    // as success:false + code INSUFFICIENT_CREDITS (200) → open the top-up modal.
    if (wf.kind === "pack-pdf") {
      const size = (wf.packSize ?? 5) as 5 | 50 | 100;
      if (!user) {
        track({ contentId: `auth-modal:pack-pdf:${templateId}`, contentType: "topic_capsule", actionType: "click" });
        setDrawer("signin");
        return;
      }
      if (activeKey) return;
      setSoonNote(null);
      setActiveKey(wf.key);
      try {
        const res = await templatePacksService.downloadPack({ template_id: templateId, size, format: "pdf" });
        if (!res?.success) {
          if (res?.code === "INSUFFICIENT_CREDITS") {
            setSoonNote(
              `This ${size}-card pack costs ${res.points_required} points — you have ${res.balance ?? 0}. Top up to unlock.`,
            );
            setModal("topup");
            return;
          }
          throw new Error(res?.message || "Missing download_url");
        }
        if (res.download_url) {
          const a = document.createElement("a");
          a.href = res.download_url;
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        track({ contentId: `workflow-${wf.key}:${templateId}`, contentType: tracking.contentType, actionType: "download" });
      } catch {
        setSoonNote("Couldn't prepare the PDF pack. Please try again.");
      } finally {
        setActiveKey(null);
      }
      return;
    }
    if (wf.kind === "soon") {
      track({ contentId: `workflow-soon:${wf.key}:${templateId}`, contentType: "topic_capsule", actionType: "click" });
      setSoonNote(`${wf.label} is coming soon — we prioritize these by demand, so your click counts.`);
      return;
    }
    if (wf.kind === "resize") {
      if (activeKey || anyGenerating) return;
      if (!transformSource) {
        setSoonNote("Generate a result first, then tap a tile to turn it into design work.");
        return;
      }
      setSoonNote(null);
      setActiveKey(wf.key);
      track({ contentId: `workflow-${wf.key}:${templateId}`, contentType: tracking.contentType, actionType: "download" });
      try {
        // The ratio picker drives this: a specific aspect → one file; "all" → the
        // full social bundle.
        if (resizeAspect === "all") {
          const variants = await resizeToSocialBundle(transformSource);
          variants.forEach((v) => pushResult(`resize-${v.key}`, v.label, v.url));
        } else {
          const v = await resizeToAspect(transformSource, resizeAspect);
          pushResult(`resize-${v.key}`, v.label, v.url);
        }
      } catch {
        setSoonNote("Couldn't resize this image here. Generate a fresh result first, then try again.");
      } finally {
        setActiveKey(null);
      }
      return;
    }
    // "Make print-ready" — client-side bleed pass on an already-poster result.
    if (wf.kind === "print-ready") {
      if (activeKey || anyGenerating) return;
      if (!transformSource) {
        setSoonNote("Generate a result first, then add a print bleed.");
        return;
      }
      setSoonNote(null);
      setActiveKey(wf.key);
      track({ contentId: `workflow-${wf.key}:${templateId}`, contentType: tracking.contentType, actionType: "download" });
      try {
        const v = await makePrintReady(transformSource);
        pushResult("print-ready", v.label, v.url);
      } catch {
        setSoonNote("Couldn't prepare a print-ready file here. Generate a fresh result first, then try again.");
      } finally {
        setActiveKey(null);
      }
      return;
    }
    if (anyGenerating || !wf.prompt) return;
    if (!transformSource) {
      setSoonNote("Generate a result first, then tap a tile to turn it into design work.");
      return;
    }
    freeformGenerate({
      prompt: wf.prompt,
      referenceImageUrl: transformSource,
      sourcePromptId: templateId,
      tracking: { ...tracking, contentId: `workflow-${wf.key}:${templateId}` },
      meta: { key: wf.key, label: wf.label },
    });
  };

  const labelCls = "mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500";

  // One click-to-run workflow tile. Shared by the result-mode tile grid (col 3,
  // where there's no Generate button) and the col-2 quick-actions row (PDF packs /
  // lesson-video reveal).
  const tileButton = (wf: (typeof workflows)[number]) => {
    const Icon = wf.icon;
    const busy = activeKey === wf.key;
    const isSoon = wf.kind === "soon";
    const isFree = wf.kind === "video-show"; // free/instant — stays enabled during a gen
    return (
      <button
        key={wf.key}
        type="button"
        title={wf.hint}
        disabled={anyGenerating && !isSoon && !isFree}
        onClick={() => runWorkflow(wf)}
        className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
          isSoon ? "border-dashed border-neutral-300 bg-neutral-50" : "border-neutral-200 bg-white hover:border-purple-300"
        }`}
      >
        {isSoon && (
          <span className="absolute right-1 top-1 rounded bg-neutral-200 px-1 text-[9px] font-bold uppercase tracking-wide text-neutral-500">
            Soon
          </span>
        )}
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${isSoon ? "bg-neutral-100 text-neutral-400" : "bg-purple-50 text-purple-600"}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        </span>
        <span className="text-[11px] font-semibold leading-tight text-neutral-700">{wf.label}</span>
      </button>
    );
  };

  // Result-mode only (a loaded project, col 2 hidden): all workflows as
  // click-to-run tiles, since there's no Generate button to drive them.
  const outputFormats = workflows.length > 0 && (
    <>
      {transformSource && (
        <p className="mb-2 text-[11px] text-neutral-400">
          Each format builds from your{" "}
          {results.some((r) => r.kind === "primary") ? "latest generation" : promotedUrl ? "selected result" : "source image"}.
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">{workflows.map(tileButton)}</div>
      {soonNote && <p className="mt-2 text-[11px] text-neutral-500">{soonNote}</p>}
    </>
  );

  return (
    <section className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6">
      {description ? <p className="sr-only whitespace-pre-line">{description}</p> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* ── 1. SOURCE / YOUR IMAGE ────────────────────────────────── */}
        <div className={`flex flex-col ${col1Span}`}>
          <div className={labelCls}>
            {promotedUrl
              ? "1 · Your result"
              : col1.mode === "upload"
                ? col1.optional
                  ? "1 · Your photo (optional)"
                  : "1 · Your image"
                : col1.mode === "result"
                  ? "1 · Your result"
                  : "1 · Source"}
          </div>
          {promotedUrl ? (
            <>
              <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={promotedUrl} alt="Selected result" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setPromotedUrl(null)}
                  aria-label="Revert to source"
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                Working from this result — output formats now build on it.
              </p>
            </>
          ) : col1.mode === "upload" ? (
            <div className="flex flex-1 flex-col rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <ReferenceImageUpload
                variant="full"
                required={!col1.optional}
                label={col1.label ?? (col1.optional ? "Your photo (optional)" : "Your image")}
                hideLabel={col1.hideUploadLabel}
                hint={
                  col1.hint ??
                  (col1.optional
                    ? "Optional — upload your own photo or subject to apply this template to it, or just Generate from the options."
                    : "Upload the photo to transform — the template is applied to it.")
                }
                signInLabel="Sign in to upload your image"
                onChange={(url) => {
                  clearWarning();
                  setReferenceImageUrl(url);
                }}
                onUploadingChange={setIsUploadingImage}
              />
            </div>
          ) : (
            <>
              {/* (C) Larger source image; the copy + download-pack buttons were
                  removed and Share moved to the page H1 row. Only a loaded
                  project (result mode) keeps its Download here. */}
              <div className="relative min-h-[460px] flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {col1.image}
              </div>
              {col1.mode === "result" && (
                <div className="mt-2">
                  <a
                    href={col1.downloadHref ?? col1.resultUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 2. MAKE IT YOURS / PROMPT & GENERATE (hidden in result mode) ── */}
        {!resultMode && (
        <div className={`flex flex-col ${col2Span}`}>
          <div className={labelCls}>{col1.mode === "upload" ? "2 · Prompt & generate" : "2 · Make it yours"}</div>
          <div className="flex flex-1 flex-col gap-3">
            {parameters.length > 0 && (
              <div className="flex flex-col gap-3">
                {(showAllParams ? parameters : parameters.slice(0, PARAM_COLLAPSE_AT)).map((p) => {
                  const value = form[p.name] ?? "";
                  const { displayPlaceholder, candidates } = normalizePrefills(p.placeholder);
                  const inputClass =
                    "w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200";
                  // Long prefilled values overflow a single-line input — give
                  // them a wrapping textarea so the whole value is legible.
                  const isFreeText = p.type !== "select" && p.type !== "language_pair";
                  const longText =
                    isFreeText &&
                    (value.length > LONG_VALUE_CHARS || (displayPlaceholder?.length ?? 0) > LONG_VALUE_CHARS);
                  return (
                    <div key={p.name}>
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-neutral-700">{p.label || p.name}</div>
                        {candidates.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1">
                            {candidates.slice(0, 4).map((cand) => (
                              <button
                                key={`${p.name}-${cand}`}
                                type="button"
                                onClick={() => onFormChange(p.name, cand)}
                                title={cand}
                                className="max-w-[9rem] cursor-pointer truncate rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
                              >
                                {cand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {p.type === "select" ? (
                        <select value={value} onChange={(e) => onFormChange(p.name, e.target.value)} className={inputClass}>
                          {(p.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : p.type === "language_pair" ? (
                        <LanguagePairSelector value={value} onChange={(v) => onFormChange(p.name, v)} className={inputClass} />
                      ) : longText ? (
                        <textarea
                          value={value}
                          onChange={(e) => onFormChange(p.name, e.target.value)}
                          placeholder={displayPlaceholder}
                          rows={2}
                          className={`${inputClass} resize-y leading-snug`}
                        />
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => onFormChange(p.name, e.target.value)}
                          placeholder={displayPlaceholder}
                          className={inputClass}
                        />
                      )}
                    </div>
                  );
                })}

                {parameters.length > PARAM_COLLAPSE_AT && (
                  <button
                    type="button"
                    onClick={() => setShowAllParams((v) => !v)}
                    className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${showAllParams ? "rotate-180" : ""}`}
                    />
                    {showAllParams
                      ? "Show fewer options"
                      : `Show ${parameters.length - PARAM_COLLAPSE_AT} more option${parameters.length - PARAM_COLLAPSE_AT === 1 ? "" : "s"}`}
                  </button>
                )}
              </div>
            )}

            {/* image2image upload lives in column 2 only in "source" mode. */}
            {uploadInCol2 && (
              <ReferenceImageUpload
                required
                label="Your image"
                hint="Upload the photo to transform — the template is applied to it."
                signInLabel="Sign in to upload your image"
                onChange={setReferenceImageUrl}
                onUploadingChange={setIsUploadingImage}
              />
            )}

            {/* Prompt preview — kept in the DOM for SEO + power users. Opened by
                default in upload mode (it is column 2's primary content there). */}
            <details
              className="group rounded-xl border border-neutral-200 bg-white"
              {...(col1.mode === "upload" ? { open: true } : {})}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-neutral-400" />
                  {col1.mode === "upload" ? "Prompt preview" : "Advanced prompt editing"}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-neutral-100 p-3">
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-neutral-700">
                  {filledPrompt || basePrompt}
                </pre>
              </div>
            </details>

            {duplicateWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>
                  A very similar image already exists ({Math.round(duplicateWarning.score * 100)}% match).{" "}
                  <button type="button" className="font-semibold underline hover:text-amber-900 cursor-pointer" onClick={dismissAndGenerate}>
                    generate anyway
                  </button>
                  .
                </span>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-2">
              {/* (B) Output format — chosen ABOVE Generate. Default = the standard
                  image; picking another format makes Generate produce that format
                  (a transform of the current source/hero). (b) the old use-case
                  chips were removed. */}
              {canGenerateInline && genFormats.length > 0 && (
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Output format
                    </span>
                    <span className="text-[11px] text-neutral-400">{CREDITS_COST} credits</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ key: null as string | null, label: "Standard image", icon: Wand2 }, ...genFormats].map((opt) => {
                      const active = (opt.key ?? null) === selectedFormat;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.key ?? "__standard"}
                          type="button"
                          onClick={() => setSelectedFormat(opt.key ?? null)}
                          aria-pressed={active}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                            active
                              ? "border-purple-500 bg-purple-50 ring-1 ring-purple-300"
                              : "border-neutral-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${active ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600"}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-[11px] font-semibold leading-tight text-neutral-700">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* (1) Resize aspect-ratio picker — shown only when the resize
                      format is selected. "All" produces the full social bundle. */}
                  {selectedFormat === "resize-bundle" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[...SOCIAL_ASPECTS, { key: "all", label: "All sizes" }].map((a) => {
                        const on = resizeAspect === a.key;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            onClick={() => setResizeAspect(a.key)}
                            aria-pressed={on}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                              on
                                ? "border-purple-500 bg-purple-600 text-white"
                                : "border-neutral-200 bg-white text-neutral-700 hover:border-purple-300"
                            }`}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                {canGenerateInline ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrimaryGenerate}
                      disabled={anyGenerating || needsImage || isUploadingImage}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {(selectedWf ? activeKey === selectedWf.key : directGenerating) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      {selectedWf
                        ? activeKey === selectedWf.key
                          ? t("generating")
                          : `${t("generate")} · ${selectedWf.label}`
                        : directGenerating
                          ? t("generating")
                          : t("generate")}
                      {clientMounted && !user && <span className="ml-1 text-xs opacity-80">🔒</span>}
                      {clientMounted && user && <span className="ml-1 text-xs opacity-80">· {CREDITS_COST} credits</span>}
                    </button>
                    {needsImage && (
                      <p className="mt-1.5 text-[11px] text-neutral-500">
                        {col1.mode === "upload" ? "Upload your image on the left to generate." : "Upload your image above to generate."}
                      </p>
                    )}
                    {selectedWf && !needsImage && !transformSource && (
                      <p className="mt-1.5 text-[11px] text-neutral-500">
                        Generate a standard image first (or upload your photo), then switch to this format.
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyGenerate}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700"
                  >
                    <Copy className="h-4 w-4" /> {copied ? t("copied") : t("copyPrompt")}
                  </button>
                )}
              </div>

              {soonNote && <p className="text-[11px] text-neutral-500">{soonNote}</p>}

              {/* Quick actions — PDF packs + the lesson-video reveal. Not "generate"
                  outputs, so they stay one-click tiles separate from the selector. */}
              {quickActions.length > 0 && (
                <div className="border-t border-neutral-100 pt-3">
                  <div className="grid grid-cols-3 gap-2">{quickActions.map(tileButton)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* ── 3. RESULT ─────────────────────────────────────────────── */}
        <div className={`flex flex-col ${col3Span}`}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {resultMode ? "2 · Turn it into design work" : "3 · Result"}
            </span>
            {resultMode && <span className="text-[11px] text-neutral-400">{CREDITS_COST} credits each</span>}
          </div>

          {/* In result mode column 2 is hidden, so the output-format tiles live
              here in the wide column 3. In the normal layout they're in column 2. */}
          {resultMode && outputFormats}

          {/* Template intro video, revealed by the free "Read this" tile. */}
          {shownVideoUrl && (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-black shadow-sm">
              <CdnVideo
                key={shownVideoUrl}
                src={shownVideoUrl}
                controls
                autoPlay
                playsInline
                className="h-auto w-full"
              />
              <button
                type="button"
                onClick={() => setShownVideoUrl(null)}
                aria-label="Close video"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-1 flex-col">
            <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white p-2">
              {latestUrl ? (
                // (e) Clicking the generated image moves it to column 1 as the
                // working source (every output-format tile then builds from it).
                <button
                  type="button"
                  onClick={() => setPromotedUrl(latestUrl)}
                  title="Use as source — move to column 1"
                  className="block h-full w-full cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={latestUrl} alt={results[0]?.label} className="mx-auto h-full max-h-[420px] w-auto rounded-lg object-contain" />
                </button>
              ) : (
                <p className="px-4 text-center text-xs text-neutral-400">
                  {anyGenerating
                    ? "Generating…"
                    : "Fill the parameters and Generate, or pick an output format — results appear here and save to your workspace."}
                </p>
              )}
              {latestUrl && (
                <a
                  href={latestUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download"
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>

            {latestUrl && promotedUrl !== latestUrl && (
              <p className="mt-1.5 text-center text-[11px] text-neutral-400">
                Click the image to move it to column 1 and keep building from it.
              </p>
            )}

            {results.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-2 overflow-x-auto">
                  {results.slice(1).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setPromotedUrl(r.url)}
                      title={`${r.label} — use as source`}
                      className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.url} alt={r.label} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <Link
                  href={`/${locale}/workspace`}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-purple-600 hover:text-purple-800"
                >
                  Workspace <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
