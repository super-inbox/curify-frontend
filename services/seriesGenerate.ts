import type { SeriesCardRole, SeriesSpec } from "@/lib/series/types";

export const SERIES_GENERATE_ENDPOINT = "/api/series/generate";
export const SERIES_RENDER_CARD_ENDPOINT = "/api/series/render-card";

export type SeriesCardStatus = "queued" | "generating" | "done" | "failed";

export interface SeriesGenerateRequest {
  template_id: string;
  params: Record<string, string>;
  locale: string;
}

export interface SeriesCardResult {
  card_id: string;
  order: number;
  role: SeriesCardRole;
  title: string;
  image_url?: string;
  status: SeriesCardStatus;
  error?: string;
}

export interface SeriesGenerateResponse {
  success: boolean;
  series_id?: string;
  cards?: SeriesCardResult[];
  plan?: SeriesSpec;
  message?: string;
}

export interface RenderCardRequest {
  image_prompt: string;
}

export interface RenderCardResponse {
  success: boolean;
  image_url?: string;
  message?: string;
}

async function postJson<T extends { success: boolean; message?: string }>(
  endpoint: string,
  data: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (e) {
    return { success: false, message: (e as Error).message } as T;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed && typeof parsed.message === "string") {
        return { success: false, message: parsed.message } as T;
      }
    } catch {
      /* fall through */
    }
    return { success: false, message: `HTTP ${res.status}: ${text}` } as T;
  }

  return (await res.json()) as T;
}

export const seriesGenerateService = {
  generate(data: SeriesGenerateRequest): Promise<SeriesGenerateResponse> {
    return postJson<SeriesGenerateResponse>(SERIES_GENERATE_ENDPOINT, data);
  },
  renderCard(data: RenderCardRequest): Promise<RenderCardResponse> {
    return postJson<RenderCardResponse>(SERIES_RENDER_CARD_ENDPOINT, data);
  },
};
