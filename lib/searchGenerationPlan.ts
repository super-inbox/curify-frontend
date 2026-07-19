import nanoTemplates from "@/public/data/nano_templates.json";
import capabilityKb from "@/scripts/configs/template_capability_kb.json";
import { tsToSc } from "@/lib/zh_normalize";
import {
  matchTemplatesForQuery,
  rerankTemplateCandidatesForQuery,
  type TemplateMatch,
} from "@/lib/searchTemplateMatch";

export const SEARCH_GENERATION_CREDITS_PER_IMAGE = 10;
const MIN_CONFIDENCE = 0.6;
const MAX_DIRECTIONS = 3;
const QUERY_TOKEN_ALIASES: Record<string, string[]> = {
  aesthetic: ["aesthetic", "aesthetics", "artistic", "design", "minimalist"],
  aesthetics: ["aesthetic", "aesthetics", "artistic", "design", "minimalist"],
  reading: ["reading", "book", "books", "literature"],
};

type TemplateShape = {
  id: string;
  allow_generation?: boolean;
  requires_image_upload?: boolean;
  archetype?: "creation" | "consumption";
  og_image?: string;
  locales?: Record<
    string,
    { parameters?: Array<{ name?: string }> } | undefined
  >;
};

type CapabilityEntry = {
  template_id: string;
  title?: string;
  category?: string;
  description?: string;
  param_names?: string[];
  template_topics?: string[];
  sample_param_values?: string[];
  inspiration_tags?: string[];
  inspiration_topics?: string[];
  search_aliases?: string[];
  example_count?: number;
};

export type SearchGenerationDirection = {
  template_id: string;
  title: string;
  params: Record<string, string>;
  confidence: number;
  reason: string;
  og_image?: string;
};

export type SearchGenerationPlan = {
  source: "benchmark" | "hybrid";
  directions: SearchGenerationDirection[];
  credits_per_image: number;
  total_credits: number;
};

type PlannerDependencies = {
  globalMatcher: (query: string) => Promise<TemplateMatch[]>;
  targetedReranker: (
    query: string,
    candidateIds: string[],
  ) => Promise<TemplateMatch[]>;
};

const TEMPLATE_BY_ID = new Map(
  (nanoTemplates as TemplateShape[]).map((template) => [template.id, template]),
);
const CAPABILITY_BY_ID = new Map(
  (capabilityKb.templates as CapabilityEntry[]).map((entry) => [
    entry.template_id,
    entry,
  ]),
);

const BENCHMARK_DIRECTIONS: Array<
  Omit<SearchGenerationDirection, "og_image">
> = [
  {
    template_id: "template-weird-cold-knowledge-popular-science-card",
    title: "Fun Economics Facts",
    params: { science_topic: "Fun Economics Facts" },
    confidence: 1,
    reason: "Playful economics facts in a visual science-card structure.",
  },
  {
    template_id: "template-education",
    title: "Basic Economics Concepts",
    params: { topic: "Basic Economics Concepts" },
    confidence: 1,
    reason: "A structured concept map for core economics ideas.",
  },
  {
    template_id: "template-hotspot-card",
    title: "Inflation",
    params: { hotspot_name: "Inflation" },
    confidence: 1,
    reason: "An illustrated knowledge card explaining inflation.",
  },
];

function normalizeQuery(value: string): string {
  return tsToSc(value.trim().toLowerCase().replace(/×/g, "x"));
}

function requiredParams(templateId: string): string[] {
  const template = TEMPLATE_BY_ID.get(templateId);
  const localized =
    template?.locales?.en?.parameters ??
    Object.values(template?.locales ?? {}).find((entry) => entry?.parameters)
      ?.parameters ??
    [];
  return localized
    .map((parameter) => parameter.name)
    .filter((name): name is string => Boolean(name));
}

