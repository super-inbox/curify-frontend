import { NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { API_BASE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Trajectory sink (P0-B).
 *
 * Durable now: forwards to `POST {API_BASE}/design-agent/trajectory`, which
 * writes to the `design_trajectory_events` table (JSONB payload, nullable
 * user_id so signed-out runs are captured too).
 *
 * The previous version only appended JSONL to `.trajectories/` on local disk.
 * That path is writable in dev and read-only on serverless, so in production it
 * silently stored nothing — the exact failure its own comment warned about, for
 * the one feature whose data cannot be re-derived after the fact.
 *
 * The local file is kept as a FALLBACK, not the primary: if the backend is
 * unreachable we still want the events on the machine actually running design
 * tasks. `durable` reflects whether the BACKEND accepted them, so a caller can
 * tell real persistence from a local scratch copy.
 */

const MAX_EVENTS = 200;
const DIR = path.join(process.cwd(), ".trajectories");
const BACKEND_TIMEOUT_MS = 4000;

async function writeLocal(events: unknown[]): Promise<boolean> {
  try {
    await mkdir(DIR, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const line = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    await appendFile(path.join(DIR, `trajectories-${day}.jsonl`), line, "utf-8");
    return true;
  } catch {
    return false; // read-only FS (serverless) — expected, not an error
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const events = Array.isArray(body.events)
    ? (body.events as unknown[]).slice(0, MAX_EVENTS)
    : [];
  if (events.length === 0) {
    return NextResponse.json({ stored: 0, durable: false });
  }

  // The recorder stamps `run_id` (snake_case) onto every event and may also
  // send it at the top level; accept either rather than 400ing on a shape
  // mismatch, because a rejected batch is data we never get back.
  const pick = (v: unknown): string =>
    typeof v === "string" && v.trim() ? v.trim() : "";
  const runId =
    pick(body.runId) ||
    pick(body.run_id) ||
    events.reduce<string>((found, e) => {
      if (found) return found;
      const row = e as { run_id?: unknown; runId?: unknown } | null;
      return pick(row?.run_id) || pick(row?.runId);
    }, "");

  if (!runId) {
    // Without a runId these events cannot be grouped back into a trajectory,
    // which makes them useless rather than merely incomplete.
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  let durable = false;
  let reason: string | undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/design-agent/trajectory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        run_id: runId,
        events,
        user_id: typeof body.userId === "number" ? body.userId : null,
        session_id: typeof body.sessionId === "string" ? body.sessionId : null,
        locale: typeof body.locale === "string" ? body.locale : null,
      }),
      signal: controller.signal,
    });
    durable = res.ok;
    if (!res.ok) reason = `backend ${res.status}`;
  } catch (err) {
    reason = err instanceof Error ? err.name : "backend unreachable";
  } finally {
    clearTimeout(timer);
  }

  const localStored = await writeLocal(events);
  return NextResponse.json({
    stored: durable || localStored ? events.length : 0,
    durable,
    ...(durable ? {} : { reason: reason ?? "no writable sink", localStored }),
  });
}
