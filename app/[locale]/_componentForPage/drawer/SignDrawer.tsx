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

export default function SignDrawer() {
  const [state] = useAtom(drawerAtom);
  const safeState = state || "signup";

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpValid, setOtpValid] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const messages: Record<string, Record<string, string>> = {
    signup: {
      welcome: "Join Curify to Globalize Your Videos",
      button: "Sign Up",
    },
    signin: {
      welcome: "Continue Globalizing Your Videos",
      button: "Sign In",
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
      setErrorMsg("Invalid OTP. Please try again.");
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
      open={state === "signin" || state === "signup"} // ✅ fix
    >    <div className="relative">
        {step === 2 && (
          <button onClick={resetFlow} className="absolute left-0 top-0 p-1 text-gray-500 hover:text-gray-700">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        <div className="relative w-36 aspect-[160/38.597] mx-auto">
          <Image src="/logo.svg" alt="logo" fill className="object-contain" />
        </div>
      </div>

      <p className="mt-3 mb-10 w-full text-center text-lg font-medium">
        {step === 1 ? content.welcome : "Enter the verification code"}
      </p>

      <div className="flex flex-col gap-5 items-center w-full max-w-sm mx-auto px-2">
        {step === 1 ? (
          <>
            <div className="w-full">
              <GoogleLoginButton callbackUrl="/workspace" variant="drawer" />
            </div>

            <div className="text-sm text-gray-500">or</div>

            <Input
              value={email}
              placeholder="Email"
              onChange={setEmail}
              setValid={setEmailValid}
              rules={[
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  errorMsg: "Please enter a valid email address.",
                },
              ]}
              // Disable the email input
              disabled={true} 
            />
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

            <BtnN
              className="w-full py-3 text-base"
              // Disable the button
              disabled={true} 
              onClick={handleEmailSubmit}
            >
              {content.button}
            </BtnN>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 text-center">
              We've sent a code to <span className="font-semibold">{email}</span>.
            </p>
            <Input
              value={otp}
              placeholder="Verification Code"
              onChange={setOtp}
              setValid={setOtpValid}
              rules={[]} 
              // Disable the OTP input
              disabled={true} 
            />
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
            <BtnN
              className="w-full py-3 text-base"
              // Disable the button
              disabled={true}
              onClick={handleOtpSubmit}
            >
              Verify Code
            </BtnN>
            <button className="text-xs text-blue-600 hover:underline mt-2 cursor-not-allowed opacity-50" disabled>
              Resend Code
            </button>
          </>
        )}
      </div>

      <p className="text-[var(--c4)] text-center mt-10 text-xs">
        By using Curify, you agree to our
        <br />
        <Link className="underline" href={""}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="underline" href={""}>
          Privacy Policy
        </Link>
      </p>
    </Drawer>
  );
}