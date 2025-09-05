'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { footerAtom, headerAtom, userAtom, authLoadingAtom } from "@/app/atoms/atoms";

import { authService } from '@/services/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useAtom(userAtom);
  const [authLoading, setAuthLoading] = useAtom(authLoadingAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setAuthLoading(true);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Don't render children until auth is initialized
  if (!mounted || authLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}