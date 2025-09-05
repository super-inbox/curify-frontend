
"use client";

import BtnP from "../_components/button/ButtonPrimary";
import Icon from "../_components/Icon";
import { useAtom } from "jotai";
import { drawerAtom, userAtom, authLoadingAtom } from "@/app/atoms/atoms";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

export default function Buttons() {
  const [open, setOpen] = useAtom(drawerAtom);
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();

  // Initialize Google when component mounts
  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        await loadGoogleScript();
        setGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to load Google script:', error);
      }
    };

    initializeGoogle();
  }, []);

  // Load Google script
  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // Check if script tag exists
      if (document.getElementById('google-script')) {
        // Wait for it to load
        const checkGoogle = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogle);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkGoogle);
          reject(new Error('Google script timeout'));
        }, 10000);
        return;
      }

      // Create script tag
      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait a bit for Google to initialize
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google services not available'));
          }
        }, 500);
      };
      
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  };

  // Handle the Google credential response
  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      setIsGoogleLoading(true);
      setAuthLoading(true);
      
      console.log('Google credential received, sending to backend...');
      
      // Send credential to your backend
      const result = await authService.googleLogin(response.credential);
      
      console.log('Backend login successful:', result);
      
      // Update user state
      setUser(result.data.user);
      
      // Redirect to workspace
      router.push('/workspace');
      
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
      setAuthLoading(false);
    }
  };

  // Handle Google login button click
  const handleGoogleLogin = async () => {
    if (isGoogleLoading || !googleLoaded) return;
    
    setIsGoogleLoading(true);
    
    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Prompt for login
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt doesn't work
          console.log('Prompt failed, trying popup...');
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: 250,
            }
          );
        }
        setIsGoogleLoading(false);
      });
      
    } catch (error) {
      console.error('Google login initialization failed:', error);
      alert('Failed to initialize Google login. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Book a Demo CTA */}
      <Link href="/contact">
        <BtnP onClick={() => {}}>
          Book a Demo
        </BtnP>
      </Link>

      <div className="w-9" />

      {/* Google Login Button */}
      {googleLoaded ? (
        <BtnP
          type="white"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          <Icon name="google" size={6} />
          <span className="ml-2.5">
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </BtnP>
      ) : (
        <BtnP type="white" disabled>
          <Icon name="google" size={6} />
          <span className="ml-2.5">Loading...</span>
        </BtnP>
      )}

      {/* Hidden div for fallback Google button */}
      <div id="google-signin-button" style={{ display: 'none' }}></div>
    </div>
  );
}