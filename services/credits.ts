// services/credits.ts
import { apiClient } from './api';

export interface CreditUsageRequest {
  description: string;
  credits_used: number;
}

export interface CreditUsageResponse {
  success: boolean;
  message: string;
  remaining_credits?: number;
}

export interface CheckoutStatus {
  fulfilled: boolean;
  project_id?: string;
  resume_after_payment: boolean;
}

export const creditsService = {
  async getCheckoutStatus(sessionId: string): Promise<CheckoutStatus> {
    const response = await apiClient.request<{ data: CheckoutStatus }>(
      `/credits/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" },
    );
    return response.data;
  },
  async recordUsage(data: CreditUsageRequest): Promise<CreditUsageResponse> {
    return apiClient.request<CreditUsageResponse>('/credits/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
