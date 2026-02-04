"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { footerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";
import type { User, UserSession } from "@/types/auth";

type AnyUser = User | UserSession;

interface Props {
  children: React.ReactNode;
  user: AnyUser | null;
}

export default function AppWrapper({ children, user }: Props) {
  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [, setFooterState] = useAtom(footerAtom);

  const pathname = usePathname();

  // ✅ Track user by stable ID to prevent duplicate updates
  const lastUserIdRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Build stable user identifier
    const currentUserId = user?.user_id || user?.email || null;

    // ✅ Only update if user actually changed
    if (lastUserIdRef.current === currentUserId && hasInitialized.current) {
      return;
    }

    lastUserIdRef.current = currentUserId;
    hasInitialized.current = true;

    if (user) {
      setUser(user);          // ✅ userAtom 现在允许 AnyUser
      setHeaderState("in");
    } else {
      setUser(null);
      setHeaderState("out");
    }
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
