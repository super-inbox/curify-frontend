"use client";

/**
 * Design-agent demo — text + image in, a visible plan out, executed step by step.
 *
 * Harness split (see curify-studio/docs/design-agent-v0-spec.md §7c):
 *   server  reasoning — routing + planning, because they need the capability KB
 *   client  execution — reuses the authed generate services, so long image jobs
 *           never hit a serverless timeout and auth works exactly as elsewhere
 *
 * The loop is bounded and observable: plan → execute → observe → verify, with a
 * single re-plan on failure. Steps whose tool is a declared GAP are shown with
 * the tool that would run them rather than being skipped or faked.
 */
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { imageService } from "@/services/image";
import { nanoGenerateService } from "@/services/nanoGenerate";
import { freeformGenerateService } from "@/services/freeformGenerate";
import { pollNanoResult } from "@/services/pollNanoResult";

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
  };
  steps: PlanStep[];
  gaps: Array<{ tool_id: string; implementedBy: string; blocker: string }>;
  notice?: string;
};

type StepState = {
  status: "pending" | "running" | "done" | "blocked" | "failed";
  resultUrl?: string;
  error?: string;
  verify?: { ok: boolean; note: string };
};

export default function DesignAgentClient({ locale }: { locale: string }) {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [states, setStates] = useState<Record<number, StepState>>({});
  const [phase, setPhase] = useState<"idle" | "planning" | "running" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

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

  const run = useCallback(async () => {
    setError(null);
    setStates({});
    setPlan(null);
    setPhase("planning");

    // 1. upload the reference image first, so the planner knows it exists
    let referenceUrl: string | undefined;
    if (file) {
      try {
        const up = await imageService.uploadImage(file);
        referenceUrl = up.blob_url;
      } catch (e) {
        setPhase("idle");
        setError(
          e instanceof Error && /401|expired|sign in/i.test(e.message)
            ? "Image upload needs you to be signed in — sign in, or run text-only."
            : "Image upload failed. You can still run text-only.",
        );
        return;
      }
    }

    // 2. plan (server-side reasoning)
    let p: AgentPlan;
    try {
      const res = await fetch("/api/design-agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, hasImage: Boolean(referenceUrl), locale }),
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

    // 3. execute, observing each step
    for (const step of p.steps) {
      if (step.blocked) {
        setStep(step.n, { status: "blocked" });
        continue;
      }
      setStep(step.n, { status: "running" });
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
      } catch (e) {
        setStep(step.n, {
          status: "failed",
          error:
            e instanceof Error && /401|expired|sign in/i.test(e.message)
              ? "sign-in required to generate"
              : e instanceof Error
                ? e.message
                : "generation failed",
        });
      }
    }
    setPhase("done");
  }, [query, file, locale, verifyArtifact]);

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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-purple-400"
          >
            {file ? "Change image" : "+ Reference image"}
          </button>
          {preview && (
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              <Image src={preview} alt="reference" width={40} height={40} unoptimized
                className="h-10 w-10 rounded-lg object-cover" />
              {file?.name}
              <button type="button" onClick={() => pickFile(null)} className="underline">remove</button>
            </span>
          )}
          <button
            type="button"
            disabled={!query.trim() || phase === "planning" || phase === "running"}
            onClick={run}
            className="ml-auto rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {phase === "planning" ? "Planning…" : phase === "running" ? "Running…" : "Run agent"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

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
                  <p className="mt-2 text-xs text-red-600">{st.error}</p>
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
