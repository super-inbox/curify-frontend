"use client";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

/**
 * Design-agent demo — text + image in, a visible plan out, executed step by step.
 *
 * Harness split (see curify-studio/docs/design-agent-v0-spec.md §7c):
 *   server  reasoning — routing + planning, because they need the capability KB
 *   client  execution — reuses the authed generate services, so long image jobs
 *           never hit a serverless timeout and auth works exactly as elsewhere
 *
 * The loop is bounded and observable: plan → execute → observe → verify.
 * Steps whose tool is a declared GAP are shown with the tool that would run
 * them rather than being skipped or faked.
 *
 * NOT yet implemented (do not infer from the shape of this file): re-planning
 * after a failed step, retry, state persistence across reloads, and any trace
 * store. A failure stops that step and the loop moves on.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { WORKFLOWS_BY_DOMAIN } from "@/lib/topic_workflows";
import { requiresDirection } from "@/lib/agent/direction";
import ReferenceImagesUpload from "@/app/[locale]/_components/ReferenceImagesUpload";
import { nanoGenerateService } from "@/services/nanoGenerate";
import { factoryExportService } from "@/services/factoryExport";
import { designAgentRunService } from "@/services/designAgentRun";
import { runtimeTaskType, runtimeNeedsPaidGeneration } from "@/lib/agent/runtimeTask";
import { freeformGenerateService } from "@/services/freeformGenerate";
import { pollNanoResult } from "@/services/pollNanoResult";
import { createTrajectoryRecorder, newRunId } from "@/lib/agent/trajectory";

type PlanStep = {
  n: number;
  tool_id: string;
  label: string;
  reason: string;
  template_id?: string;
  params?: Record<string, string>;
  prompt?: string;
  blocked?: { implementedBy: string; blocker: string };
};

type AgentPlan = {
  query: string;
  routing: {
    confidence: number;
    abstained: boolean;
    clarification?: string;
    matched_templates: Array<{ template_id: string; title: string; confidence: number }>;
    /** What shape of job this is — see lib/agent/deliverable.ts. */
    deliverable?: { type: string; domain?: string; count?: number; rationale: string };
  };
  steps: PlanStep[];
  gaps: Array<{ tool_id: string; implementedBy: string; blocker: string }>;
  notice?: string;
};

type StepState = {
  status: "pending" | "running" | "done" | "blocked" | "failed";
  resultUrl?: string;
  error?: string;
  /** Actionable interpretation of `error` — shown under it. */
  hint?: string;
  verify?: { ok: boolean; note: string };
};

/** Matches nano_template_pipeline.GENERATION_CREDITS. Shown BEFORE spending. */
const CREDITS_PER_STEP = IMAGE_GENERATION_CREDITS;

type Suggestion = { label: string; why: string; query: string; domain: string };
type GeneratedDirection = {
  id: string;
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  description: { en: string; zh: string };
  styleTags: string[];
  promptModifier: string;
};
type SuggestResult = { context: string; suggestions: Suggestion[] };

