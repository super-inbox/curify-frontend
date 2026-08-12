import { NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Trajectory sink (P0-B v0).
 *
 * Appends JSONL to `.trajectories/` on a writable filesystem. That means it
 * captures locally — which is the point right now, since we are the ones
 * running real design tasks — and no-ops on read-only serverless.
 *
 * NOT the durable sink. `user_interactions.content_type` is a closed PG enum
 * with no suitable value and the table has no JSON payload column, so an
 * unknown content_type is silently dropped. Persisting properly needs a
 * backend change (a trajectory table, or ALTER TYPE + a JSONB column). Until
 * then this route is explicit about whether it actually stored anything, so a
 * caller can tell capture from silent loss.
 */

const MAX_EVENTS = 200;
const DIR = path.join(process.cwd(), ".trajectories");

export async function POST(req: Request) {
  let body: { events?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
  if (events.length === 0) {
    return NextResponse.json({ stored: 0, durable: false });
  }

  try {
    await mkdir(DIR, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const line = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    await appendFile(path.join(DIR, `trajectories-${day}.jsonl`), line, "utf-8");
    return NextResponse.json({ stored: events.length, durable: true });
  } catch {
    // Read-only FS (serverless) — report honestly rather than pretending.
    return NextResponse.json({ stored: 0, durable: false, reason: "no writable sink" });
  }
}
