import OpenAI from "openai";
import nanoTemplates from "@/public/data/nano_templates.json";
import enNano from "@/messages/en/nano.json";
import capabilityKb from "@/scripts/configs/template_capability_kb.json";
import { getOutputIntent, INTENT_META } from "@/lib/output_intent";

const INTENT_MODEL = "gpt-4o-mini";
const EMBEDDING_MODEL = "text-embedding-3-small";
const TIMEOUT_MS = 15_000;
const PER_ROUTE_LIMIT = 6;
const MAX_CANDIDATES = 18;
const ROUTE_WEIGHTS: Record<SemanticRetrievalRoute["kind"], number> = {
  original: 1,
  subject: 1,
  goal: 0.9,
  style_format: 0.8,
};
const CACHE_MAX = 256;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

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

type NanoMessages = Record<
  string,
  { title?: string; description?: string } | undefined
>;

type CapabilityEntry = {
  template_id: string;
  title?: string;
  category?: string;
  description?: string;
  template_topics?: string[];
};

export type SearchGoal =
  | "explain"
  | "compare"
  | "guide"
  | "analyze"
  | "promote"
  | "visualize"
  | "explore";

export type SearchIntent = {
  subject: string;
  goal?: SearchGoal;
  tone: string[];
  artifact?: string;
  layout?: string;
  audience?: string;
  routes: Array<{
    kind: "subject" | "goal" | "style_format";
    query: string;
  }>;
};

export type SemanticRetrievalRoute = {
  kind: "original" | "subject" | "goal" | "style_format";
  query: string;
};

export type RetrievedTemplateCandidate = {
  template_id: string;
  similarity: number;
  matched_routes: string[];
  reason: string;
  og_image?: string;
};

type TemplateDocument = {
  template_id: string;
  text: string;
  og_image?: string;
};

export type EmbeddedTemplate = TemplateDocument & {
  embedding: number[];
};

type CachedRetrieval = {
  candidates: RetrievedTemplateCandidate[];
  at: number;
};

const CAPABILITY_BY_ID = new Map(
  (capabilityKb.templates as CapabilityEntry[]).map((entry) => [
    entry.template_id,
    entry,
  ]),
);

function isDirectlyGeneratable(template: TemplateShape): boolean {
  return Boolean(
    template.allow_generation === true &&
      !template.requires_image_upload &&
      template.archetype !== "consumption",
  );
}

function requiredParams(template: TemplateShape): string[] {
  const localized =
    template.locales?.en?.parameters ??
    Object.values(template.locales ?? {}).find((entry) => entry?.parameters)
      ?.parameters ??
    [];
  return localized
    .map((parameter) => parameter.name)
    .filter((name): name is string => Boolean(name));
}

/**
 * Runtime retrieval documents intentionally exclude search aliases and sample
 * values. Those fields may contain evaluation queries; generic capability
 * metadata keeps benchmark inputs separate from production routing.
 */
function buildTemplateDocuments(): TemplateDocument[] {
  const en = enNano as NanoMessages;
  return (nanoTemplates as TemplateShape[])
    .filter(isDirectlyGeneratable)
    .map((template) => {
      const capability = CAPABILITY_BY_ID.get(template.id);
      const intent = getOutputIntent(template.id);
      const parts = [
        `Template: ${capability?.title || en[template.id]?.title || template.id}`,
        capability?.category ? `Category: ${capability.category}` : "",
        `Description: ${
          capability?.description || en[template.id]?.description || ""
        }`,
        capability?.template_topics?.length
          ? `Capabilities: ${capability.template_topics.join(", ")}`
          : "",
        `Output goal: ${INTENT_META[intent].jtbd}`,
        `Required parameters: ${requiredParams(template).join(", ") || "none"}`,
      ];
      return {
        template_id: template.id,
        text: parts.filter(Boolean).join("\n"),
        og_image: template.og_image,
      };
    });
}

const TEMPLATE_DOCUMENTS = buildTemplateDocuments();

const INTENT_PROMPT = `Analyze a user's image-generation search query for semantic retrieval.

Do not select or name templates. Do not use benchmark mappings, memorized gold
answers, or query-specific routing rules. Preserve the user's subject and all
explicit modifiers. Do not invent a requested layout, audience, or artifact.

Return:
- subject: the core subject or entity
- goal: one of explain, compare, guide, analyze, promote, visualize, explore;
  otherwise an empty string. Tone words are not goals.
- tone: explicit tone/style adjectives only
- artifact: explicit artifact type only (poster, chart, guide, etc.)
- layout: explicit layout only (grid, comparison, timeline, etc.)
- audience: explicit audience only
- routes: 1-3 independent semantic retrieval formulations. Use only these kinds:
  subject, goal, style_format. Each route must preserve the original subject.

Return ONLY JSON:
{"subject":"...","goal":"","tone":[],"artifact":"","layout":"","audience":"","routes":[{"kind":"subject","query":"..."}]}`;

