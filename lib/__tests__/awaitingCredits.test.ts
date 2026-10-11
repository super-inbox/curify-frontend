import { TOP_UP_PRESETS, minimumTopUp, validTopUp, suggestedTopUp, safeReturnPath, checkoutReturnContext } from "@/lib/topUpPolicy";
import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { isAwaitingCredits, creditShortfall } from "@/lib/awaitingCredits";
import { apiClient } from "@/services/api";
import { projectService } from "@/services/projects";
import { creditsService } from "@/services/credits";
import { resumeFulfilledCheckout, waitForCheckout } from "@/services/checkoutRecovery";
import { pollNanoResult } from "@/services/pollNanoResult";
import { buildFailureView } from "@/lib/failureActions";

afterEach(() => vi.restoreAllMocks());
describe("persisted credit waiting", () => {
  it("recognizes new and legacy states without treating other failures as waiting", () => {
    expect(isAwaitingCredits({ status: "AWAITING_CREDITS" })).toBe(true);
    expect(isAwaitingCredits({ status: "FAILED", failure_code: "INSUFFICIENT_CREDITS" })).toBe(true);
    expect(isAwaitingCredits({ status: "FAILED", failure_code: "PIPELINE_FAILED" })).toBe(false);
    expect(isAwaitingCredits({ status: "COMPLETED", failure_code: "INSUFFICIENT_CREDITS" })).toBe(false);
    expect(buildFailureView({ failure_code: "INSUFFICIENT_CREDITS", retryable: true }, () => true).showRetry).toBe(false);
  });
  it("uses the server shortfall including reservations, without inventing missing amounts", () => {
    expect(creditShortfall({ required_credits: 10, available_credits: 8, shortfall_credits: 7 })).toBe(7);
    expect(creditShortfall({ required_credits: 10, available_credits: 8 })).toBe(2);
    expect(creditShortfall({ required_credits: 10, available_credits: 20 })).toBe(0);
    expect(creditShortfall({})).toBeNull();
  });
  it.each(["AWAITING_CREDITS", "FAILED"])("stops inline polling for %s and preserves project identity", async status => {
    const getStatus = vi.fn().mockResolvedValue({ project_id: "saved", status, failure_code: "INSUFFICIENT_CREDITS" });
    await expect(pollNanoResult("saved", { getStatus, initialDelayMs: 0 })).rejects.toMatchObject({ projectId: "saved" });
    expect(getStatus).toHaveBeenCalledTimes(1);
  });
  it("has complete translated waiting UI in all locales", () => {
    const english = JSON.parse(readFileSync("messages/en/common.json", "utf8")).awaitingCredits;
    for (const locale of readdirSync("messages")) {
      const messages = JSON.parse(readFileSync(`messages/${locale}/common.json`, "utf8")).awaitingCredits;
      expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort());
      for (const key of Object.keys(english)) {
        expect(messages[key]).toBeTruthy();
        expect(messages[key].match(/\{\w+\}/g)).toEqual(english[key].match(/\{\w+\}/g));
      }
    }
  });
});
describe("checkout recovery contract", () => {
  it("unwraps APIResponse and uses the verified router prefixes", async () => {
    const data = { project_id: "p/1", status: "AWAITING_CREDITS", required_credits: 12, available_credits: 2, shortfall_credits: 10 };
    const request = vi.spyOn(apiClient, "request").mockResolvedValue({ data });
    expect(await projectService.resumeProject("p/1")).toEqual(data);
    expect(request).toHaveBeenLastCalledWith("/projects/p%2F1/resume", { method: "POST" });
    const checkout = { fulfilled: true, project_id: "p/1", resume_after_payment: true };
    request.mockResolvedValue({ data: checkout });
    expect(await creditsService.getCheckoutStatus("cs&x")).toEqual(checkout);
    expect(request).toHaveBeenLastCalledWith("/credits/checkout-status?session_id=cs%26x", { cache: "no-store" });
  });
  it("handles fulfillment before arrival and waits for the exact checkout", async () => {
    const get = vi.spyOn(creditsService, "getCheckoutStatus").mockResolvedValueOnce({ fulfilled: false, resume_after_payment: false }).mockResolvedValue({ fulfilled: true, resume_after_payment: false });
    expect(await waitForCheckout("cs-specific", () => false, { intervalMs: 0 })).toMatchObject({ fulfilled: true });
    expect(get.mock.calls).toEqual([["cs-specific"], ["cs-specific"]]);
    get.mockClear();
    await waitForCheckout("cs-already-paid", () => false);
    expect(get).toHaveBeenCalledTimes(1);
  });
  it("does not verify a missing session or continue after cancellation", async () => {
    const get = vi.spyOn(creditsService, "getCheckoutStatus");
    expect(await waitForCheckout("", () => false)).toBeNull();
    expect(await waitForCheckout("cs", () => true)).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
  it("never resumes unfulfilled, generic, or incomplete intent", async () => {
    const resume = vi.spyOn(projectService, "resumeProject");
    for (const checkout of [
      { fulfilled: false, project_id: "saved", resume_after_payment: true },
      { fulfilled: true, project_id: "saved", resume_after_payment: false },
      { fulfilled: true, resume_after_payment: true },
    ]) expect(await resumeFulfilledCheckout("cs-no-resume", checkout)).toBeNull();
    expect(resume).not.toHaveBeenCalled();
  });
  it("resumes explicit fulfilled intent once across concurrent effect restarts", async () => {
    const resume = vi.spyOn(projectService, "resumeProject").mockResolvedValue({ project_id: "server-project", status: "QUEUED" });
    const checkout = { fulfilled: true, project_id: "server-project", resume_after_payment: true };
    expect(await Promise.all([resumeFulfilledCheckout("cs-once", checkout), resumeFulfilledCheckout("cs-once", checkout)])).toEqual(["server-project", "server-project"]);
    expect(resume).toHaveBeenCalledExactlyOnceWith("server-project");
  });
  it("does not automatically repeat a resume whose response was lost", async () => {
    const resume = vi.spyOn(projectService, "resumeProject").mockRejectedValue(new Error("network"));
    const checkout = { fulfilled: true, project_id: "saved", resume_after_payment: true };
    await expect(resumeFulfilledCheckout("cs-lost", checkout)).rejects.toThrow("network");
    await expect(resumeFulfilledCheckout("cs-lost", checkout)).rejects.toThrow("network");
    expect(resume).toHaveBeenCalledTimes(1);
  });
});

describe("shortfall packs and safe checkout returns", () => {
  it("disables undersized packs and suggests a custom amount beyond the largest pack", () => {
    const min = minimumTopUp({ required: 900, available: 100, shortfall: 750.5 });
    expect(min).toBe(751);
    expect(suggestedTopUp(min)).toBe(751);
    for (const pack of TOP_UP_PRESETS) expect(validTopUp(pack, min)).toBe(false);
    expect(validTopUp(751, min)).toBe(true);
    expect(suggestedTopUp(minimumTopUp({ required: 75, available: 10 }))).toBe(100);
    expect(minimumTopUp(null)).toBe(5);
    for (const invalid of [NaN, Infinity, -1, 0, 4, 5.1]) expect(validTopUp(invalid, 5)).toBe(false);
  });
  it("accepts only local paths and rejects external, encoded, malformed, and payment-loop returns", () => {
    expect(safeReturnPath("/zh/nano-template/cat?x=1#preview")).toBe("/zh/nano-template/cat?x=1#preview");
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "/%2fevil.example", "/%5cevil.example", "/%0aevil", "/%", "javascript:alert(1)", "/en/topup/success", "/auth/login", null]) expect(safeReturnPath(bad)).toBeNull();
  });
  it("binds return hints to the specific checkout and discards browser resume intent", () => {
    const raw = JSON.stringify({ sessionId: "cs-current", returnUrl: "/zh/workspace", projectId: "forged", resumeAfterPayment: true, surface: "awaiting-credits" });
    expect(checkoutReturnContext(raw, "cs-other")).toBeNull();
    expect(checkoutReturnContext(raw, "cs-current")).toEqual({ returnUrl: "/zh/workspace", surface: "awaiting-credits" });
    expect(checkoutReturnContext("bad json", "cs-current")).toBeNull();
    expect(checkoutReturnContext(JSON.stringify({ returnUrl: "/workspace" }), "cs-current")).toBeNull();
  });
  it("wires amount guards into both buttons and submission, with localized minimum copy", () => {
    const source = readFileSync("app/[locale]/_componentForPage/TopUpModal.tsx", "utf8");
    expect(source).toContain("if (!validTopUp(credits, minimum))");
    expect(source).toContain("disabled={busy || !validTopUp(credits, minimum)}");
    expect(source).toContain("disabled={busy || !validTopUp(Number(customCredits), minimum)}");
    expect(source).toContain("resume_after_payment: false");
    for (const locale of readdirSync("messages")) expect(JSON.parse(readFileSync(`messages/${locale}/common.json`, "utf8")).topUpModal.shortfallMinimum).toContain("{credits}");
  });
});
