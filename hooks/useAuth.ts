import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { userAtom, authLoadingAtom } from '@/app/atoms/atoms';
import { authService } from '@/services/auth';
import { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(authLoadingAtom);
  const router = useRouter();

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin(credential);
      setUser(response.data.user);
      
      // Redirect to workspace after successful login
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
    router.push('/');
  };

  const refreshUserProfile = async () => {
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
    loginWithGoogle,
    logout,
    refreshUserProfile,
    isAuthenticated: !!user,
  };
}