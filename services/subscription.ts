// services/subscription.ts

import { apiClient } from './api';
import type {
  SubscriptionEnrollRequest,
  SubscriptionDowngradeRequest,
  SubscriptionResponse,
  SubscriptionCancelResponse,
  SubscriptionDowngradeResponse,
  APIResponse,
} from '@/types/subscription';

export const subscribeService = {
  /**
   * Subscribe to a plan
   * @param planName - The name of the plan to subscribe to
   * @param testMode - Optional test mode flag
   */
  async subscribeToPlan(
    planName: string,
    testMode: boolean = false
  ): Promise<SubscriptionResponse> {
    const payload: SubscriptionEnrollRequest = {
      plan_name: planName,
      test_mode: testMode,
    };

    const res = await apiClient.request<APIResponse<SubscriptionResponse>>(
      '/user/subscribe',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data;
  },

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<SubscriptionCancelResponse> {
    const res = await apiClient.request<APIResponse<SubscriptionCancelResponse>>(
      '/user/subscription/cancel',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data;
  },

  /**
   * Downgrade subscription from current plan to wanted plan
   * @param currentPlanName - Current plan name
   * @param wantedPlanName - Desired plan name to downgrade to
   */
  async downgradeSubscription(
    currentPlanName: string,
    wantedPlanName: string
  ): Promise<SubscriptionDowngradeResponse> {
    const payload: SubscriptionDowngradeRequest = {
      current_plan_name: currentPlanName,
      wanted_plan_name: wantedPlanName,
    };

    const res = await apiClient.request<APIResponse<SubscriptionDowngradeResponse>>(
      '/user/subscription/downgrade',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data;
  },
};