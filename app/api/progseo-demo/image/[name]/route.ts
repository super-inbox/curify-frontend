import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_TMP_DIR = path.join(os.tmpdir(), "progseo-demo");

// Serves images written by the generate route from /tmp/progseo-demo/.
// Demo-only; not cached at the CDN edge.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // Reject anything that isn't <slug>.jpg with simple slug chars
  if (!/^[a-z0-9-]+\.jpg$/.test(name)) {
    return NextResponse.json({ error: "invalid name" }, { status: 400 });
  }
  const filePath = path.join(DEMO_TMP_DIR, name);
  try {
    const buf = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
