import { z } from "zod";

export const SERIES_LOCALES = ["en", "zh"] as const;

export const SERIES_TEMPLATE_IDS = [
  "template-book-series",
  "template-series-infographic",
  "template-series-travel",
] as const;

export const SERIES_CARD_ROLES = ["cover", "section", "day", "content"] as const;

export const BOOK_SERIES_CARD_IDS = [
  "cover",
  "themes",
  "quotes",
  "ideas",
  "relations",
  "structure",
] as const;

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

export function validateCardCount(
  spec: SeriesSpec,
  params: Record<string, string>,
): CardCountValidation {
  switch (spec.template_id) {
    case "template-book-series": {
      if (spec.cards.length !== BOOK_SERIES_CARD_IDS.length) {
        return {
          ok: false,
          reason: `template-book-series expects ${BOOK_SERIES_CARD_IDS.length} cards, got ${spec.cards.length}`,
        };
      }
      const expected = new Set<string>(BOOK_SERIES_CARD_IDS);
      const actual = new Set(spec.cards.map((c) => c.card_id));
      if (
        expected.size !== actual.size ||
        [...expected].some((id) => !actual.has(id))
      ) {
        return {
          ok: false,
          reason: `template-book-series requires card_ids [${[...expected].join(", ")}]; got [${[...actual].join(", ")}]`,
        };
      }
      return { ok: true };
    }
    case "template-series-infographic": {
      const n = spec.cards.length;
      if (n < 4 || n > 8) {
        return {
          ok: false,
          reason: `template-series-infographic expects 4-8 cards, got ${n}`,
        };
      }
      if (spec.cards[0]?.role !== "cover") {
        return {
          ok: false,
          reason: `template-series-infographic: first card role must be "cover", got "${spec.cards[0]?.role}"`,
        };
      }
      return { ok: true };
    }
    case "template-series-travel": {
      const days = Number.parseInt(params.trip_duration ?? "", 10);
      if (!Number.isFinite(days) || days < 1) {
        return {
          ok: false,
          reason: `template-series-travel: invalid trip_duration ${JSON.stringify(params.trip_duration)}`,
        };
      }
      const expected = days + 1;
      if (spec.cards.length !== expected) {
        return {
          ok: false,
          reason: `template-series-travel expects ${expected} cards for ${days}-day trip, got ${spec.cards.length}`,
        };
      }
      if (spec.cards[0]?.card_id !== "overview") {
        return {
          ok: false,
          reason: `template-series-travel: first card_id must be "overview", got "${spec.cards[0]?.card_id}"`,
        };
      }
      for (let i = 1; i <= days; i++) {
        const expectedId = `day-${i}`;
        if (spec.cards[i]?.card_id !== expectedId) {
          return {
            ok: false,
            reason: `template-series-travel: card ${i} must have card_id "${expectedId}", got "${spec.cards[i]?.card_id}"`,
          };
        }
      }
      return { ok: true };
    }
  }
}
