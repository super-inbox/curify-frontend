"use client";
import React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, headerAtom } from "@/app/atoms/atoms";
import BtnP from "../_components/button/ButtonPrimary";
import GoogleLoginButton from "../_components/button/GoogleLoginButton";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Buttons() {
  const t = useTranslations("ctaButtons");
  const router = useRouter();

  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    fetch("/data/userInfo.json")
      .then((res) => res.json())
      .then((data) => setMockUser(data))
      .catch((err) => console.error("Failed to load mock user:", err));
  }, []);

  const handleMockLogin = () => {
    if (mockUser) {
      localStorage.setItem("curifyUser", JSON.stringify(mockUser));
      setUser(mockUser);
      setHeaderState("in");
      router.push("/workspace");
    } else {
      alert(t("mockUserNotLoaded"));
    }
  };

  return (
    <div className="flex gap-4">
      {/* Book a Demo CTA */}
      <Link href="/contact">
        <BtnP className="h-12 px-6 rounded-lg text-base">
          {t("bookDemo")}
        </BtnP>
      </Link>

      {/* Google Button (styled same height/shape) */}
      <GoogleLoginButton variant="home" />
    </div>
  );
}
