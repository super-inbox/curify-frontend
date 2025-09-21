import { apiClient } from './api';
import { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },  // 👈 force this
      body: JSON.stringify({ token: credential }),
    });
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.request<{ data: User }>('/user/profile');
    return res.data;
  },

  async logout() {
    // Clear client-side state - cookies handled by server
    window.location.href = '/';
  },
};