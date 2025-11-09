'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom, authLoadingAtom } from "@/app/atoms/atoms";
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
    // 🧩 Detect if the user just signed out
    const justSignedOut = sessionStorage.getItem('justSignedOut');

    if (justSignedOut) {
      console.log("Skipping auth rehydration — just signed out.");
      setUser(null);
      setAuthLoading(false);
      sessionStorage.removeItem('justSignedOut'); // Clean up flag
      return;
    }

    // ✅ Normal initialization
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

  if (!mounted || authLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
