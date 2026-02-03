"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";

export default function UserHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("curifyUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
      }
    } catch (err) {
      console.error("❌ Failed to hydrate user from localStorage:", err);
    }
  }, []);

  return <>{children}</>;
}