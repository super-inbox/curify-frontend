'use client';

import Drawer from "../../_components/Drawer";
import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";
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

      <p className="mt-3 mb-10 w-full text-center text-lg font-medium">
        {step === 1 ? content.welcome : t("enterVerificationCode")}
      </p>

      <div className="flex flex-col gap-5 items-center w-full max-w-sm mx-auto px-2">
        {step === 1 ? (
          <>
            <div className="w-full">
              <GoogleLoginButton callbackUrl="/workspace" variant="drawer" />
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
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

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
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
            <BtnN
              className="w-full py-3 text-base"
              disabled={true}
              onClick={handleOtpSubmit}
            >
              {t("verifyCode")}
            </BtnN>
            <button className="text-xs text-blue-600 hover:underline mt-2 cursor-not-allowed opacity-50" disabled>
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
