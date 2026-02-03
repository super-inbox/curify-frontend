"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { footerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  user: User | null;
}

function safeParseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export default function AppWrapper({ children, user }: Props) {
  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [, setFooterState] = useAtom(footerAtom);

  const pathname = usePathname();

  // ✅ Dedupe: avoid setting user repeatedly (prevents downstream duplicate effects)
  const lastUserKeyRef = useRef<string>("");

  // Only read localStorage when server user is not present.
  // useMemo here is mostly to keep the code tidy; localStorage is still read only in effect below.
  const hasServerUser = !!user;

  useEffect(() => {
    let resolvedUser: User | null = user;

    if (!resolvedUser) {
      // ✅ Fallback only when no server user
      const mockUser = safeParseUser(localStorage.getItem("curifyUser"));
      resolvedUser = mockUser;
    }

    // Build a stable key for dedupe. Prefer id/email.
    const key =
      resolvedUser?.id
        ? `id:${resolvedUser.id}`
        : resolvedUser?.email
          ? `email:${resolvedUser.email}`
          : resolvedUser
            ? "anon-user"
            : "null";

    if (lastUserKeyRef.current === key) return;
    lastUserKeyRef.current = key;

    if (resolvedUser) {
      setUser(resolvedUser);
      setHeaderState("in");
    } else {
      setHeaderState("out");
    }
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    // If you want footer only on subpages, keep as-is.
    // This logic currently depends on locale prefix structure /[locale]/...
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
