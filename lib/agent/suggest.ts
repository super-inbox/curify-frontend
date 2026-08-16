/**
 * State-aware next-action suggestions.
 *
 * Two entry points, both returning exactly three actions:
 *
 *   cold start   an image is dropped with no text → classify what it IS, then
 *                offer the three domains whose ladder fits it best
 *   in-flight    after steps have run → offer the next un-produced deliverables
 *                from the ladder the request landed in
 *
 * The "what comes next" question is NOT answered by a model. `topic_workflows.ts`
 * already holds expert-authored ladders per domain (merch / product / packaging /
 * brand / education); those are the canonical plans, so suggestions are read off
 * them and only the *classification* is modelled. That keeps suggestions concrete
 * (every one maps to a shipped template) and stops the agent inventing steps.
 */
import OpenAI from "openai";
import { WORKFLOWS_BY_DOMAIN } from "@/lib/topic_workflows";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;

export type Suggestion = {
  /** Button text. */
  label: string;
  /** One line: why this is a sensible next move. */
  why: string;
  /** Prefilled request — clicking runs the agent with this. */
  query: string;
  domain: string;
};

export type SuggestState = {
  /**
   * Reference image to classify — either an uploaded URL (from
   * ReferenceImageUpload's blob_url) or a data: URL. Both are accepted by the
   * vision call; if the URL isn't fetchable by the model we fall back to the
   * non-vision suggestions rather than failing.
   */
  imageRef?: string;
  query?: string;
  /** Tool ids already executed this run. */
  completedToolIds?: string[];
  /** Deliverable keys already produced (ladder step keys). */
  producedKeys?: string[];
  /**
   * The ladder this run is already in, when the caller knows it (a one-click
   * workflow entry does). Inferring the domain from produced artifacts fails
   * when nothing has been produced yet — it silently fell back to "merch", so a
   * brand run was told what was "next in the merch design workflow".
   */
  domain?: string;
};

export type SuggestResult = {
  /** What the agent thinks it is looking at / doing — shown above the chips. */
  context: string;
  suggestions: Suggestion[];
};

let _client: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (_client !== undefined) return _client;
  const key = process.env.OPENAI_API_KEY;
  _client = key ? new OpenAI({ apiKey: key, timeout: TIMEOUT_MS }) : null;
  return _client;
}

const DOMAIN_ORDER = ["merch", "product", "packaging", "brand", "education"];

/** Turn a ladder step into a runnable suggestion. */
function fromLadder(domain: string, subject: string, skipKeys: Set<string>): Suggestion[] {
  const wf = WORKFLOWS_BY_DOMAIN[domain];
  if (!wf) return [];
  return wf.steps
    .filter((s) => !skipKeys.has(s.key))
    .map((s) => ({
      label: s.name,
      why: s.desc,
      query: `${s.name} for ${subject}`,
      domain,
    }));
}

const CLASSIFY = `You look at one image and decide which design workflows fit it.

Domains:
- merch: a character / illustration / IP that could become stickers and merchandise
- product: a physical product that needs e-commerce listing visuals
- packaging: a product or package that needs box/label/dieline work
- brand: a logo, wordmark, or brand-identity material
- education: a subject or scene that could become teaching material

Return JSON:
{"subject":"<3-6 words naming what is in the image>",
 "domains":["<best>","<second>","<third>"]}
Order domains by fit. Use only the five ids above.`;

async function classifyImage(
  imageRef: string,
): Promise<{ subject: string; domains: string[] } | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CLASSIFY },
        {
          role: "user",
          content: [
            { type: "text", text: "Classify this image." },
            { type: "image_url", image_url: { url: imageRef, detail: "low" } },
          ],
        },
      ],
    });
    const parsed = JSON.parse(res.choices?.[0]?.message?.content ?? "{}");
    const domains = Array.isArray(parsed.domains)
      ? parsed.domains.filter((d: string) => WORKFLOWS_BY_DOMAIN[d])
      : [];
    if (!domains.length) return null;
    return { subject: String(parsed.subject || "your image").slice(0, 60), domains };
  } catch {
    return null;
  }
}

export async function buildSuggestions(state: SuggestState): Promise<SuggestResult> {
  const produced = new Set(state.producedKeys ?? []);
  const completed = state.completedToolIds ?? [];

  // Blocked on the direction gate: nothing is produced and the only thing that
  // "ran" is the gate itself. Offering ladder steps here contradicts the screen
  // — it tells the user to pick a direction, then invites them to skip it.
  if (produced.size === 0 && completed.length > 0 && completed.every((t) => t === "choose_direction")) {
    return { context: "Pick a creative direction to continue — every step will share it.", suggestions: [] };
  }

  // --- in-flight: continue the ladder we're already in ----------------------
  if (produced.size > 0 || completed.length > 0) {
    const subject = state.query?.slice(0, 60) || "this design";
    // Prefer the ladder the caller already knows; only infer when it doesn't.
    const domain =
      (state.domain && WORKFLOWS_BY_DOMAIN[state.domain] ? state.domain : undefined) ??
      DOMAIN_ORDER.find((d) =>
        WORKFLOWS_BY_DOMAIN[d].steps.some((s) => produced.has(s.key)),
      ) ??
      "merch";
    const next = fromLadder(domain, subject, produced).slice(0, 3);
    return {
      context: `Done so far: ${[...produced].join(", ") || "first artifact"}. Next in the ${
        WORKFLOWS_BY_DOMAIN[domain].heading.toLowerCase()
      }:`,
      suggestions: next.length
        ? next
        : fromLadder("merch", subject, new Set()).slice(0, 3),
    };
  }

  // --- cold start with an image --------------------------------------------
  if (state.imageRef) {
    const classified = await classifyImage(state.imageRef);
    if (classified) {
      const { subject, domains } = classified;
      const picks = domains.slice(0, 3);
      const suggestions = picks
        .map((d) => {
          const wf = WORKFLOWS_BY_DOMAIN[d];
          const first = wf.steps[0];
          return {
            label: `${wf.heading.replace(/ workflow$/i, "")}: ${first.name}`,
            why: first.desc,
            query: `${first.name} for ${subject}`,
            domain: d,
          };
        })
        .slice(0, 3);
      return { context: `Looks like ${subject}. Three ways to take it forward:`, suggestions };
    }
    // No vision available — still useful: offer the three broadest ladders.
    return {
      context: "Three ways to take this image forward:",
      suggestions: ["merch", "product", "brand"].map((d) => {
        const wf = WORKFLOWS_BY_DOMAIN[d];
        return {
          label: `${wf.heading.replace(/ workflow$/i, "")}: ${wf.steps[0].name}`,
          why: wf.steps[0].desc,
          query: `${wf.steps[0].name} for my uploaded image`,
          domain: d,
        };
      }),
    };
  }

  // --- nothing yet ----------------------------------------------------------
  return {
    context: "Start anywhere:",
    suggestions: ["merch", "product", "education"].map((d) => {
      const wf = WORKFLOWS_BY_DOMAIN[d];
      return {
        label: `${wf.heading.replace(/ workflow$/i, "")}: ${wf.steps[0].name}`,
        why: wf.steps[0].desc,
        query: wf.steps[0].name,
        domain: d,
      };
    }),
  };
}