const retrievalCache = new Map<string, CachedRetrieval>();
let client: OpenAI | null | undefined;
let templateIndexPromise: Promise<EmbeddedTemplate[]> | null = null;

function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    client = null;
    return null;
  }
  try {
    client = new OpenAI({ apiKey: key, timeout: TIMEOUT_MS });
  } catch {
    client = null;
  }
  return client;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function sanitizeIntent(raw: unknown, query: string): SearchIntent {
  const source = raw && typeof raw === "object" ? raw : {};
  const data = source as Record<string, unknown>;
  const allowedKinds = new Set(["subject", "goal", "style_format"]);
  const allowedGoals = new Set<SearchGoal>([
    "explain",
    "compare",
    "guide",
    "analyze",
    "promote",
    "visualize",
    "explore",
  ]);
  const rawGoal = optionalString(data.goal)?.toLowerCase();
  const goal =
    rawGoal && allowedGoals.has(rawGoal as SearchGoal)
      ? (rawGoal as SearchGoal)
      : undefined;
  const routes = Array.isArray(data.routes)
    ? data.routes
        .map((route) => {
          if (!route || typeof route !== "object") return null;
          const item = route as Record<string, unknown>;
          const kind = optionalString(item.kind);
          const routeQuery = optionalString(item.query);
          if (!kind || !routeQuery || !allowedKinds.has(kind)) return null;
          return {
            kind: kind as "subject" | "goal" | "style_format",
            query: routeQuery,
          };
        })
        .filter((route): route is SearchIntent["routes"][number] => Boolean(route))
        .slice(0, 3)
    : [];
  return {
    subject: optionalString(data.subject) || query,
    goal,
    tone: Array.isArray(data.tone)
      ? data.tone
          .map(optionalString)
          .filter((value): value is string => Boolean(value))
          .slice(0, 5)
      : [],
    artifact: optionalString(data.artifact),
    layout: optionalString(data.layout),
    audience: optionalString(data.audience),
    routes,
  };
}

export function buildSemanticRetrievalRoutes(
  query: string,
  intent: SearchIntent,
): SemanticRetrievalRoute[] {
  const original = query.trim();
  const byKind = new Map(intent.routes.map((route) => [route.kind, route.query]));
  const subject = intent.subject.trim();
  const generated: Array<SemanticRetrievalRoute | null> = [
    { kind: "original", query: original },
    subject
      ? {
          kind: "subject",
          query: byKind.get("subject") || subject,
        }
      : null,
    intent.goal
      ? {
          kind: "goal",
          query:
            byKind.get("goal") ||
            `${subject || original}; goal: ${intent.goal}; visual content`,
        }
      : null,
    intent.tone.length || intent.artifact || intent.layout || intent.audience
      ? {
          kind: "style_format",
          query:
            byKind.get("style_format") ||
            [
              subject || original,
              intent.tone.length ? `tone: ${intent.tone.join(", ")}` : "",
              intent.artifact ? `artifact: ${intent.artifact}` : "",
              intent.layout ? `layout: ${intent.layout}` : "",
              intent.audience ? `audience: ${intent.audience}` : "",
            ]
              .filter(Boolean)
              .join("; "),
        }
      : null,
  ];
  const seen = new Set<string>();
  const routes: SemanticRetrievalRoute[] = [];
  for (const route of generated) {
    if (!route) continue;
    const normalized = route.query.trim().toLowerCase().replace(/\s+/g, " ");
    if (normalized.length < 2 || seen.has(normalized)) {
      const fallback =
        route.kind === "subject"
          ? subject
          : route.kind === "goal" && intent.goal
            ? `${subject || original}; goal: ${intent.goal}; visual content`
            : route.kind === "style_format"
              ? [
                  subject || original,
                  intent.tone.length ? `tone: ${intent.tone.join(", ")}` : "",
                  intent.artifact ? `artifact: ${intent.artifact}` : "",
                  intent.layout ? `layout: ${intent.layout}` : "",
                  intent.audience ? `audience: ${intent.audience}` : "",
                ]
                  .filter(Boolean)
                  .join("; ")
              : "";
      const fallbackNormalized = fallback
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (fallbackNormalized.length < 2 || seen.has(fallbackNormalized)) continue;
      route.query = fallback.trim();
      seen.add(fallbackNormalized);
      routes.push(route);
      continue;
    }
    seen.add(normalized);
    route.query = route.query.trim();
    routes.push(route);
  }
  return routes.slice(0, 4);
}

