import { USD_PER_CREDIT } from "@/lib/pricing";

export const TOP_UP_PRESETS = [50, 100, 200, 500] as const;
export const MIN_TOP_UP_CREDITS = Math.ceil(0.5 / USD_PER_CREDIT);

export function minimumTopUp(context: { required: number; available: number; shortfall?: number } | null): number {
  const shortfall = context ? (context.shortfall ?? context.required - context.available) : 0;
  return Math.max(MIN_TOP_UP_CREDITS, Number.isFinite(shortfall) ? Math.ceil(shortfall) : MIN_TOP_UP_CREDITS);
}

export function validTopUp(credits: number, minimum: number): boolean {
  return Number.isSafeInteger(credits) && credits >= minimum;
}

export function suggestedTopUp(minimum: number): number {
  return TOP_UP_PRESETS.find(credits => credits >= minimum) ?? minimum;
}

/** Storage may supply navigation hints, never payment or resume authority. */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded)) return null;
    const url = new URL(value, "https://return.invalid");
    if (url.origin !== "https://return.invalid" || /\/(?:topup|auth)(?:\/|$)/.test(url.pathname)) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}

export function checkoutReturnContext(raw: string | null, sessionId: string): { returnUrl: string; surface: string } | null {
  if (!raw || !sessionId) return null;
  try {
    const context = JSON.parse(raw);
    const returnUrl = safeReturnPath(context.returnUrl);
    return context.sessionId === sessionId && returnUrl
      ? { returnUrl, surface: typeof context.surface === "string" ? context.surface : "header" }
      : null;
  } catch { return null; }
}
