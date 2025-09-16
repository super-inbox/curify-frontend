'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/atoms/atoms';
import { authService } from '@/services/auth';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);

        // Optional: delay a bit for UI effect, then redirect
        setTimeout(() => {
          router.push('/dashboard'); // or your main page
        }, 1000);
      } catch (err) {
        console.error('⚠️ Failed to refresh user profile after subscription', err);
        router.push('/pricing'); // fallback
      }
    };

    refreshUser();
  }, [router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 py-20 bg-gray-50">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">🎉 Subscription Successful!</h1>
        <p className="text-lg text-gray-700 mb-6">
          You’re now on the <strong>Creator Plan</strong>. Unlocking all the powerful features!
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );
}
