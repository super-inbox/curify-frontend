"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, headerAtom } from "@/app/atoms/atoms";
import BtnP from "../_components/button/ButtonPrimary";
import Icon from "../_components/Icon";
import { useEffect, useState } from "react";

export default function Buttons() {
  const router = useRouter();
  
  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [mockUser, setMockUser] = useState<any>(null);

  // Load mock user JSON on mount
  useEffect(() => {
    fetch("/data/userInfo.json")
      .then((res) => res.json())
      .then((data) => setMockUser(data))
      .catch((err) => console.error("Failed to load mock user:", err));
  }, []);

  const handleMockLogin = () => {
    if (mockUser) {
      setUser(mockUser);
      setHeaderState("in");
      router.push("/workspace");
    } else {
      alert("Mock user data not loaded yet.");
    }
  };

  return (
    <div className="flex">
      {/* Book a Demo CTA */}
      <Link href="/contact">
        <BtnP onClick={() => {}}>Book a Demo</BtnP>
      </Link>

      <div className="w-9" />

      {/* Mock Login Button */}
      <BtnP type="white" onClick={handleMockLogin}>
        <Icon name="google" size={6} />
        <span className="ml-2.5">Continue as Mock User</span>
      </BtnP>
    </div>
  );
}
