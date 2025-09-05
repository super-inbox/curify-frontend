import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { userAtom, authLoadingAtom } from '@/app/atoms/atoms';
import { authService } from '@/services/auth';
import { User, LoginCredentials } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(authLoadingAtom);
  const [computedData] = useAtom(userComputedAtom);
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      router.push('/workspace');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin(credential);
      setUser(response.data.user);
      router.push('/workspace');
      return response.data.user;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await authService.logout();
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      setUser(null);
      throw error;
    }
  };

  return {
    user,
    loading,
    computedData, // Access to totalCredits, isPaidPlan, etc.
    login,
    loginWithGoogle,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    // Convenience getters
    totalCredits: computedData.totalCredits,
    isPaidPlan: computedData.isPaidPlan,
    planName: user?.plan_name || 'free',
    minutesUsed: user?.subtitle_minutes_used || 0,
  };
}