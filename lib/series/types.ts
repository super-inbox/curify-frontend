import { z } from "zod";

export const SERIES_LOCALES = ["en", "zh"] as const;

export const SERIES_TEMPLATE_IDS = [
  "template-book-series",
  "template-series-infographic",
  "template-series-travel",
  "template-hotspot-card",
] as const;

export const SERIES_CARD_ROLES = ["cover", "section", "day", "content"] as const;

// Suggested content sections the planner can draw from; the book series no
// longer has a fixed card set — card_count (1-10) is user-controlled.
export const BOOK_SERIES_SECTION_POOL = [
  "themes",
  "quotes",
  "ideas",
  "relations",
  "structure",
] as const;

// Shared card-count bounds for the user-controlled "number of cards" input
// (book-series, series-infographic, hotspot-card). Travel sizes itself from
// trip_duration instead and uses TRAVEL_MAX_* below.
export const SERIES_CARD_COUNT_MIN = 1;
export const SERIES_CARD_COUNT_MAX = 10;

export function clampCardCount(cardCount: number): number {
  return Math.min(
    Math.max(Math.trunc(cardCount), SERIES_CARD_COUNT_MIN),
    SERIES_CARD_COUNT_MAX,
  );
}

export type SeriesLocale = (typeof SERIES_LOCALES)[number];
export type SeriesTemplateId = (typeof SERIES_TEMPLATE_IDS)[number];
export type SeriesCardRole = (typeof SERIES_CARD_ROLES)[number];

export const sharedStyleSchema = z
  .object({
    art_style: z.string().min(1),
    aspect: z.string().min(1),
    watermark: z.string(),
    typography_hint: z.string(),
  })
  .strict();

export const seriesCardSchema = z
  .object({
    card_id: z.string().min(1),
    order: z.number().int().min(0),
    role: z.enum(SERIES_CARD_ROLES),
    title: z.string().min(1),
    image_prompt: z.string().min(1),
  })
  .strict();

export const seriesSpecSchema = z
  .object({
    series_id: z.string().min(1),
    template_id: z.enum(SERIES_TEMPLATE_IDS),
    locale: z.enum(SERIES_LOCALES),
    shared_style: sharedStyleSchema,
    cards: z.array(seriesCardSchema).min(1),
  })
  .strict();

export type SharedStyle = z.infer<typeof sharedStyleSchema>;
export type SeriesCard = z.infer<typeof seriesCardSchema>;
export type SeriesSpec = z.infer<typeof seriesSpecSchema>;

// Hand-written rather than derived: OpenAI's strict structured-output mode
// only supports a subset of JSON Schema (no minimum/maxLength/format/etc.),
// so a zod-to-json-schema export would need post-processing anyway.
export const seriesSpecJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    series_id: { type: "string" },
    template_id: { type: "string", enum: [...SERIES_TEMPLATE_IDS] },
    locale: { type: "string", enum: [...SERIES_LOCALES] },
    shared_style: {
      type: "object",
      additionalProperties: false,
      properties: {
        art_style: { type: "string" },
        aspect: { type: "string" },
        watermark: { type: "string" },
        typography_hint: { type: "string" },
      },
      required: ["art_style", "aspect", "watermark", "typography_hint"],
    },
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          card_id: { type: "string" },
          order: { type: "integer" },
          role: { type: "string", enum: [...SERIES_CARD_ROLES] },
          title: { type: "string" },
          image_prompt: { type: "string" },
        },
        required: ["card_id", "order", "role", "title", "image_prompt"],
      },
    },
  },
  required: ["series_id", "template_id", "locale", "shared_style", "cards"],
} as const;

export type CardCountValidation =
  | { ok: true }
  | { ok: false; reason: string };

// Travel-series sizing: a series never exceeds TRAVEL_MAX_TOTAL_CARDS cards
// (1 overview + up to TRAVEL_MAX_DAY_CARDS day cards). Trips longer than
// TRAVEL_MAX_DAYS are clamped, and when there are more days than day-card
// slots each day card covers a contiguous *range* of days (days / cards),
// so a 50-day trip becomes 9 day cards of ~5-6 days each instead of 50 cards.
export const TRAVEL_MAX_TOTAL_CARDS = 10;
export const TRAVEL_MAX_DAYS = 50;
export const TRAVEL_MAX_DAY_CARDS = TRAVEL_MAX_TOTAL_CARDS - 1;

