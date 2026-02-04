"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { footerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  user: User | null;
}

export default function AppWrapper({ children, user }: Props) {
  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [, setFooterState] = useAtom(footerAtom);

  const pathname = usePathname();

  // ✅ Critical: Track user by stable ID to prevent duplicate updates
  const lastUserIdRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Build stable user identifier
    const currentUserId = user?.user_id || user?.email || null;
    
    // ✅ CRITICAL: Only update if user actually changed
    // This prevents re-initialization when language changes
    if (lastUserIdRef.current === currentUserId && hasInitialized.current) {
      return; // Skip - same user
    }

    lastUserIdRef.current = currentUserId;
    hasInitialized.current = true;

    // Set user and header state
    if (user) {
      setUser(user);
      setHeaderState("in");
    } else {
      setUser(null);
      setHeaderState("out");
    }
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    // Footer visibility based on subpages
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
