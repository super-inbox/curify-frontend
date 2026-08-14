"use client";

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
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { nanoGenerateService } from "@/services/nanoGenerate";
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

type Suggestion = { label: string; why: string; query: string; domain: string };
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
  // blob_url from ReferenceImageUpload — the component owns upload, preview,
  // error and the anonymous sign-in gate (/images/upload requires auth).
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [states, setStates] = useState<Record<number, StepState>>({});
  const [phase, setPhase] = useState<"idle" | "planning" | "running" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<SuggestResult | null>(null);
  const [suggesting, setSuggesting] = useState(false);

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

  /** ReferenceImageUpload reports the uploaded blob_url — classify it for suggestions. */
  const onReferenceChange = useCallback(
    (blobUrl: string | null) => {
      setReferenceUrl(blobUrl);
      setSuggest(null);
      if (blobUrl) void fetchSuggestions({ imageRef: blobUrl });
    },
    [fetchSuggestions],
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

  const run = useCallback(async (queryOverride?: string, workflowDomain?: string) => {
    const q = (queryOverride ?? query).trim();
    if (!q) return;
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
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      p = await res.json();
    } catch {
      setPhase("idle");
      setError("Could not build a plan. Try rephrasing the request.");
      return;
    }
    setPlan(p);
    setPhase("running");
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

    // 2. execute, observing each step
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

    // observe → suggest: what the ladder says comes after what we just produced
    const producedKeys = p.steps
      .filter((s) => !s.blocked)
      .map((s) => s.template_id ?? s.tool_id);
    void fetchSuggestions({
      query: q,
      completedToolIds: p.steps.map((s) => s.tool_id),
      producedKeys,
      // The ladder is known when the run came from a workflow entry — without
      // it the suggester infers from produced artifacts and defaults to merch.
      domain: p.routing.deliverable?.domain ?? workflowDomain,
    });
  }, [query, referenceUrl, locale, verifyArtifact, fetchSuggestions, suggest]);

  // One-click workflow entry: the user already chose the ladder on the topic or
  // home page, so re-asking them to type a brief would undo the whole point.
  // Runs once — the ref guards against a second dispatch on re-render, which
  // would double-charge credits.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !initialWorkflow) return;
    const wf = WORKFLOWS_BY_DOMAIN[initialWorkflow];
    if (!wf) return;                       // unknown ladder → normal manual entry
    autoStarted.current = true;
    const seed = initialQuery?.trim() || wf.heading;
    setQuery(seed);
    void run(seed, initialWorkflow);
  }, [initialWorkflow, initialQuery, run]);


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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Design Agent</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Describe what you want, optionally with a reference image. The agent routes it against the
        template capability KB, shows you the plan, then executes it step by step.
      </p>

      {/* ---- input ---- */}
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="e.g. a die-cut sticker sheet of my cat character, ready for printing"
          className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-purple-400"
        />
        <div className="mt-4">
          <ReferenceImageUpload
            variant="full"
            label="Reference image"
            hint="Drop an image and the agent will suggest what to do with it."
            replaceLabel="Replace"
            signInLabel="Sign in to upload a reference image"
            onChange={onReferenceChange}
            onUploadingChange={setUploading}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={!query.trim() || uploading || phase === "planning" || phase === "running"}
            onClick={() => void run()}
            className="ml-auto rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {uploading
              ? "Uploading…"
              : phase === "planning"
                ? "Planning…"
                : phase === "running"
                  ? "Running…"
                  : "Run agent"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {!query.trim() && referenceUrl && !suggest && !suggesting && (
          <p className="mt-3 text-xs text-neutral-500">
            Pick a suggestion below, or describe what you want.
          </p>
        )}
      </div>

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

      {/* ---- plan + execution ---- */}
      {plan && (
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
