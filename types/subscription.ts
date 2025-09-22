// types/subscription.ts

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  TRIALING = 'TRIALING',
  UNPAID = 'UNPAID',
}

export type PlanName = 'free' | 'creator' | 'pro' | 'enterprise';

// Request types
export interface SubscriptionEnrollRequest {
  plan_name: string;
  test_mode?: boolean;
}

export interface SubscriptionDowngradeRequest {
  current_plan_name: string;
  wanted_plan_name: string;
}

// Response types
export interface SubscriptionResponse {
  stripe_subscription_id?: string;
  client_secret?: string;
}

export interface SubscriptionCancelResponse {
  message: string;
  subscription_id?: number;
}

export interface SubscriptionDowngradeResponse {
  message: string;
  subscription_id?: number;
}

// API Response wrapper (following common pattern)
export interface APIResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}