export type TravelDayCard = {
  card_id: string;
  startDay: number;
  endDay: number;
};

export type TravelPlan = {
  rawDays: number;
  effectiveDays: number;
  numDayCards: number;
  dayCards: TravelDayCard[];
};

// Distributes effectiveDays as evenly as possible across the available day
// cards; the first `remainder` cards get one extra day so every day is covered.
export function planTravelDayCards(tripDuration: number): TravelPlan {
  const rawDays = tripDuration;
  const effectiveDays = Math.min(Math.max(rawDays, 1), TRAVEL_MAX_DAYS);
  const numDayCards = Math.min(effectiveDays, TRAVEL_MAX_DAY_CARDS);
  const base = Math.floor(effectiveDays / numDayCards);
  const remainder = effectiveDays % numDayCards;

  const dayCards: TravelDayCard[] = [];
  let cursor = 1;
  for (let i = 0; i < numDayCards; i++) {
    const span = base + (i < remainder ? 1 : 0);
    const startDay = cursor;
    const endDay = cursor + span - 1;
    dayCards.push({ card_id: `day-${i + 1}`, startDay, endDay });
    cursor = endDay + 1;
  }

  return { rawDays, effectiveDays, numDayCards, dayCards };
}

// Shared validation for templates with a user-controlled card_count input:
// count must equal the clamped card_count, the first card is the cover, and
// every card_id is unique.
function validateUserCardCount(
  spec: SeriesSpec,
  params: Record<string, string>,
): CardCountValidation {
  const label = spec.template_id;
  const requested = Number.parseInt(params.card_count ?? "", 10);
  if (!Number.isFinite(requested) || requested < 1) {
    return {
      ok: false,
      reason: `${label}: invalid card_count ${JSON.stringify(params.card_count)}`,
    };
  }
  const expected = clampCardCount(requested);
  if (spec.cards.length !== expected) {
    return {
      ok: false,
      reason: `${label} expects ${expected} cards (card_count ${requested} clamped to ${SERIES_CARD_COUNT_MIN}-${SERIES_CARD_COUNT_MAX}), got ${spec.cards.length}`,
    };
  }
  if (spec.cards[0]?.role !== "cover") {
    return {
      ok: false,
      reason: `${label}: first card role must be "cover", got "${spec.cards[0]?.role}"`,
    };
  }
  const ids = spec.cards.map((c) => c.card_id);
  if (new Set(ids).size !== ids.length) {
    return {
      ok: false,
      reason: `${label}: card_ids must be unique, got [${ids.join(", ")}]`,
    };
  }
  return { ok: true };
}

export function validateCardCount(
  spec: SeriesSpec,
  params: Record<string, string>,
): CardCountValidation {
  switch (spec.template_id) {
    case "template-book-series":
    case "template-series-infographic":
    case "template-hotspot-card":
      return validateUserCardCount(spec, params);
    case "template-series-travel": {
      const days = Number.parseInt(params.trip_duration ?? "", 10);
      if (!Number.isFinite(days) || days < 1) {
        return {
          ok: false,
          reason: `template-series-travel: invalid trip_duration ${JSON.stringify(params.trip_duration)}`,
        };
      }
      const plan = planTravelDayCards(days);
      const expected = plan.numDayCards + 1;
      if (spec.cards.length !== expected) {
        return {
          ok: false,
          reason: `template-series-travel expects ${expected} cards for a ${days}-day trip (overview + ${plan.numDayCards} day cards), got ${spec.cards.length}`,
        };
      }
      if (spec.cards[0]?.card_id !== "overview") {
        return {
          ok: false,
          reason: `template-series-travel: first card_id must be "overview", got "${spec.cards[0]?.card_id}"`,
        };
      }
      for (let i = 0; i < plan.numDayCards; i++) {
        const expectedId = plan.dayCards[i].card_id;
        if (spec.cards[i + 1]?.card_id !== expectedId) {
          return {
            ok: false,
            reason: `template-series-travel: card ${i + 1} must have card_id "${expectedId}", got "${spec.cards[i + 1]?.card_id}"`,
          };
        }
      }
      return { ok: true };
    }
  }
}
