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

  // ✅ Prevent re-initialization on language changes
  const initializedRef = useRef(false);
  const lastUserKeyRef = useRef<string>("");

  useEffect(() => {
    // Build a stable key for dedupe
    const key = user?.id
      ? `id:${user.id}`
      : user?.email
        ? `email:${user.email}`
        : user
          ? "anon-user"
          : "null";

    // Skip if same user (prevents unnecessary atom updates)
    if (lastUserKeyRef.current === key) return;
    lastUserKeyRef.current = key;

    // Set user and header state
    if (user) {
      setUser(user);
      setHeaderState("in");
    } else {
      setUser(null);
      setHeaderState("out");
    }

    initializedRef.current = true;
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    // Footer visibility based on subpages
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