export default function DesignAgentClient({
  locale,
  initialWorkflow,
  initialQuery,
}: {
  locale: string;
  /** Ladder name from a one-click entry (?workflow=merch). */
  initialWorkflow?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  // The ladder this session belongs to. MUST outlive the auto-start: the seeded
  // text alone does not classify back to a workflow ("Brand design workflow"
  // routes to a SINGLE template), so re-running after editing the brief would
  // silently drop the whole ladder and generate one image instead of five.
  const [workflowDomain, setWorkflowDomain] = useState<string | undefined>(initialWorkflow);
  // blob_url from ReferenceImageUpload — the component owns upload, preview,
  // error and the anonymous sign-in gate (/images/upload requires auth).
  // Ordered references. `referenceUrl` is the derived base image so the
  // direction gate, suggestions and trajectory checks below keep working
  // unchanged — they only ever asked "is there an image?".
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const referenceUrl = referenceUrls[0] ?? null;
  const [uploading, setUploading] = useState(false);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [states, setStates] = useState<Record<number, StepState>>({});
  const [phase, setPhase] = useState<"idle" | "planning" | "running" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<SuggestResult | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  // Creative-direction gate state. `needFields` are the identity facts the
  // direction generator will not invent (a brand name); `directions` are the
  // 2-3 options once it has them.
  const [dirFields, setDirFields] = useState<{ id: string; label: string; placeholder: string }[]>([]);
  const [dirValues, setDirValues] = useState<Record<string, string>>({});
  const [directions, setDirections] = useState<GeneratedDirection[] | null>(null);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);
  // Arriving from a workflow entry shows a BRIEF, not a running job. The button
  // on the topic page is navigation; turning a navigation click into a 50-credit
  // spend (5 steps x 10) with no confirmation was the worst defect in the audit.
  const [showBrief, setShowBrief] = useState(true);
  const ladder = workflowDomain ? WORKFLOWS_BY_DOMAIN[workflowDomain] : undefined;
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set((ladder?.steps ?? []).map((_, i) => i)),
  );

  const fetchSuggestions = useCallback(
    async (payload: Record<string, unknown>) => {
      setSuggesting(true);
      try {
        const res = await fetch("/api/design-agent/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) setSuggest(await res.json());
      } catch {
        /* suggestions are additive — never block the run */
      } finally {
        setSuggesting(false);
      }
    },
    [],
  );

  /** Ordered references in; the BASE image drives image classification. */
  const onReferencesChange = useCallback(
    (urls: string[]) => {
      setReferenceUrls(urls);
      setSuggest(null);
      // Classify off the base image only — suggestions answer "what is this?",
      // and that question is about the subject, not the whole reference set.
      if (urls[0]) void fetchSuggestions({ imageRef: urls[0] });
    },
    [fetchSuggestions],
  );

  // Fetch directions from the SAME generator the /brand-direction-explorer tool
  // uses (via /api/design-agent/directions), so directions do not drift between
  // the tool and the agent and there is one prompt to improve, not two.
  const fetchDirections = useCallback(
    async (values: Record<string, string>) => {
      const domain = workflowDomainRef.current;
      if (!domain) return;
      setDirLoading(true);
      setDirError(null);
      try {
        const res = await fetch("/api/design-agent/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, domain, fieldValues: values }),
        });
        const data = await res.json();
        if (data.needFields) {
          setDirFields(data.needFields);        // ask, then come back
          setDirections(null);
        } else if (data.success) {
          setDirections(data.directions);
          setDirFields([]);
        } else {
          setDirError(data.error ?? "Could not generate directions.");
        }
      } catch {
        setDirError("Could not generate directions.");
      } finally {
        setDirLoading(false);
      }
    },
    [query],
  );

  const setStep = (n: number, patch: Partial<StepState>) =>
    setStates((s) => ({ ...s, [n]: { ...(s[n] ?? { status: "pending" }), ...patch } }));

  /** Deterministic post-checks — the cheap half of the verify node. */
  const verifyArtifact = useCallback(async (url: string): Promise<{ ok: boolean; note: string }> => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) return { ok: false, note: `artifact unreachable (${res.status})` };
      const len = Number(res.headers.get("content-length") ?? 0);
      if (len > 0 && len < 10_000) return { ok: false, note: "artifact suspiciously small" };
      return { ok: true, note: len ? `reachable · ${Math.round(len / 1024)} KB` : "reachable" };
    } catch {
      return { ok: true, note: "reachable (no HEAD)" };
    }
  }, []);

  const run = useCallback(async (queryOverride?: string, domainOverride?: string, direction?: string) => {
    const q = (queryOverride ?? query).trim();
    if (!q) return;
    const workflowDomain = domainOverride ?? workflowDomainRef.current;
    if (!direction) { setDirections(null); setDirFields([]); setDirError(null); }
    if (queryOverride) setQuery(queryOverride);
    setError(null);
    setStates({});
    setPlan(null);
    setSuggest(null);
    setPhase("planning");

    // one trajectory per run — events group by run_id, no server session needed
    const traj = createTrajectoryRecorder(newRunId());
    traj.record({ type: "run_started", query: q, hasImage: Boolean(referenceUrl), locale });
    if (queryOverride && suggest) {
      const picked = suggest.suggestions.find((s) => s.query === queryOverride);
      if (picked) {
        traj.record({
          type: "suggestion_chosen",
          label: picked.label,
          domain: picked.domain,
          query: queryOverride,
          // the alternatives that were on screen and passed over — without
          // these the event is a click, not a comparison
          rejected: suggest.suggestions
            .filter((s) => s.query !== queryOverride)
            .map((s) => ({ label: s.label, domain: s.domain })),
          shown_context: suggest.context,
        });
      }
    }

    // 1. plan (server-side reasoning). The reference image, if any, was already
    //    uploaded by ReferenceImageUpload — we just carry its blob_url through.
    let p: AgentPlan;
    try {
      const res = await fetch("/api/design-agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          hasImage: Boolean(referenceUrl),
          locale,
          workflowDomain,
          direction,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      p = await res.json();
    } catch {
      setPhase("idle");
      setError("Could not build a plan. Try rephrasing the request.");
      return;
    }
    // Honour the step selection from the brief. The planner returns the whole
    // ladder; dropping rows here (rather than server-side) keeps one plan shape
    // and lets the panel recompute cost without a round trip.
    const sel = selectedRef.current;
    if (workflowDomain && sel && sel.size && sel.size < p.steps.length) {
      p = {
        ...p,
        steps: p.steps.filter((_, i) => sel.has(i)).map((st, i) => ({ ...st, n: i + 1 })),
      };
    }
    setPlan(p);
    setPhase("running");
    // Steps that actually produced a verified artifact. Derived here rather
    // than from `states`, which is React state and still stale in this closure.
    const succeeded: typeof p.steps = [];
    traj.record({
      type: "routed",
      confidence: p.routing.confidence,
      abstained: p.routing.abstained,
      deliverableType: p.routing.deliverable?.type,
      deliverableRationale: p.routing.deliverable?.rationale,
      matched: p.routing.matched_templates.map((m) => ({
        template_id: m.template_id,
        confidence: m.confidence,
      })),
    });
    traj.record({
      type: "planned",
      steps: p.steps.map((s) => ({
        n: s.n,
        tool_id: s.tool_id,
        template_id: s.template_id,
        blocked: Boolean(s.blocked),
      })),
    });

    // 2a. Hand the turn to the BACKEND runtime when a real skill exists for it.
    //
    // agent_runtime implements design-vote and tryon-poster end to end —
    // deterministic decision board, per-poster identity/garment verification
    // with retry — and POST /design-agent/runs is live. Neither was reachable
    // from here, so the client re-implemented a weaker version: three
    // unverified poster prompts, and nothing at all for ranking.
    //
    // Verified against production: a design_vote run returns a rendered report
    // PNG plus an analysis JSON tagged `manifest`, which is the second artifact
    // nine 21q cases were short of. See spec §7h — agent_runtime is canonical.
    const runtimeTask = runtimeTaskType(p.query);
    if (runtimeTask && referenceUrls.length > 0) {
      try {
        const { run_id } = await designAgentRunService.start({
          prompt: p.query,
          image_urls: referenceUrls,
          locale,
          allow_paid_generation: runtimeNeedsPaidGeneration(runtimeTask),
        });
        traj.record({ type: "step_started", n: 1, tool_id: `runtime:${runtimeTask}` });
        const done = await designAgentRunService.poll(run_id);
        const arts = done.artifacts ?? [];
        setStep(1, {
          status: done.status === "COMPLETED" ? "done" : "failed",
          // `code` carries the skill's own refusal (e.g. a capability gate),
          // which is more useful than a generic failure.
          error: done.status === "COMPLETED" ? undefined : (done.code ?? "runtime run failed"),
          resultUrl: arts.find((a) => a.signed_url)?.signed_url,
        });
        traj.record({
          type: "step_result",
          n: 1,
          tool_id: `runtime:${runtimeTask}`,
          status: done.status === "COMPLETED" ? "done" : "failed",
          verify_ok: done.status === "COMPLETED",
        });
        setPhase("done");
        traj.record({
          type: "run_finished",
          outcome: done.status === "COMPLETED" ? "completed" : "failed",
          artifacts: arts.length,
        });
        return;
      } catch (e) {
        // Fall through to the ladder rather than dead-ending the user; the
        // client path is weaker but it does produce something.
        console.error("agent runtime failed, falling back to the ladder", e);
      }
    }

    // 2. execute, observing each step.
    // Carries the most recent VERIFIED artifact so a downstream export step has
    // something real to consume. Only set after verifyArtifact passes, so a
    // failed generation cannot be handed to the factory exporter.
    let lastArtifactUrl: string | undefined = referenceUrl;
    for (const step of p.steps) {
      if (step.blocked) {
        setStep(step.n, { status: "blocked" });
        traj.record({ type: "step_result", n: step.n, tool_id: step.tool_id, status: "blocked" });
        continue;
      }
      setStep(step.n, { status: "running" });
      traj.record({
        type: "step_started",
        n: step.n,
        tool_id: step.tool_id,
        template_id: step.template_id,
        params: step.params,
      });
      try {
        let projectId: string | undefined;

        if (step.tool_id === "generate_from_template" && step.template_id) {
          const r = await nanoGenerateService.generate(
            {
              template_id: step.template_id,
              params: step.params ?? {},
              example_id: `${step.template_id}-agent-${Date.now().toString(36)}`,
              ...(referenceUrl ? { reference_image_url: referenceUrl } : {}),
              ...(referenceUrls.length > 1
                ? { reference_image_urls: referenceUrls.slice(1) }
                : {}),
            },
            { locale },
          );
          projectId = r.project_id;
        } else if (step.tool_id === "generate_freeform") {
          const r = await freeformGenerateService.generate({
            prompt: step.prompt || p.query,
            ...(referenceUrl ? { reference_image_url: referenceUrl } : {}),
          });
          projectId = r.project_id;
        } else if (step.tool_id === "export_print_package") {
          // The planner has emitted this all along; there was no branch for it,
          // so it fell through to `blocked`. That is eval class D: the brief
          // asks for a printable production file and the ladder either stalls
          // or the model answers with an infographic ABOUT print files.
          // The exporters already exist under /design-tools — this is wiring.
          if (!lastArtifactUrl) {
            setStep(step.n, {
              status: "blocked",
              error: "needs an upstream image — generate the artwork first",
            });
            continue;
          }
          const wantsAcrylic =
            /acrylic|keychain|charm|亚克力|钥匙扣|挂件/i.test(
              `${step.prompt ?? ""} ${p.query}`,
            );
          // Packaging is deliberately NOT auto-selected: it requires real
          // W×H×D and Gemini invents a near-cube when they are unstated
          // (see docs/packaging-mockup-pipeline.md). Without dimensions in the
          // plan, a die-cut export is the honest default.
          const r = wantsAcrylic
            ? await factoryExportService.acrylicExport({ image_url: lastArtifactUrl })
            : await factoryExportService.stickerExport({ image_url: lastArtifactUrl });
          projectId = r.project_id;
        } else if (step.tool_id === "compose_grid") {
          // compose runs over prior artifacts; with one upstream image there is
          // nothing to tile yet, so surface it honestly rather than faking it.
          setStep(step.n, {
            status: "blocked",
            error: "needs multiple upstream artifacts — generate the cells first",
          });
          continue;
        } else {
          setStep(step.n, { status: "blocked" });
          continue;
        }

        if (!projectId) throw new Error("no project id returned");
        const url = await pollNanoResult(projectId);
        const verify = await verifyArtifact(url);
        if (verify.ok) succeeded.push(step);
        if (verify.ok) lastArtifactUrl = url;
        setStep(step.n, { status: verify.ok ? "done" : "failed", resultUrl: url, verify });
        traj.record({
          type: "step_result",
          n: step.n,
          tool_id: step.tool_id,
          status: verify.ok ? "done" : "failed",
          artifact_url: url,
          verify_ok: verify.ok,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "generation failed";
        // Distinguish what the caller can act on. A backend failure_reason is
        // passed through verbatim, with the usual culprits named — credit
        // exhaustion in particular used to surface as an opaque "try again".
        const hint = /401|expired|sign in/i.test(msg)
          ? "You need to be signed in to generate."
          : /credit|quota|insufficient/i.test(msg)
            ? "Looks like a credits problem — each image costs 10."
            : /longer than usual|timeout/i.test(msg)
              ? "The job is still running — it may complete server-side."
              : "This came from the generation backend, not the plan. " +
                "The request was well-formed; check credits (10/image) and the worker.";
        setStep(step.n, {
          status: "failed",
          error: /401|expired|sign in/i.test(msg) ? "sign-in required to generate" : msg,
          hint,
        });
        traj.record({
          type: "step_result",
          n: step.n,
          tool_id: step.tool_id,
          status: "failed",
          error: msg,
        });
      }
    }
    setPhase("done");
    traj.record({
      type: "run_finished",
      outcome: p.steps.every((s) => s.blocked) ? "failed" : "completed",
      artifacts: p.steps.filter((s) => !s.blocked).length,
    });

    // observe → suggest: what the ladder says comes after what we just produced.
    // Two things this must get right, both previously wrong:
    //  1. only steps that VERIFIABLY produced an artifact count. Filtering on
    //     the plan's static `blocked` flag reported five failed generations as
    //     "done so far".
    //  2. the suggester matches ladder STEP KEYS (palette, logo…), not template
    //     ids. Emitting `template-…` matched nothing, so it re-offered the exact
    //     steps that had just run.
    const ladder = WORKFLOWS_BY_DOMAIN[p.routing.deliverable?.domain ?? workflowDomain ?? ""];
    const keyByTemplateId = new Map(
      (ladder?.steps ?? []).map((ls) => [ls.href.replace("/nano-template/", "template-"), ls.key]),
    );
    const producedKeys = succeeded
      .map((s) => (s.template_id ? keyByTemplateId.get(s.template_id) : undefined) ?? s.tool_id)
      .filter(Boolean);
    void fetchSuggestions({
      query: q,
      completedToolIds: succeeded.map((s) => s.tool_id),
      producedKeys,
      // The ladder is known when the run came from a workflow entry — without
      // it the suggester infers from produced artifacts and defaults to merch.
      domain: p.routing.deliverable?.domain ?? workflowDomain,
    });
  }, [query, referenceUrl, referenceUrls, locale, verifyArtifact, fetchSuggestions, suggest]);

  // One-click workflow entry: the user already chose the ladder on the topic or
  // home page, so re-asking them to type a brief would undo the whole point.
  // Runs once — the ref guards against a second dispatch on re-render, which
  // would double-charge credits.
  const selectedRef = useRef<Set<number> | undefined>(undefined);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const workflowDomainRef = useRef<string | undefined>(initialWorkflow);
  useEffect(() => {
    workflowDomainRef.current = workflowDomain;
  }, [workflowDomain]);

  // Ask the direction generator which identity facts it needs, up front, so the
  // brief collects them in ONE place instead of interrupting mid-run. Cheap: the
  // route validates and returns needFields before it ever calls the model.
  const prefetched = useRef(false);
  useEffect(() => {
    if (prefetched.current || !initialWorkflow) return;
    if (!WORKFLOWS_BY_DOMAIN[initialWorkflow]) return;   // unknown ladder → manual entry
    if (!requiresDirection(initialWorkflow, false)) return;
    prefetched.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/design-agent/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: initialQuery || "brief", domain: initialWorkflow }),
        });
        const data = await res.json();
        if (data.needFields) setDirFields(data.needFields);
      } catch {
        /* the gate will ask later if this fails — not worth surfacing here */
      }
    })();
  }, [initialWorkflow, initialQuery]);

  /** Start the run from the brief panel. Only a deliberate click reaches here. */
  const startFromBrief = useCallback(
    (direction?: string) => {
      setShowBrief(false);
      void run(query.trim() || ladder?.heading, workflowDomainRef.current, direction);
    },
    [query, ladder, run],
  );


  const badge = (s?: StepState) => {
    const st = s?.status ?? "pending";
    const map: Record<string, string> = {
      pending: "bg-neutral-100 text-neutral-500",
      running: "bg-amber-100 text-amber-800",
      done: "bg-emerald-100 text-emerald-800",
      blocked: "bg-violet-100 text-violet-800",
      failed: "bg-red-100 text-red-800",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[st]}`}>{st}</span>;
  };

  // Widened from max-w-3xl: the panel carries a 3-up step grid, a side-by-side
  // brief + reference drop, and 3-up direction cards — all cramped at 768px.
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Design Agent</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Describe what you want, optionally with a reference image. The agent routes it against the
        template capability KB, shows you the plan, then executes it step by step.
      </p>

      {/* ---- workflow brief: ready-to-run, NOT running ----
           Everything the run needs, priced, before anything is spent. */}
      {showBrief && (
        <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50/40 p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-neutral-900">
              {ladder ? ladder.heading : "What do you want to make?"}
            </p>
            {ladder && (
              <p className="text-sm font-semibold text-purple-800">
                {selected.size} step{selected.size === 1 ? "" : "s"} · ~
                {selected.size * CREDITS_PER_STEP} credits
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {ladder
              ? ladder.subtitle
              : "Pick a workflow to run the whole set, or just describe it and the agent will route it."}
          </p>

          {/* Same chooser the topic pages offer, so arriving with no ?workflow
              lands on the identical surface rather than a different one. */}
          {!ladder && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(WORKFLOWS_BY_DOMAIN).map(([d, wf]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setWorkflowDomain(d);
                    setSelected(new Set(wf.steps.map((_, i) => i)));
                  }}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-purple-400 hover:text-purple-800"
                >
                  {wf.heading.replace(/ workflow$/i, "")}
                </button>
              ))}
            </div>
          )}

          <label className="mt-4 block text-xs font-semibold text-neutral-700">
            What is it? — this is what every step is generated from
          </label>
          <div className="mt-1 flex items-stretch gap-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              placeholder="e.g. a modern coffee shop for young professionals"
              className="min-w-0 flex-1 resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-purple-400"
            />
            {/* Small drop target beside the text, not a second panel. An image
                can replace the direction step entirely (see direction.ts), so it
                belongs next to the brief rather than behind a mode switch. */}
            <div className="w-56 shrink-0">
              <ReferenceImagesUpload
                value={referenceUrls}
                onChange={onReferencesChange}
                onUploadingChange={setUploading}
                max={5}
                label="References"
                hint="First is the base. Add up to 5."
              />
            </div>
          </div>

          {dirFields.map((f) => (
            <input
              key={f.id}
              value={dirValues[f.id] ?? ""}
              onChange={(e) => setDirValues((v) => ({ ...v, [f.id]: e.target.value }))}
              placeholder={`${f.label} — e.g. ${f.placeholder}`}
              className="mt-2 w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400"
            />
          ))}

          {ladder && (<><p className="mt-4 text-xs font-semibold text-neutral-700">Steps</p>
          <ul className="mt-1 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {ladder.steps.map((ls, i) => (
              <li key={ls.key}>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                  />
                  <span aria-hidden>{ls.emoji}</span>
                  <span className="text-neutral-800">{ls.name}</span>
                </label>
              </li>
            ))}
          </ul></>)}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={
                uploading ||
                !query.trim() ||
                (Boolean(ladder) && selected.size === 0) ||
                (Boolean(ladder) && dirFields.some((f) => !(dirValues[f.id] ?? "").trim()))
              }
              onClick={() =>
                workflowDomain && requiresDirection(workflowDomain, Boolean(referenceUrl))
                  ? void fetchDirections(dirValues).then(() => setShowBrief(false))
                  : startFromBrief()
              }
              className="rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
            >
              {workflowDomain && requiresDirection(workflowDomain, Boolean(referenceUrl))
                ? "Choose a direction →"
                : ladder
                  ? `Run ${selected.size} step${selected.size === 1 ? "" : "s"} · ~${
                      selected.size * CREDITS_PER_STEP
                    } credits`
                  : "Run agent →"}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Nothing is generated until you press the button above. Each image costs{" "}
            {CREDITS_PER_STEP} credits.
          </p>
        </div>
      )}

      {/* ---- next actions: state-aware, always exactly three ---- */}
      {(suggesting || suggest) && phase !== "running" && phase !== "planning" && (
        <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50/60 p-4">
          <h2 className="text-sm font-bold text-purple-900">
            {phase === "done" ? "What next?" : "Suggested next steps"}
          </h2>
          {suggesting ? (
            <p className="mt-2 text-sm text-purple-800">Looking at it…</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-purple-800">{suggest?.context}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {suggest?.suggestions.map((s, i) => (
                  <button
                    key={`${s.domain}-${i}`}
                    type="button"
                    onClick={() => void run(s.query)}
                    className="rounded-xl border border-purple-200 bg-white p-3 text-left transition hover:border-purple-400 hover:shadow-sm"
                  >
                    <span className="block text-sm font-semibold text-neutral-900">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-neutral-600">{s.why}</span>
                    <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-wide text-purple-600">
                      {s.domain}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- routing decision ---- */}
      {plan && (
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900">Routing</h2>
          <p className="mt-1 text-sm text-neutral-600">
            confidence <b>{plan.routing.confidence.toFixed(2)}</b>
            {plan.routing.abstained ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                abstained
              </span>
            ) : null}
          </p>
          {plan.routing.clarification && (
            <p className="mt-2 text-sm text-amber-800">{plan.routing.clarification}</p>
          )}
          {plan.routing.matched_templates.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-neutral-500">
              {plan.routing.matched_templates.map((m) => (
                <li key={m.template_id}>
                  {m.title} · <code>{m.template_id}</code> · {m.confidence.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---- creative-direction gate ----
           Rendered instead of the step list when the plan is a single
           choose_direction step. Without this the gate showed as a "blocked"
           badge with nothing to click — correct behaviour, dead-end UI. */}
      {plan && plan.steps.length === 1 && plan.steps[0].tool_id === "choose_direction" && (
        <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-sm">
          <p className="font-semibold text-neutral-900">Choose a creative direction</p>
          <p className="mt-1 text-sm text-neutral-600">{plan.steps[0].reason}</p>

          {!directions && dirFields.length === 0 && !dirLoading && (
            <button
              type="button"
              onClick={() => void fetchDirections(dirValues)}
              className="mt-3 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 text-sm font-bold text-white"
            >
              Show me directions
            </button>
          )}

          {dirFields.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-neutral-500">
                One detail first — we will not invent this, it ends up printed in the artwork:
              </p>
              {dirFields.map((f) => (
                <input
                  key={f.id}
                  value={dirValues[f.id] ?? ""}
                  onChange={(e) => setDirValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  placeholder={`${f.label} — e.g. ${f.placeholder}`}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-purple-400"
                />
              ))}
              <button
                type="button"
                disabled={dirFields.some((f) => !(dirValues[f.id] ?? "").trim())}
                onClick={() => void fetchDirections(dirValues)}
                className="rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Show me directions
              </button>
            </div>
          )}

          {dirLoading && <p className="mt-3 text-sm text-neutral-500">Exploring directions…</p>}
          {dirError && <p className="mt-3 text-sm text-red-600">{dirError}</p>}

          {directions && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {directions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => void run(query, workflowDomainRef.current, d.promptModifier)}
                  className="rounded-2xl border border-neutral-200 bg-white p-3.5 text-left transition hover:border-purple-400 hover:shadow-sm"
                >
                  <p className="text-sm font-bold text-neutral-900">{d.title.en}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{d.subtitle.en}</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-600">{d.description.en}</p>
                  <p className="mt-2 text-[11px] text-purple-700">{d.styleTags.slice(0, 4).join(" · ")}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-purple-700">
                    Use this direction →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- plan + execution ---- */}
      {plan && !(plan.steps.length === 1 && plan.steps[0].tool_id === "choose_direction") && (
        <ol className="mt-5 space-y-3">
          {plan.steps.map((s) => {
            const st = states[s.n];
            return (
              <li key={s.n} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                    {s.n}
                  </span>
                  <span className="font-semibold text-neutral-900">{s.label}</span>
                  <code className="text-xs text-neutral-400">{s.tool_id}</code>
                  <span className="ml-auto">{badge(st)}</span>
                </div>
                <p className="mt-1.5 text-sm text-neutral-600">{s.reason}</p>

                {s.blocked && (
                  <div className="mt-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-900">
                    <b>Tool gap.</b> This step is correct but not executable yet — it would run via{" "}
                    <code>{s.blocked.implementedBy}</code>. {s.blocked.blocker}
                  </div>
                )}
                {st?.error && !s.blocked && (
                  <div className="mt-2 rounded-xl bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-700">{st.error}</p>
                    {st.hint && <p className="mt-1 text-xs text-red-600/80">{st.hint}</p>}
                  </div>
                )}
                {st?.resultUrl && (
                  <div className="mt-3">
                    <Image src={st.resultUrl} alt={s.label} width={640} height={640} unoptimized
                      className="w-full rounded-xl border border-neutral-200" />
                    {st.verify && (
                      <p className={`mt-1 text-xs ${st.verify.ok ? "text-emerald-700" : "text-red-600"}`}>
                        verify: {st.verify.ok ? "passed" : "failed"} — {st.verify.note}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {/* ---- gap summary ---- */}
      {plan && plan.gaps.length > 0 && (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <h2 className="text-sm font-bold text-violet-900">
            {plan.gaps.length} step{plan.gaps.length > 1 ? "s" : ""} need a tool we haven&apos;t wired
          </h2>
          <ul className="mt-2 space-y-1 text-xs text-violet-900">
            {plan.gaps.map((g) => (
              <li key={g.tool_id}>
                <code>{g.tool_id}</code> → <code>{g.implementedBy}</code> ({g.blocker})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
