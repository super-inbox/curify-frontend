import {
  nanoGenerateService,
  type NanoProjectStatus,
} from "@/services/nanoGenerate";

const DEFAULT_POLL_INTERVAL_MS = 2_500;
const DEFAULT_POLL_MAX_MS = 180_000;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class NanoGenerationError extends Error {
  userFacing = true;
}

export function isAuthenticationError(error: unknown): boolean {
  return /API Error 401|unauthori[sz]ed|token.*expired/i.test(
    error instanceof Error ? error.message : String(error),
  );
}

export async function pollNanoResult(
  projectId: string,
  options: {
    initialDelayMs?: number;
    intervalMs?: number;
    maxMs?: number;
    getStatus?: (projectId: string) => Promise<NanoProjectStatus>;
    // Fires once with the COMPLETED status, so callers can read fields beyond
    // the URL (e.g. result_watermarked) without changing the return type —
    // three call sites and their tests depend on it resolving to a string.
    onComplete?: (status: NanoProjectStatus) => void;
  } = {},
): Promise<string> {
  const {
    initialDelayMs = 1_500,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
    maxMs = DEFAULT_POLL_MAX_MS,
    getStatus = nanoGenerateService.getProjectStatus,
    onComplete,
  } = options;
  const deadline = Date.now() + maxMs;
  if (initialDelayMs > 0) await sleep(initialDelayMs);

  while (Date.now() < deadline) {
    let project: NanoProjectStatus;
    try {
      project = await getStatus(projectId);
    } catch (error) {
      if (isAuthenticationError(error)) throw error;
      await sleep(intervalMs);
      continue;
    }
    const status = (project.status || "").toUpperCase();
    if (status === "COMPLETED") {
      if (project.result_url) {
        onComplete?.(project);
        return project.result_url;
      }
      throw new NanoGenerationError(
        "Generation finished but no image came back — please try again.",
      );
    }
    if (status === "FAILED") {
      throw new NanoGenerationError(
        project.failure_reason || "Generation failed. Please try again.",
      );
    }
    await sleep(intervalMs);
  }

  throw new NanoGenerationError(
    "This is taking longer than usual — please try again in a moment.",
  );
}
