import type { CreditRequirement } from "@/types/projects";

export function isAwaitingCredits(project: { status?: string; failure_code?: string | null }): boolean {
  return project.status?.toUpperCase() === "AWAITING_CREDITS" ||
    (project.status?.toUpperCase() === "FAILED" && project.failure_code === "INSUFFICIENT_CREDITS");
}

export function creditShortfall(project: CreditRequirement): number | null {
  if (typeof project.shortfall_credits === "number") return Math.max(0, project.shortfall_credits);
  if (typeof project.required_credits === "number" && typeof project.available_credits === "number") {
    return Math.max(0, project.required_credits - project.available_credits);
  }
  return null;
}

export class AwaitingCreditsError extends Error {
  constructor(public projectId: string) { super("AWAITING_CREDITS"); }
}

/** Inline generators hand the persisted project to the localized recovery UI. */
export function navigateToAwaitingCredits(error: unknown): boolean {
  if (!(error instanceof AwaitingCreditsError)) return false;
  if (typeof window !== "undefined") {
    const locale = window.location.pathname.split("/")[1];
    const prefix = /^(en|zh|es|fr|de|ja|ko|hi|tr|ru)$/.test(locale) ? `/${locale}` : "";
    window.location.assign(`${prefix}/magic/${encodeURIComponent(error.projectId)}`);
  }
  return true;
}
