import { apiClient } from "./api";
import { getFirstTouch, getSessionId } from "./useTracking";

/**
 * Self-reported role on the contact forms. The backend has no role column,
 * so the role travels in the message footer (see withLeadContext).
 */
export const CONTACT_ROLES = [
  "brand_dtc",
  "agency_marketer",
  "publisher",
  "photographer",
  "merch_pod",
  "other",
] as const;
export type ContactRole = (typeof CONTACT_ROLES)[number];

export interface SendMailRequest {
  email: string;
  subject: string;
  content: string;
  /**
   * Referring page/template that produced this lead, e.g.
   * "bulk-cta:nano-template/brand-ip-mascot-design-board". Set by the
   * ?source= param the bulk CTAs carry into /contact. Optional — the
   * backend field is optional too, so a plain /contact visit still works.
   */
  source?: string;
  /** Optional self-reported role; omitted when the visitor leaves it blank. */
  role?: ContactRole;
}

/**
 * Frontend-only lead context: role and first-touch attribution are appended
 * to the message as a plain-text footer, so they land in email_contacts.body
 * and the team notification without a backend schema change. The backend
 * appends its own "Submitted from:" line after this.
 */
function withLeadContext(data: SendMailRequest) {
  const { role, ...rest } = data;
  let sessionId: string | undefined;
  try {
    sessionId = getSessionId() || undefined;
  } catch {}
  const touch = getFirstTouch();
  const lines = [
    role ? `Role: ${role}` : null,
    touch.landing_page ? `Landing page: ${touch.landing_page}` : null,
    touch.utm ? `UTM: ${new URLSearchParams(touch.utm).toString()}` : null,
    touch.referrer ? `Referrer: ${touch.referrer}` : null,
    sessionId ? `Session: ${sessionId}` : null,
  ].filter(Boolean);
  if (!lines.length) return rest;
  return { ...rest, content: `${rest.content}\n\n---\n${lines.join("\n")}` };
}

export const contactService = {
  async sendMail(data: SendMailRequest): Promise<string> {
    const res = await apiClient.request<{ data: string }>("/user/contact-team", {
      method: "POST",
      body: JSON.stringify(withLeadContext(data)),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },
};
