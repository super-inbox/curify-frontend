/**
 * Design trajectory capture (P0-B).
 *
 * ⚠️ NOT CANONICAL. `agent_runtime/tracing.py` + `persistence.py` in
 * agentic-adhoc/design-agent-v0 already implement trace capture with typed
 * steps, a pluggable sink and redaction. This module covers the frontend demo
 * only; the redaction below is deliberately copied from that implementation so
 * the two agree. Merge target, not a second system — see spec §7h.
 *
 * The 08-12 digest argues the scarce, un-scrapable asset is not images or
 * prompts but the DESIGN TRAJECTORY:
 *
 *   brief → references → style direction → params → candidates →
 *   which was chosen and WHY → what changed → before/after around human
 *   feedback → final → accepted?
 *
 * Every other P0 item is merely not-done-yet; a design task run WITHOUT this is
 * permanently lost data. So this ships ahead of the harness work.
 *
 * WHY NOT the existing tracking table: `user_interactions.content_type` is a
 * closed Postgres enum with no suitable value, and the table has no JSON payload
 * column — an unknown content_type is silently rejected, which for a
 * data-collection feature is the worst possible failure (it looks like it works).
 * Adding a value needs ALTER TYPE plus a column, i.e. backend work. Until then
 * the sink is local-only (see /api/design-agent/trajectory), which is genuinely
 * useful now because WE are the ones running real design tasks.
 *
 * Design notes:
 * - Events are append-only and carry a runId, so a trajectory reconstructs by
 *   grouping — no server-side session state required.
 * - `suggestion_chosen` is the first real PREFERENCE signal we can capture
 *   today: which of three offered directions a human actually picked.
 * - `feedback` is specified now but only fires once refinement turns exist
 *   (P0-F). The before→feedback→after triple is the most valuable part, so the
 *   schema reserves it rather than being retrofitted later.
 */

export type TrajectoryEvent =
  | { type: "run_started"; query: string; hasImage: boolean; locale: string }
  | {
      type: "routed";
      confidence: number;
      abstained: boolean;
      deliverableType?: string;
      deliverableRationale?: string;
      matched: Array<{ template_id: string; confidence: number }>;
    }
  | {
      type: "planned";
      steps: Array<{ n: number; tool_id: string; template_id?: string; blocked: boolean }>;
    }
  | { type: "step_started"; n: number; tool_id: string; template_id?: string; params?: Record<string, string> }
  | {
      type: "step_result";
      n: number;
      tool_id: string;
      status: "done" | "failed" | "blocked";
      artifact_url?: string;
      verify_ok?: boolean;
      error?: string;
    }
  | { type: "suggestions_shown"; context: string; options: Array<{ label: string; domain: string }> }
  /** The preference signal: which of the offered directions a human chose. */
  | { type: "suggestion_chosen"; label: string; domain: string; query: string }
  /** Reserved for P0-F — the before → feedback → after triple. */
  | { type: "feedback"; n?: number; sentiment: "positive" | "negative"; text?: string; before_url?: string; after_url?: string }
  | { type: "run_finished"; outcome: "completed" | "partial" | "failed"; artifacts: number };

export type TrajectoryEnvelope = TrajectoryEvent & {
  run_id: string;
  seq: number;
  ts: string;
};

export function newRunId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Redact before persisting. Mirrors the discipline in the backend runtime's
 * `agent_runtime/tracing.py` (`safe_error` / `safe_summary`), which strips
 * signed URLs and upload refs out of traces. Artifact URLs are time-limited
 * signed GCS links and upload paths embed a user id, so neither belongs in a
 * durable log; the object path is enough to identify an artifact later.
 */
function redact(value: string): string {
  return value
    // keep the object path, drop the signature/query string
    .replace(/(https?:\/\/[^\s?]+)\?[^\s]*/g, "$1")
    .replace(/images\/uploads\/\d+\/([\w.-]+)/g, "images/uploads/[user]/$1")
    .slice(0, 2000);
}

function redactEvent<T extends TrajectoryEvent>(ev: T): T {
  const out = { ...ev } as Record<string, unknown>;
  for (const k of ["artifact_url", "before_url", "after_url", "error"]) {
    if (typeof out[k] === "string") out[k] = redact(out[k] as string);
  }
  return out as T;
}

/**
 * Fire-and-forget recorder. Never throws and never blocks the agent — a lost
 * trajectory event must not cost a user their generation.
 */
export function createTrajectoryRecorder(runId: string) {
  let seq = 0;
  const queue: TrajectoryEnvelope[] = [];
  let flushing = false;

  async function flush() {
    if (flushing || queue.length === 0) return;
    flushing = true;
    const batch = queue.splice(0, queue.length);
    try {
      await fetch("/api/design-agent/trajectory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
    } catch {
      /* dropped on purpose — never surface a logging failure to the user */
    } finally {
      flushing = false;
      if (queue.length) void flush();
    }
  }

  return {
    runId,
    record(ev: TrajectoryEvent) {
      queue.push({ ...redactEvent(ev), run_id: runId, seq: seq++, ts: new Date().toISOString() });
      void flush();
    },
  };
}

export type TrajectoryRecorder = ReturnType<typeof createTrajectoryRecorder>;
