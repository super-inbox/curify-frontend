import nanoTemplates from "@/public/data/nano_templates.json";
import capabilityKb from "@/scripts/configs/template_capability_kb.json";
import { tsToSc } from "@/lib/zh_normalize";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";
import {
  rerankTemplateCandidatesForQuery,
  type TemplateMatch,
} from "@/lib/searchTemplateMatch";
import { retrieveTemplateCandidatesForQuery } from "@/lib/searchTemplateRetrieval";

/** Re-exported from lib/pricing so the search plan and the generate buttons can
 *  never quote different numbers. Do not redefine the literal here. */
export const SEARCH_GENERATION_CREDITS_PER_IMAGE = IMAGE_GENERATION_CREDITS;
const MIN_CONFIDENCE = 0.6;
const MAX_DIRECTIONS = 3;

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
  source: "similarity" | "fallback";
  directions: SearchGenerationDirection[];
  credits_per_image: number;
  total_credits: number;
  notice?: string;
};

type PlannerDependencies = {
  candidateRetriever: (
    query: string,
  ) => Promise<Array<{ template_id: string }>>;
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

function normalizeQuery(value: string): string {
  return tsToSc(value.trim().toLowerCase().replace(/×/g, "x"));
}

function requiresReferenceImage(value: string): boolean {
  const normalized = normalizeQuery(value);
  return (
    normalized === "证件照" ||
    /\b(?:id|passport) photos?\b/.test(normalized)
  );
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

function genericFallbackDirection(
  query: string,
): SearchGenerationDirection | null {
  return decorateDirection({
    template_id: "template-education",
    params: { topic: query.trim() },
    confidence: MIN_CONFIDENCE,
    reason:
      "No specialized template matched, so Curify will create a general visual explainer.",
  });
}

export async function buildSearchGenerationPlan(
  query: string,
  locale = "en",
  dependencies: PlannerDependencies = {
    candidateRetriever: retrieveTemplateCandidatesForQuery,
    targetedReranker: rerankTemplateCandidatesForQuery,
  },
): Promise<SearchGenerationPlan> {
  if (requiresReferenceImage(query)) {
    return {
      source: "similarity",
      directions: [],
      credits_per_image: SEARCH_GENERATION_CREDITS_PER_IMAGE,
      total_credits: 0,
      notice: locale.toLowerCase().startsWith("zh")
        ? "证件照需要上传本人照片，当前搜索页仅支持无需参考图的直接生成。"
        : "ID photos require a portrait upload; this search flow currently supports text-only generation.",
    };
  }

  const similarityMatches = await dependencies.candidateRetriever(query);
  const candidateIds = [
    ...new Set(similarityMatches.map((match) => match.template_id)),
  ];
  const reranked = await dependencies.targetedReranker(query, candidateIds);
  const validReranked = reranked.filter(
    (match) => match.confidence >= MIN_CONFIDENCE && decorateDirection(match),
  );
  const selected = validReranked;

  const seen = new Set<string>();
  let directions = selected
    .filter((match) => match.confidence >= MIN_CONFIDENCE)
    .map(decorateDirection)
    .filter((direction): direction is SearchGenerationDirection => {
      if (!direction || seen.has(direction.template_id)) return false;
      seen.add(direction.template_id);
      return true;
    })
    .slice(0, MAX_DIRECTIONS);

  let source: SearchGenerationPlan["source"] = "similarity";
  if (directions.length === 0) {
    const fallback = genericFallbackDirection(query);
    if (fallback) {
      directions = [fallback];
      source = "fallback";
    }
  }

  return {
    source,
    directions,
    credits_per_image: SEARCH_GENERATION_CREDITS_PER_IMAGE,
    total_credits:
      directions.length * SEARCH_GENERATION_CREDITS_PER_IMAGE,
  };
}
