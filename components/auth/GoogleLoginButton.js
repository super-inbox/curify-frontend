// /components/auth/GoogleLoginButton.tsx

'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { userAtom } from '@/atoms/atoms';
import { authService } from '@/services/auth';
import { BtnP } from '@/components/ui/Button'; // Your existing button
import { Icon } from '@/components/ui/Icon'; // Your existing icon

// Google One Tap login setup
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function GoogleLoginButton({ 
  onSuccess, 
  onError,
  className 
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setUser] = useAtom(userAtom);
  const router = useRouter();

  // Method 1: Using Google One Tap (Recommended)
  const initializeGoogleOneTap = () => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });
      
      window.google.accounts.id.prompt();
    }
  };

  // Method 2: Using Google Identity Services directly
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Load Google Identity Services if not already loaded
      if (!window.google) {
        await loadGoogleScript();
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
      });

      // Show the One Tap prompt
      window.google.accounts.id.prompt();
      
    } catch (error) {
      console.error('Google login initialization failed:', error);
      onError?.('Failed to initialize Google login');
      setIsLoading(false);
    }
  };

  // Handle the Google response
  const handleGoogleResponse = async (response: { credential: string }) => {
    try {
      setIsLoading(true);
      
      // Send the credential token to your backend
      const result = await authService.googleLogin(response.credential);
      
      // Update user state in frontend
      setUser(result.data.user);
      
      // Call success callback
      onSuccess?.();
      
      // Redirect to workspace
      router.push('/workspace');
      
    } catch (error) {
      console.error('Google login failed:', error);
      onError?.('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Google script dynamically
  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  };

  return (
    <BtnP
      type="white"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={className}
    >
      <Icon name="google" size={6} />
      <span className="ml-2.5">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </BtnP>
  );
}