"use client";

import Drawer from "../../_components/Drawer";
import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";
import Image from "next/image";
import Input from "../../_components/Input";
import { useState } from "react";
import BtnN from "../../_components/button/ButtonNormal";
import Link from "next/link";
import Icon from "../../_components/Icon";

export default function SignDrawer() {
  const [state, setState] = useAtom(drawerAtom);
  const safeState = state || "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const messages: Record<string, Record<string, string>> = {
    signup: {
      welcome: "Join Curify to Globalize Your Videos",
      button: "Sign Up",
      otherButton: "Sign In",
      lead: "Already have an account?",
    },
    signin: {
      welcome: "Continue Globalizing Your Videos",
      button: "Sign In",
      otherButton: "Sign Up",
      lead: "Don’t have an account?",
    },
    emailout: {},
    emailin: {},
  };

  return (
    <Drawer size="large" open={!!state?.includes("sign")}>
      <div className="relative w-45 aspect-[160/38.597]">
        <Image src="/logo.svg" alt="logo" fill className="object-contain" />
      </div>

      <p className="mt-3 mb-12 w-full text-center">
        {messages[safeState].welcome}
      </p>

      <div className="flex flex-col gap-3">
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
        />

        <Input
          value={password}
          placeholder="Password"
          onChange={setPassword}
          setValid={setPasswordValid}
          rules={[
            {
              pattern: /^.{6,}$/,
              errorMsg: "Password must be at least 6 characters.",
            },
          ]}
        />

        <div className="flex items-center justify-between">
          <BtnN
            disabled={!(emailValid && passwordValid)}
            onClick={() => console.log(1)}
          >
            {messages[safeState].button}
          </BtnN>
          <div className="flex items-center">
            <p className="mr-3">or</p>
            <BtnN whiteConfig={["no-highlight", "custom"]} onClick={() => {}}>
              <div className="p-3">
                <Icon size={5} name="google" />
              </div>
            </BtnN>
          </div>
        </div>
      </div>

      <p className="mt-6 mb-18 w-full text-center">
        {messages[safeState].lead}{" "}
        <button
          className="bg-white border-none text-[var(--p-blue)] cursor-pointer"
          onClick={() => setState(safeState === "signup" ? "signin" : "signup")}
        >
          {messages[safeState].otherButton}
        </button>
      </p>

      <p className="text-[var(--c4)] text-center -mb-6">
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
