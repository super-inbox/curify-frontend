import { Project } from './projects';

export interface User {
  user_id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  plan_name?: string;
  non_expiring_credits: number;
  expiring_credits: number;
  subtitle_minutes_used: number;
  current_cycle_start: string;
  current_cycle_end: string;
  created_at: string;
  updated_at: string;
  projects: Project[];  
  emailVerified?: Date | null;
}

// Helper type for computed values
export interface UserComputedData {
  totalCredits: number;
  isPaidPlan: boolean;
  cycleProgress: number; // 0-100 percentage
  daysUntilCycleEnd: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export type UserSession = {
  user_id: string;                 // 你后端的 user_id
  email: string;                   // session 必须保证有 email
  username?: string;               // 可以后端补齐
  avatar_url?: string;
  plan_name?: string;
  non_expiring_credits?: number;
  expiring_credits?: number;
};
