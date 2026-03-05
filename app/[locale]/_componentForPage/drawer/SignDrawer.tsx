'use client';

import Drawer from "../../_components/Drawer";
import { useAtom } from "jotai";
import { drawerAtom, authLoadingAtom } from "@/app/atoms/atoms";
import Image from "next/image";
import Input from "../../_components/Input";
import { useState } from "react";
import BtnN from "../../_components/button/ButtonNormal";
import Link from "next/link";
import GoogleLoginButton from "../../_components/button/GoogleLoginButton";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SignDrawer() {
  const [state] = useAtom(drawerAtom);
  const [authLoading] = useAtom(authLoadingAtom);
  const safeState = state || "signup";
  const { locale } = useParams();
  const t = useTranslations("signDrawer");

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpValid, setOtpValid] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const messages: Record<string, Record<string, string>> = {
    signup: {
      welcome: t("welcomeSignup"),
      button: t("signUp"),
    },
    signin: {
      welcome: t("welcomeSignin"),
      button: t("signIn"),
    }
  };

  const effectiveState = messages[safeState] ? safeState : "signup";
  const content = messages[effectiveState];

  const handleEmailSubmit = () => {
    if (emailValid) {
      setErrorMsg("");
      console.log("OTP sent to:", email);
      setStep(2);
    }
  };

  const handleOtpSubmit = () => {
    if (otpValid) {
      setErrorMsg("");
      console.log("OTP verified:", otp);
      setErrorMsg(t("invalidOtp"));
    }
  };

  const resetFlow = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setErrorMsg("");
  };

  return (
    <Drawer
      size="medium"
      open={state === "signin" || state === "signup"}
    >
      {/* ✅ Loading overlay — shown while Google login is in flight */}
      {authLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          {/* Spinner */}
          <div className="relative w-12 h-12 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>

          {/* Google logo + message */}
          <div className="flex items-center gap-2 mb-2">
            {/* Inline Google G SVG so we don't need an extra file */}
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.36 3.05 29.46 1 24 1 14.82 1 7.02 6.48 3.64 14.26l7.1 5.51C12.4 13.67 17.73 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.68c-.55 2.96-2.2 5.47-4.67 7.15l7.18 5.57C43.27 37.27 46.52 31.36 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.74 28.23A14.6 14.6 0 0 1 9.5 24c0-1.48.25-2.91.7-4.23l-7.1-5.51A23.93 23.93 0 0 0 0 24c0 3.88.93 7.55 2.57 10.78l8.17-6.55z"/>
              <path fill="#34A853" d="M24 47c5.46 0 10.05-1.8 13.4-4.9l-7.18-5.57c-1.87 1.25-4.26 2-6.22 2-6.27 0-11.6-4.17-13.26-9.77l-8.17 6.55C7.02 41.52 14.82 47 24 47z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Signing in with Google…</span>
          </div>

          <p className="text-xs text-gray-400">This only takes a moment</p>
        </div>
      )}

      <div className="relative">
        {step === 2 && (
          <button
            onClick={resetFlow}
            className="absolute left-0 top-0 p-1 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        <div className="relative w-36 aspect-[160/38.597] mx-auto">
          <Image src="/logo.svg" alt={t("logoAlt")} fill className="object-contain" />
        </div>
      </div>

      <p className="mt-3 mb-10 w-full text-center text-lg font-medium">
        {step === 1 ? content.welcome : t("enterVerificationCode")}
      </p>

      <div className="flex flex-col gap-5 items-center w-full max-w-sm mx-auto px-2">
        {step === 1 ? (
          <>
            <div className="w-full">
              <GoogleLoginButton variant="drawer" />
            </div>

            <div className="text-sm text-gray-500">{t("or")}</div>

            <Input
              value={email}
              placeholder={t("emailPlaceholder")}
              onChange={setEmail}
              setValid={setEmailValid}
              rules={[
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  errorMsg: t("invalidEmail"),
                },
              ]}
              disabled={true}
            />
            {errorMsg && (
              <p className="text-red-500 text-xs text-center">{errorMsg}</p>
            )}

            <BtnN
              className="w-full py-3 text-base"
              disabled={true}
              onClick={handleEmailSubmit}
            >
              {content.button}
            </BtnN>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 text-center">
              {t("otpSentTo")} <span className="font-semibold">{email}</span>.
            </p>
            <Input
              value={otp}
              placeholder={t("verificationCodePlaceholder")}
              onChange={setOtp}
              setValid={setOtpValid}
              rules={[]}
              disabled={true}
            />
            {errorMsg && (
              <p className="text-red-500 text-xs text-center">{errorMsg}</p>
            )}
            <BtnN
              className="w-full py-3 text-base"
              disabled={true}
              onClick={handleOtpSubmit}
            >
              {t("verifyCode")}
            </BtnN>
            <button
              className="text-xs text-blue-600 hover:underline mt-2 cursor-not-allowed opacity-50"
              disabled
            >
              {t("resendCode")}
            </button>
          </>
        )}
      </div>

      <p className="text-[var(--c4)] text-center mt-10 text-xs">
        {t("agreePrefix")}
        <br />
        <Link className="underline" href={`/${locale}/agreement`}>
          {t("termsOfService")}
        </Link>{" "}
        {t("and")}{" "}
        <Link className="underline" href={`/${locale}/privacy`}>
          {t("privacyPolicy")}
        </Link>
      </p>
    </Drawer>
  );
}
