'use client';

import Drawer from "../../_components/Drawer";
import { useAtom, useSetAtom } from "jotai";
import { drawerAtom, authLoadingAtom, userAtom } from "@/app/atoms/atoms";
import Image from "next/image";
import Input from "../../_components/Input";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import GoogleLoginButton from "../../_components/button/GoogleLoginButton";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth";
import { resetAnonymousCopyCount } from "@/lib/copyGating";

const OTP_LENGTH = 6;

function OtpBoxes({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").slice(0, OTP_LENGTH);
  while (digits.length < OTP_LENGTH) digits.push("");

  const focus = (i: number) => inputRefs.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? ch : d)).join("");
    onChange(next);
    if (ch && i < OTP_LENGTH - 1) focus(i + 1);
    if (next.replace(/\s/g, "").length === OTP_LENGTH && ch) onComplete();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) focus(i - 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH));
    focus(Math.min(pasted.length, OTP_LENGTH - 1));
    if (pasted.length === OTP_LENGTH) onComplete();
  };

  useEffect(() => {
    focus(0);
  }, []);

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-11 h-13 text-center text-xl font-semibold rounded-xl border-2 outline-none transition-all
            ${d
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-neutral-200 bg-white text-neutral-800 focus:border-purple-400"
            }
          `}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}

export default function SignDrawer() {
  const [state] = useAtom(drawerAtom);
  const [authLoading] = useAtom(authLoadingAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const setUser = useSetAtom(userAtom);
  const safeState = state || "signup";
  const { locale } = useParams();
  const t = useTranslations("signDrawer");

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const messages: Record<string, Record<string, string>> = {
    signup: { welcome: t("welcomeSignup"), button: t("signUp") },
    signin: { welcome: t("welcomeSignin"), button: t("signIn") },
  };

  const effectiveState = messages[safeState] ? safeState : "signup";
  const content = messages[effectiveState];

  const otpComplete = otp.replace(/\D/g, "").length === OTP_LENGTH;

  const handleEmailSubmit = async () => {
    if (!emailValid || isSending) return;
    setErrorMsg("");
    setIsSending(true);
    try {
      await authService.sendOtp(email);
      setOtp("");
      setStep(2);
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("404") || msg.includes("does not exist")) {
        setErrorMsg(t("emailNotFound"));
      } else {
        setErrorMsg(t("sendOtpFailed"));
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpComplete || isVerifying) return;
    setErrorMsg("");
    setIsVerifying(true);
    try {
      const result = await authService.verifyOtp(email, otp);
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      setUser(result.data.user);
      resetAnonymousCopyCount();
      setDrawerState(null);
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("expired")) {
        setErrorMsg(t("otpExpired"));
      } else if (msg.includes("Incorrect") || msg.includes("incorrect")) {
        setErrorMsg(t("invalidOtp"));
      } else if (msg.includes("No OTP")) {
        setErrorMsg(t("noOtpIssued"));
      } else {
        setErrorMsg(t("invalidOtp"));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setErrorMsg("");
  };

  return (
    <Drawer size="medium" open={state === "signin" || state === "signup"}>
      {authLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="relative w-12 h-12 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <div className="flex items-center gap-2 mb-2">
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

      {/* Header */}
      <div className="relative">
        {step === 2 && (
          <button onClick={resetFlow} className="absolute left-0 top-0 p-1 text-gray-500 hover:text-gray-700">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        <div className="relative w-36 aspect-[160/38.597] mx-auto">
          <Image src="/logo.svg" alt={t("logoAlt")} fill className="object-contain" />
        </div>
      </div>

      {step === 1 ? (
        <>
          <p className="mt-3 mb-8 w-full text-center text-lg font-medium">{content.welcome}</p>

          <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto px-2">
            <div className="w-full">
              <GoogleLoginButton variant="drawer" />
            </div>
            <div className="text-sm text-gray-400">{t("or")}</div>
            <Input
              value={email}
              placeholder={t("emailPlaceholder")}
              onChange={setEmail}
              setValid={setEmailValid}
              rules={[{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMsg: t("invalidEmail") }]}
            />
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

            <button
              onClick={handleEmailSubmit}
              disabled={isSending}
              className={`
                w-full py-3 rounded-lg text-base font-semibold transition-all duration-200
                ${emailValid
                  ? "bg-[var(--p-blue)] text-white hover:bg-[var(--p-blue-hover)] cursor-pointer shadow-sm"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                }
              `}
            >
              {isSending ? t("sending") : content.button}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* OTP step */}
          <div className="mt-4 mb-6 flex flex-col items-center gap-1">
            <div className="text-4xl mb-2">📬</div>
            <h2 className="text-lg font-semibold text-neutral-900">Check your inbox</h2>
            <p className="text-sm text-neutral-500 text-center max-w-xs">
              We sent a <span className="font-medium text-neutral-700">{OTP_LENGTH}-digit code</span> to{" "}
              <span className="font-medium text-neutral-700">{email}</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">Check spam if you don't see it</p>
          </div>

          <div className="flex flex-col gap-5 items-center w-full max-w-sm mx-auto px-2">
            <OtpBoxes
              value={otp}
              onChange={setOtp}
              onComplete={handleOtpSubmit}
            />

            {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}

            <button
              onClick={handleOtpSubmit}
              disabled={isVerifying}
              className={`
                w-full py-3 rounded-lg text-base font-semibold transition-all duration-200
                ${otpComplete
                  ? "bg-[var(--p-blue)] text-white hover:bg-[var(--p-blue-hover)] cursor-pointer shadow-sm"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                }
              `}
            >
              {isVerifying ? t("verifying") : t("verifyCode")}
            </button>

            <button
              className="text-xs text-neutral-500 hover:text-purple-600 underline underline-offset-2 transition-colors"
              onClick={resetFlow}
              type="button"
            >
              {t("resendCode")} or use a different email
            </button>
          </div>
        </>
      )}

      <p className="text-[var(--c4)] text-center mt-10 text-xs">
        {t("agreePrefix")}
        <br />
        <Link className="underline" href={`/${locale}/agreement`}>{t("termsOfService")}</Link>{" "}
        {t("and")}{" "}
        <Link className="underline" href={`/${locale}/privacy`}>{t("privacyPolicy")}</Link>
      </p>
    </Drawer>
  );
}
