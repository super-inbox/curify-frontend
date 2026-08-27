import { apiClient } from "./api";

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
}

export const contactService = {
  async sendMail(data: SendMailRequest): Promise<string> {
    const res = await apiClient.request<{ data: string }>("/user/contact-team", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },
};
