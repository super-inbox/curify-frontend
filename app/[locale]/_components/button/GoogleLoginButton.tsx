"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom, headerAtom } from "@/app/atoms/atoms";
import Icon from "../Icon";
import { authService } from "@/services/auth";
import { useSetAtom } from 'jotai';
import { drawerAtom } from '@/app/atoms/atoms';
import { jwtDecode } from "jwt-decode";

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
  const setDrawerState = useSetAtom(drawerAtom);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();

  // Load Google Identity Services script
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

  // ✅ Handle Google credential (decode and attach avatar_url)
  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      console.log("Processing Google credential...");

      // Decode ID token (JWT) to extract profile
      const decoded: {
        name: string;
        email: string;
        picture: string;
        sub: string;
      } = jwtDecode(response.credential);

      const result = await authService.googleLogin(response.credential);

      const userWithAvatar = {
        ...result.data.user,
        avatar_url: decoded.picture,
      };

      // Save tokens and user
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      localStorage.setItem("curifyUser", JSON.stringify(userWithAvatar));

      setUser(userWithAvatar);
      setDrawerState(null);

      console.log("Google login successful, user authenticated");
    } catch (error) {
      console.error("Google login failed:", error);
      router.push("/?error=login_failed");
    } finally {
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
    setAuthLoading(true);

    const params = new URLSearchParams(window.location.search);
    const finalCallbackUrl = params.get("callbackUrl") || callbackUrl;

    // Redirect to loading page
    router.push(finalCallbackUrl);

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error("Google Client ID not found");

      console.log("Using Google Client ID:", clientId);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });

      const tempButtonContainer = document.createElement('div');
      tempButtonContainer.style.position = 'absolute';
      tempButtonContainer.style.top = '-9999px';
      tempButtonContainer.style.left = '-9999px';
      document.body.appendChild(tempButtonContainer);

      window.google.accounts.id.renderButton(tempButtonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 250
      });

      setTimeout(() => {
        const googleButton = tempButtonContainer.querySelector('[role="button"]') as HTMLElement;
        if (googleButton) {
          console.log("Clicking Google button programmatically");
          googleButton.click();
        } else {
          console.error("Google button not found");
          window.google.accounts.id.prompt((notification: any) => {
            console.log("Google prompt result:", notification);
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              router.push("/?error=popup_blocked");
            }
          });
        }

        setTimeout(() => {
          if (document.body.contains(tempButtonContainer)) {
            document.body.removeChild(tempButtonContainer);
          }
        }, 1000);
      }, 100);

    } catch (error) {
      console.error("Google login initialization failed:", error);
      router.push("/?error=init_failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const sharedClasses =
    "flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "home"
      ? "h-14 px-7 rounded-xl text-lg font-normal"
      : "h-10 px-4 rounded-md text-sm font-normal w-full";

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
          : "Continue with Google"}
      </span>
    </button>
  );
}
