import { buildExampleId } from "@/lib/nano_pure";
import type { SearchGenerationDirection } from "@/lib/searchGenerationPlan";
import {
  nanoGenerateService,
  type NanoGenerateRequest,
  type NanoGenerateResponse,
} from "@/services/nanoGenerate";
import {
  NanoGenerationError,
  isAuthenticationError,
  pollNanoResult,
} from "@/services/pollNanoResult";

export type SearchGenerationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed"
  | "stopped";

export type SearchGenerationBatchItem = SearchGenerationDirection & {
  status: SearchGenerationStatus;
  projectId?: string;
  resultUrl?: string;
  error?: string;
};

type BatchDependencies = {
  start: (
    request: NanoGenerateRequest,
    locale: string,
  ) => Promise<NanoGenerateResponse>;
  poll: (projectId: string) => Promise<string>;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Generation failed.";
}

export function isFatalSearchGenerationError(error: unknown): boolean {
  return (
    isAuthenticationError(error) ||
    /insufficient.*credit|not enough credit|credit balance/i.test(
      errorMessage(error),
    )
  );
}

function uniqueExampleId(
  direction: SearchGenerationDirection,
  batchId: string,
  index: number,
): string {
  const base = buildExampleId(direction.template_id, direction.params).slice(
    0,
    160,
  );
  return `${base}-search-${batchId}-${index + 1}`;
}

export async function runSearchGenerationBatch(
  directions: SearchGenerationDirection[],
  options: {
    locale: string;
    onUpdate?: (index: number, item: SearchGenerationBatchItem) => void;
    batchId?: string;
  },
  dependencies: BatchDependencies = {
    start: (request, locale) =>
      nanoGenerateService.generate(request, { locale }),
    poll: pollNanoResult,
  },
): Promise<SearchGenerationBatchItem[]> {
  const batchId =
    options.batchId ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const items: SearchGenerationBatchItem[] = directions.map((direction) => ({
    ...direction,
    params: { ...direction.params },
    status: "pending",
  }));
  const update = (index: number, patch: Partial<SearchGenerationBatchItem>) => {
    items[index] = { ...items[index], ...patch };
    options.onUpdate?.(index, { ...items[index] });
  };

  for (let index = 0; index < items.length; index += 1) {
    const direction = items[index];
    update(index, { status: "generating", error: undefined });
    try {
      const response = await dependencies.start(
        {
          template_id: direction.template_id,
          params: direction.params,
          example_id: uniqueExampleId(direction, batchId, index),
        },
        options.locale,
      );
      if (!response.success) {
        throw new NanoGenerationError(
          response.message || "Generation failed. Please try again.",
        );
      }
      let resultUrl = response.signed_url;
      if (!resultUrl) {
        if (!response.project_id) {
          throw new NanoGenerationError(
            response.message || "Generation did not return a project.",
          );
        }
        update(index, { projectId: response.project_id });
        resultUrl = await dependencies.poll(response.project_id);
      }
      update(index, {
        status: "completed",
        projectId: response.project_id,
        resultUrl,
      });
    } catch (error) {
      update(index, { status: "failed", error: errorMessage(error) });
      if (!isFatalSearchGenerationError(error)) continue;
      for (let remaining = index + 1; remaining < items.length; remaining += 1) {
        update(remaining, {
          status: "stopped",
          error: "Stopped because authentication or credits need attention.",
        });
      }
      break;
    }
  }

  return items;
}