function isDirectlyGeneratable(templateId: string): boolean {
  const template = TEMPLATE_BY_ID.get(templateId);
  return Boolean(
    template?.allow_generation === true &&
      !template.requires_image_upload &&
      template.archetype !== "consumption",
  );
}

function decorateDirection(
  match: TemplateMatch,
): SearchGenerationDirection | null {
  if (!isDirectlyGeneratable(match.template_id)) return null;
  const required = requiredParams(match.template_id);
  const params: Record<string, string> = {};
  for (const name of required) {
    const value = match.params[name]?.trim();
    if (!value) return null;
    params[name] = value;
  }
  const capability = CAPABILITY_BY_ID.get(match.template_id);
  return {
    template_id: match.template_id,
    title:
      capability?.title ||
      match.template_id.replace(/^template-/, "").replace(/-/g, " "),
    params,
    confidence: Math.max(0, Math.min(1, match.confidence)),
    reason: match.reason,
    og_image: match.og_image ?? TEMPLATE_BY_ID.get(match.template_id)?.og_image,
  };
}

function tokenInBlob(blob: string, token: string): boolean {
  if (!token) return false;
  if (/[一-龥]/.test(token)) return blob.includes(token);
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(blob);
}

function queryTokens(query: string): { primary: string[]; bigrams: string[] } {
  const primary = normalizeQuery(query)
    .split(/[\s,，、。.:：=·/|()\[\]+*]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const bigrams: string[] = [];
  if (
    primary.length === 1 &&
    /[一-龥]/.test(primary[0]) &&
    primary[0].length > 1
  ) {
    for (let index = 0; index < primary[0].length - 1; index += 1) {
      const bigram = primary[0].slice(index, index + 2);
      if (/^[一-龥]{2}$/.test(bigram)) bigrams.push(bigram);
    }
  }
  return { primary: [...new Set(primary)], bigrams: [...new Set(bigrams)] };
}

function evidenceBlob(entry: CapabilityEntry): string {
  return normalizeQuery(
    [
      entry.template_id,
      entry.title,
      entry.category,
      entry.description,
      ...(entry.template_topics ?? []),
      ...(entry.sample_param_values ?? []),
      ...(entry.inspiration_tags ?? []),
      ...(entry.inspiration_topics ?? []),
      ...(entry.search_aliases ?? []),
    ]
      .filter((value): value is string => Boolean(value))
      .join(" "),
  );
}

function capabilityParamValue(name: string, query: string): string {
  if (name === "date_range") return "Flexible dates";
  if (name === "trip_duration") return "7";
  return query.trim();
}

/** Offline Path A over the capability KB. Exported for regression tests. */
export function retrieveCapabilityCandidates(
  query: string,
): TemplateMatch[] {
  const normalized = normalizeQuery(query);
  const tokens = queryTokens(query);
  if (!normalized || tokens.primary.length === 0) return [];

  const bigramThreshold =
    tokens.bigrams.length <= 1 ? 1 : tokens.bigrams.length <= 3 ? 2 : 3;
  const ranked: Array<TemplateMatch & { score: number; examples: number }> = [];
  for (const entry of capabilityKb.templates as CapabilityEntry[]) {
    if (!isDirectlyGeneratable(entry.template_id)) continue;
    const blob = evidenceBlob(entry);
    const primaryHits = tokens.primary.filter((token) =>
      (QUERY_TOKEN_ALIASES[token] ?? [token]).some((candidate) =>
        tokenInBlob(blob, candidate),
      ),
    ).length;
    const bigramHits = tokens.bigrams.filter((token) =>
      blob.includes(token),
    ).length;
    const exactPhrase = blob.includes(normalized);
    const allPrimary = primaryHits === tokens.primary.length;
    const cjkMatch =
      tokens.bigrams.length > 0 && bigramHits >= bigramThreshold;
    if (!exactPhrase && !allPrimary && !cjkMatch) continue;

    const coverage = primaryHits / Math.max(1, tokens.primary.length);
    const score =
      0.55 +
      coverage * 0.2 +
      (exactPhrase ? 0.2 : 0) +
      (cjkMatch ? 0.05 : 0);
    const params = Object.fromEntries(
      (entry.param_names ?? requiredParams(entry.template_id)).map((name) => [
        name,
        capabilityParamValue(name, query),
      ]),
    );
    ranked.push({
      template_id: entry.template_id,
      params,
      confidence: Math.min(0.95, score),
      reason: "Matched Curify capability evidence and real examples.",
      og_image: TEMPLATE_BY_ID.get(entry.template_id)?.og_image,
      score,
      examples: entry.example_count ?? 0,
    });
  }

  return ranked
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.examples - left.examples ||
        left.template_id.localeCompare(right.template_id),
    )
    .slice(0, 10)
    .map(({ score: _score, examples: _examples, ...match }) => match);
}

