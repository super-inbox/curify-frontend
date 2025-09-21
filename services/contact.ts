import { apiClient } from "./api";

export interface SendMailRequest {
  email: string;
  subject: string;
  content: string;
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
