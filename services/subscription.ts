// services/subscribe.ts

import { apiClient } from './api';

interface SubscriptionResponse {
  stripe_subscription_id?: string;
  client_secret?: string;
}

export const subscribeService = {
  async subscribeToPlan(planName: string): Promise<SubscriptionResponse> {
    const res = await apiClient.request<{ data: SubscriptionResponse }>('/user/subscribe', {
      method: 'POST',
      body: JSON.stringify({ plan_name: planName }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.request('/user/cancel', {
      method: 'POST',
    });
  },
};
