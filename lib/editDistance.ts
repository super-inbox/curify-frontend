import { buildExampleId } from "@/lib/nano_utils";

export const SIMILARITY_THRESHOLD = 0.92;

export type ExistingExampleRef = { id: string; params: Record<string, any> };

/**
 * Returns the best duplicate match for the given form, or null if none exceeds the threshold.
 */
export function findDuplicate(
  templateId: string,
  currentForm: Record<string, any>,
  existingExamples: ExistingExampleRef[],
  threshold = SIMILARITY_THRESHOLD
): { exampleId: string; score: number } | null {
  if (existingExamples.length === 0) return null;

  const currentExampleId = buildExampleId(templateId, currentForm as Record<string, string>);
  const exactMatch = existingExamples.find((ex) => ex.id === currentExampleId);
  if (exactMatch) return { exampleId: exactMatch.id, score: 1 };

  const currentKey = paramsToKey(currentForm);
  if (!currentKey) return null;

  let best: { exampleId: string; score: number } | null = null;
  for (const ex of existingExamples) {
    const score = similarity(currentKey, paramsToKey(ex.params));
    if (score >= threshold && (!best || score > best.score)) {
      best = { exampleId: ex.id, score };
    }
  }
  return best;
}

/**
 * Levenshtein edit distance between two strings.
 */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use two rows to keep memory O(n)
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Normalised similarity in [0, 1]: 1 = identical, 0 = completely different.
 */
export function similarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - editDistance(a, b) / maxLen;
}

/**
 * Canonical string for a params map: sort keys, join as "k:v|k:v", lowercase.
 */
export function paramsToKey(params: Record<string, any>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}:${String(params[k] ?? "").trim().toLowerCase()}`)
    .join("|");
}