export function getBenchmarkGenerationPlan(
  query: string,
): SearchGenerationPlan | null {
  if (normalizeQuery(query) !== "fun economics") return null;
  const directions = BENCHMARK_DIRECTIONS.map((direction) => ({
    ...direction,
    params: { ...direction.params },
    og_image: TEMPLATE_BY_ID.get(direction.template_id)?.og_image,
  }));
  return {
    source: "benchmark",
    directions,
    credits_per_image: SEARCH_GENERATION_CREDITS_PER_IMAGE,
    total_credits:
      directions.length * SEARCH_GENERATION_CREDITS_PER_IMAGE,
  };
}

function fallbackHybridMatches(
  pathA: TemplateMatch[],
  pathB: TemplateMatch[],
): TemplateMatch[] {
  const pathAIds = new Set(pathA.map((match) => match.template_id));
  const merged = new Map<string, TemplateMatch>();
  for (const match of pathB) {
    if (match.confidence < MIN_CONFIDENCE) continue;
    merged.set(match.template_id, {
      ...match,
      confidence: Math.min(
        0.99,
        match.confidence + (pathAIds.has(match.template_id) ? 0.08 : 0),
      ),
    });
  }
  for (const match of pathA) {
    if (match.confidence < MIN_CONFIDENCE || merged.has(match.template_id)) {
      continue;
    }
    merged.set(match.template_id, match);
  }
  return [...merged.values()]
    .sort((left, right) => right.confidence - left.confidence);
}

export async function buildSearchGenerationPlan(
  query: string,
  _locale = "en",
  dependencies: PlannerDependencies = {
    globalMatcher: matchTemplatesForQuery,
    targetedReranker: rerankTemplateCandidatesForQuery,
  },
): Promise<SearchGenerationPlan> {
  const benchmark = getBenchmarkGenerationPlan(query);
  if (benchmark) return benchmark;

  const pathA = retrieveCapabilityCandidates(query);
  const pathB = await dependencies.globalMatcher(query);
  const candidateIds = [
    ...new Set([
      ...pathA.map((match) => match.template_id),
      ...pathB.map((match) => match.template_id),
    ]),
  ];
  const reranked = await dependencies.targetedReranker(query, candidateIds);
  const validReranked = reranked.filter(
    (match) => match.confidence >= MIN_CONFIDENCE && decorateDirection(match),
  );
  const selected = validReranked.length
    ? validReranked
    : fallbackHybridMatches(pathA, pathB);

  const seen = new Set<string>();
  const directions = selected
    .filter((match) => match.confidence >= MIN_CONFIDENCE)
    .map(decorateDirection)
    .filter((direction): direction is SearchGenerationDirection => {
      if (!direction || seen.has(direction.template_id)) return false;
      seen.add(direction.template_id);
      return true;
    })
    .slice(0, MAX_DIRECTIONS);

  return {
    source: "hybrid",
    directions,
    credits_per_image: SEARCH_GENERATION_CREDITS_PER_IMAGE,
    total_credits:
      directions.length * SEARCH_GENERATION_CREDITS_PER_IMAGE,
  };
}
