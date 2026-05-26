import { NextResponse } from "next/server";
import { matchTemplatesForQuery } from "@/lib/searchTemplateMatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lazy-loaded matcher endpoint for the search page.
//
// Client posts the query AFTER initial page render so Section A
// (existing inspirations) appears immediately; Section B fills in
// ~2-3s later when this endpoint resolves.
//
// Caching is process-local in lib/searchTemplateMatch.ts; same shape
// as the rewriter LRU. Vercel serverless invocations don't share
// memory so cross-request hit rate is limited.

const MAX_QUERY_LEN = 200;

export async function POST(req: Request) {
  let body: { query?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || query.length > MAX_QUERY_LEN) {
    return NextResponse.json({ matches: [] });
  }
  const matches = await matchTemplatesForQuery(query);
  return NextResponse.json({ matches });
}
