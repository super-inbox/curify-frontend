export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'paid';
  credits: number;
  subscription_status?: 'active' | 'canceled' | 'past_due';
  created_at: string;
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
  user?: User;
}