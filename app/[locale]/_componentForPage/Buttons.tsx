"use client";

import BtnP from "../_components/button/ButtonPrimary";
import Icon from "../_components/Icon";
import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";
import { signIn } from "next-auth/react";

export default function Buttons() {
  const [open, setOpen] = useAtom(drawerAtom);

  return (
    <div className="flex">
      <BtnP onClick={() => setOpen("signin")}>Try Free</BtnP>
      <div className="w-9" />
      <BtnP
        type="white"
        onClick={() =>
          signIn("google", { redirect: false }).then((result) => {
            console.log(result); // 查看结果
            if (result?.error) {
              console.error("Login failed:", result.error);
            }
          })
        }
      >
        <Icon name="google" size={6} />
        <span className="ml-2.5">Sign in with Google</span>
      </BtnP>
    </div>
  );
}
