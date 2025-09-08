
export interface User {
  user_id: string;
  email: string;
  plan_name: string;
  non_expiring_credits: number;
  expiring_credits: number;
  subtitle_minutes_used: number;
  current_cycle_start: string;
  current_cycle_end: string;
  created_at: string;
  updated_at: string;
  projects: Project[];
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
