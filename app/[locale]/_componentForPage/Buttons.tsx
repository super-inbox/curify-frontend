"use client";

import BtnP from "../_components/button/ButtonPrimary";
import Icon from "../_components/Icon";
import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Buttons() {
  const [open, setOpen] = useAtom(drawerAtom);

  return (
    <div className="flex">
      {/* Book a Demo CTA */}
      <Link href="/contact">
        <BtnP>
          Book a Demo
        </BtnP>
      </Link>

      <div className="w-9" />

      {/* Google Auth (temporarily disabled) */}
      {/*
      <BtnP
        type="white"
        onClick={() =>
          signIn("google", { redirect: false }).then((result) => {
            console.log(result);
            if (result?.error) {
              console.error("Login failed:", result.error);
            }
          })
        }
      >
        <Icon name="google" size={6} />
        <span className="ml-2.5">Continue with Google</span>
      </BtnP>
      */}
    </div>
  );
}
