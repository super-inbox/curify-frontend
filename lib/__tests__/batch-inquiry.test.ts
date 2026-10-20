// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import InlineContactCapture from "../../app/[locale]/_components/InlineContactCapture";

const { sendMail, trackAction } = vi.hoisted(() => ({
  sendMail: vi.fn(),
  trackAction: vi.fn(),
}));
vi.mock("@/services/contact", () => ({ contactService: { sendMail } }));
vi.mock("@/services/useTracking", () => ({ useTracking: () => ({ trackAction }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement("a", props, children),
}));
vi.mock("../../app/[locale]/_components/ContactRoleSelect", () => ({ default: () => null }));

// The unit config uses classic JSX; Next supplies the automatic runtime.
beforeEach(() => { vi.stubGlobal("React", React); });
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

describe("batch inquiry frontend acceptance (mocked transport; sends no email)", () => {
  for (const [source, subject] of [
    ["sample:tool/product-photo-retouching-service", "Product photo retouching batch inquiry"],
    ["use-case:for-photographers", "Outsource wedding photo editing"],
  ]) {
    it(`preserves the brief and attribution for ${source}`, async () => {
      sendMail.mockResolvedValue("ok");
      render(React.createElement(InlineContactCapture, {
        source, subject, cta: "Discuss batch", note: "Batch brief", trackingId: `${source}:attempt`,
      }));
      fireEvent.change(screen.getByPlaceholderText("form.emailPlaceholder"), { target: { value: "acceptance@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("Batch brief"), { target: { value: "50 images; deadline next Friday; match reference" } });
      fireEvent.click(screen.getByRole("button", { name: "Discuss batch" }));
      await waitFor(() => expect(sendMail).toHaveBeenCalledWith({
        email: "acceptance@example.com", subject, source,
        content: "50 images; deadline next Friday; match reference",
      }));
      expect(await screen.findByRole("status")).toHaveProperty("textContent", "form.success");
      expect(trackAction).toHaveBeenCalledWith({ contentId: `contact:submit:${source}`, contentType: "menu_link" }, "click");
    });
  }

  it("retains the brief after a failed request and does not record a successful lead", async () => {
    sendMail.mockRejectedValue(new Error("Unavailable"));
    render(React.createElement(InlineContactCapture, {
      source: "sample:tool/product-photo-retouching-service", subject: "Batch",
      cta: "Discuss batch", note: "Batch brief", trackingId: "batch-attempt",
    }));
    fireEvent.change(screen.getByPlaceholderText("form.emailPlaceholder"), { target: { value: "acceptance@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Batch brief"), { target: { value: "Keep this brief" } });
    fireEvent.click(screen.getByRole("button", { name: "Discuss batch" }));
    expect(await screen.findByRole("status")).toHaveProperty("textContent", "form.error");
    expect((screen.getByPlaceholderText("Batch brief") as HTMLTextAreaElement).value).toBe("Keep this brief");
    expect(trackAction).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("button", { name: "Discuss batch" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
