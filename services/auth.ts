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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  },

  async sendOtp(email: string): Promise<{ message: string }> {
    return apiClient.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code: otp }),  // Send as "code"
    });
},

  async getProfile(): Promise<User> {
    const res = await apiClient.request<{ data: User }>('/user/profile');
    return res.data;
  },

  async logout() {
    // ✅ Just clear tokens — no redirect.
    // The caller (UserDropdownMenu) owns navigation, user stays on current page.
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("curifyUser");
  },
};
