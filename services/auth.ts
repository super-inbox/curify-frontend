interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface GoogleLoginResponse {
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
  message: string;
  status_code: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'paid';
  credits: number;
  subscription_status?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    return apiClient.request('/auth_cookie/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: RegisterData) {
    return apiClient.request('/auth_cookie/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleLogin(token: string) {
    return apiClient.request('/auth_cookie/google-login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async refreshToken() {
    return apiClient.request('/auth_cookie/refresh', {
      method: 'POST',
    });
  },

  async getProfile(): Promise<UserProfile> {
    return apiClient.request('/user/profile');
  },

  async logout() {
    // Clear client-side state
    // Cookies will be handled by server
    window.location.href = '/';
  },
};