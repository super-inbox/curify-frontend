// components/button/GoogleLoginButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom, headerAtom } from "@/app/atoms/atoms";
import Icon from "../Icon";
import { authService } from "@/services/auth";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  variant?: "home" | "drawer";
  callbackUrl?: string;
}

export default function GoogleLoginButton({ variant = "home", callbackUrl = "/workspace" }: GoogleLoginButtonProps) {
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();

  // Load Google Identity Services script on mount
  useEffect(() => {
    const loadGoogleScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          setGoogleLoaded(true);
          resolve();
          return;
        }

        if (document.getElementById("google-script")) {
          const checkGoogle = setInterval(() => {
            if (window.google?.accounts?.id) {
              clearInterval(checkGoogle);
              setGoogleLoaded(true);
              resolve();
            }
          }, 100);
          setTimeout(() => {
            clearInterval(checkGoogle);
            reject(new Error("Google script timeout"));
          }, 10000);
          return;
        }

        const script = document.createElement("script");
        script.id = "google-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          setTimeout(() => {
            if (window.google?.accounts?.id) {
              setGoogleLoaded(true);
              resolve();
            } else {
              reject(new Error("Google services not available"));
            }
          }, 500);
        };

        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(script);
      });
    };

    loadGoogleScript().catch((err) => {
      console.error("Failed to load Google script:", err);
    });
  }, []);

// Handle Google credential
const handleCredentialResponse = async (response: { credential: string }) => {
  try {
    setIsGoogleLoading(true);
    setAuthLoading(true);

    const result = await authService.googleLogin(response.credential);
  // Save tokens
  localStorage.setItem("access_token", result.data.access_token);
  localStorage.setItem("refresh_token", result.data.refresh_token);

    // Save user in localStorage for hydration later
    localStorage.setItem("curifyUser", JSON.stringify(result.data.user));

    // 👇 Redirect to callbackUrl if present, else fallback to /workspace
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") || "/workspace";

    router.push(callbackUrl);

  } catch (error) {
    console.error("Google login failed:", error);
    alert("Login failed. Please try again.");
  } finally {
    setIsGoogleLoading(false);
    setAuthLoading(false);
  }
};


  const handleGoogleLogin = async () => {
    if (isGoogleLoading || !googleLoaded) {
      console.log("Google not ready or already loading");
      return;
    }

    console.log("Starting Google login process...");
    setIsGoogleLoading(true);

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error("Google Client ID not found");
      }

      console.log("Using Google Client ID:", clientId);

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });

      // Create a temporary button element for Google to render into
      const tempButtonContainer = document.createElement('div');
      tempButtonContainer.style.position = 'absolute';
      tempButtonContainer.style.top = '-9999px';
      tempButtonContainer.style.left = '-9999px';
      document.body.appendChild(tempButtonContainer);

      // Render the Google button
      window.google.accounts.id.renderButton(tempButtonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 250
      });

      // Programmatically click the Google button
      setTimeout(() => {
        const googleButton = tempButtonContainer.querySelector('[role="button"]') as HTMLElement;
        if (googleButton) {
          console.log("Clicking Google button programmatically");
          googleButton.click();
        } else {
          console.error("Google button not found");
          // Fallback: try the prompt method
          window.google.accounts.id.prompt((notification: any) => {
            console.log("Google prompt result:", notification);
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log("Google prompt was not displayed or skipped");
              alert("Please allow popups for this site to use Google login.");
            }
          });
        }
        
        // Clean up the temporary button
        setTimeout(() => {
          if (document.body.contains(tempButtonContainer)) {
            document.body.removeChild(tempButtonContainer);
          }
          setIsGoogleLoading(false);
        }, 1000);
      }, 100);

    } catch (error) {
      console.error("Google login initialization failed:", error);
      alert("Failed to initialize Google login. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const sharedClasses =
    "flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "home"
      ? "h-14 px-7 rounded-xl text-lg font-normal"   // larger for home page
      : "h-10 px-4 rounded-md text-sm font-normal w-full";  // drawer smaller
  
  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isGoogleLoading || !googleLoaded}
      className={`${sharedClasses} ${variantClasses}`}
    >
      <Icon name="google" size={variant === "home" ? 6 : 5} />
      <span className="ml-2.5 font-normal">
        {!googleLoaded 
          ? "Loading..." 
          : isGoogleLoading 
            ? "Signing in..." 
            : "Continue with Google"
        }
      </span>
    </button>
  );
}