async function analyzeIntent(
  openai: OpenAI,
  query: string,
): Promise<SearchIntent> {
  try {
    const response = await openai.chat.completions.create({
      model: INTENT_MODEL,
      temperature: 0,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INTENT_PROMPT },
        { role: "user", content: `Query: ${query}` },
      ],
    });
    const raw = response.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return sanitizeIntent(JSON.parse(cleaned), query);
  } catch {
    return sanitizeIntent({}, query);
  }
}

async function embedTexts(openai: OpenAI, inputs: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    encoding_format: "float",
  });
  return response.data
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((item) => item.embedding);
}

function getTemplateIndex(openai: OpenAI): Promise<EmbeddedTemplate[]> {
  if (templateIndexPromise) return templateIndexPromise;
  templateIndexPromise = embedTexts(
    openai,
    TEMPLATE_DOCUMENTS.map((document) => document.text),
  )
    .then((embeddings) => {
      if (embeddings.length !== TEMPLATE_DOCUMENTS.length) {
        throw new Error("template embedding count mismatch");
      }
      return TEMPLATE_DOCUMENTS.map((document, index) => ({
        ...document,
        embedding: embeddings[index],
      }));
    })
    .catch((error) => {
      templateIndexPromise = null;
      throw error;
    });
  return templateIndexPromise;
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || left.length !== right.length) return -1;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dot / denominator : -1;
}

export function rankMultiRouteCandidates(
  templates: EmbeddedTemplate[],
  routes: SemanticRetrievalRoute[],
  routeEmbeddings: number[][],
): RetrievedTemplateCandidate[] {
  const merged = new Map<
    string,
    {
      template: EmbeddedTemplate;
      bestSimilarity: number;
      bestWeightedScore: number;
      matchedRoutes: Set<string>;
    }
  >();

  routes.forEach((route, routeIndex) => {
    const embedding = routeEmbeddings[routeIndex];
    if (!embedding) return;
    const nearest = templates
      .map((template) => ({
        template,
        similarity: cosineSimilarity(template.embedding, embedding),
      }))
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, PER_ROUTE_LIMIT);

    for (const item of nearest) {
      const weightedScore = item.similarity * ROUTE_WEIGHTS[route.kind];
      const existing = merged.get(item.template.template_id);
      if (existing) {
        existing.bestSimilarity = Math.max(
          existing.bestSimilarity,
          item.similarity,
        );
        existing.bestWeightedScore = Math.max(
          existing.bestWeightedScore,
          weightedScore,
        );
        existing.matchedRoutes.add(route.kind);
      } else {
        merged.set(item.template.template_id, {
          template: item.template,
          bestSimilarity: item.similarity,
          bestWeightedScore: weightedScore,
          matchedRoutes: new Set([route.kind]),
        });
      }
    }
  });

  return [...merged.values()]
    .sort((left, right) => {
      const leftScore =
        left.bestWeightedScore +
        Math.min(left.matchedRoutes.size - 1, 3) * 0.015;
      const rightScore =
        right.bestWeightedScore +
        Math.min(right.matchedRoutes.size - 1, 3) * 0.015;
      return rightScore - leftScore;
    })
    .slice(0, MAX_CANDIDATES)
    .map(({ template, bestSimilarity, matchedRoutes }) => ({
      template_id: template.template_id,
      similarity: Math.max(0, Math.min(1, bestSimilarity)),
      matched_routes: [...matchedRoutes],
      reason: `Semantic similarity via ${[...matchedRoutes].join(", ")}`,
      og_image: template.og_image,
    }));
}

function cacheGet(key: string): RetrievedTemplateCandidate[] | null {
  const cached = retrievalCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.at > CACHE_TTL_MS) {
    retrievalCache.delete(key);
    return null;
  }
  retrievalCache.delete(key);
  retrievalCache.set(key, cached);
  return cached.candidates;
}

function cacheSet(key: string, candidates: RetrievedTemplateCandidate[]) {
  if (retrievalCache.size >= CACHE_MAX) {
    const first = retrievalCache.keys().next().value;
    if (first !== undefined) retrievalCache.delete(first);
  }
  retrievalCache.set(key, { candidates, at: Date.now() });
}

export async function retrieveTemplateCandidatesForQuery(
  query: string,
): Promise<RetrievedTemplateCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const cacheKey = trimmed.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const openai = getClient();
  if (!openai) return [];

  try {
    const [intent, templates] = await Promise.all([
      analyzeIntent(openai, trimmed),
      getTemplateIndex(openai),
    ]);
    const routes = buildSemanticRetrievalRoutes(trimmed, intent);
    const routeEmbeddings = await embedTexts(
      openai,
      routes.map((route) => route.query),
    );
    const candidates = rankMultiRouteCandidates(
      templates,
      routes,
      routeEmbeddings,
    );
    cacheSet(cacheKey, candidates);
    return candidates;
  } catch {
    return [];
  }
}

export const DIRECT_TEMPLATE_DOCUMENT_COUNT = TEMPLATE_DOCUMENTS.length;
