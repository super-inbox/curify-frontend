// // /components/auth/GoogleLoginButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom } from "@/app/atoms/atoms";
import BtnP from "@/app/_components/button/ButtonPrimary";
import Icon from "@/app/_components/Icon";
import { authService } from "@/services/auth";

export default function GoogleLoginButton() {
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();

  // Load Google Identity Services script on mount
  useEffect(() => {
    const loadGoogleScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        if (document.getElementById("google-script")) {
          const checkGoogle = setInterval(() => {
            if (window.google?.accounts?.id) {
              clearInterval(checkGoogle);
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

    loadGoogleScript()
      .then(() => setGoogleLoaded(true))
      .catch((err) => console.error("Failed to load Google script:", err));
  }, []);

  // Handle Google credential
  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      setIsGoogleLoading(true);
      setAuthLoading(true);

      console.log("Google credential received, sending to backend...");

      const result = await authService.googleLogin(response.credential);

      console.log("Backend login successful:", result);

      setUser(result.data.user);
      router.push("/workspace");
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading || !googleLoaded) return;

    setIsGoogleLoading(true);

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
      console.log("Using Google Client ID:", clientId);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      window.google.accounts.id.prompt((notification: any) => {
        console.log("Google prompt notification:", notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("Prompt failed, trying popup...");
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            {
              theme: "outline",
              size: "large",
              width: 250,
            }
          );
        }
        setIsGoogleLoading(false);
      });
    } catch (error) {
      console.error("Google login initialization failed:", error);
      alert("Failed to initialize Google login. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      {googleLoaded ? (
        <BtnP type="white" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
          <Icon name="google" size={6} />
          <span className="ml-2.5">
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </span>
        </BtnP>
      ) : (
        <BtnP type="white" disabled>
          <Icon name="google" size={6} />
          <span className="ml-2.5">Loading...</span>
        </BtnP>
      )}

      <div id="google-signin-button" style={{ display: "none" }}></div>
    </>
  );
}
