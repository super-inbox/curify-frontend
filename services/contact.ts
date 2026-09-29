import { apiClient } from "./api";
import { getFirstTouch, getSessionId } from "./useTracking";

/**
 * Self-reported role on the contact forms. Must match CONTACT_ROLES in the
 * backend (app/schemas/user.py) — anything else is stored as NULL.
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

function withAttribution(data: SendMailRequest) {
  let sessionId: string | undefined;
  try {
    sessionId = getSessionId() || undefined;
  } catch {}
  const touch = getFirstTouch();
  return {
    ...data,
    ...(sessionId ? { session_id: sessionId } : {}),
    ...(touch.landing_page ? { landing_page: touch.landing_page } : {}),
    ...(touch.utm ? { utm: touch.utm } : {}),
    ...(touch.referrer ? { referrer: touch.referrer } : {}),
  };
}

export const contactService = {
  async sendMail(data: SendMailRequest): Promise<string> {
    const res = await apiClient.request<{ data: string }>("/user/contact-team", {
      method: "POST",
      // Attribution rides along on every submission: the session this lead
      // belongs to (joins to user_interactions.session_id) and where the
      // session entered the site. Each is best-effort and optional server-side.
      body: JSON.stringify(withAttribution(data)),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },
};
