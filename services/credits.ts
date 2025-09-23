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

export const creditsService = {
  async recordUsage(data: CreditUsageRequest): Promise<CreditUsageResponse> {
    return apiClient.request<CreditUsageResponse>('/credits/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
