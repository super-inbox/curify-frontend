"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { footerAtom, userAtom, clientMountedAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";
import type { User, UserSession } from "@/types/auth";

type AnyUser = User | UserSession;

interface Props {
  children: React.ReactNode;
  user: AnyUser | null;
}

export default function AppWrapper({ children, user }: Props) {
  const [, setUser] = useAtom(userAtom);
  const [, setFooterState] = useAtom(footerAtom);
  const [, setClientMounted] = useAtom(clientMountedAtom);

  const pathname = usePathname();

  const lastUserIdRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  // ✅ Set clientMountedAtom to true once on first client mount.
  // Being a Jotai atom (not useState), this survives route changes —
  // Header and WorkspaceClient read it and skip the pre-mount placeholder
  // on subsequent navigations, eliminating the flash.
  useEffect(() => {
    setClientMounted(true);
  }, [setClientMounted]);

  // When the api client hits a token-carrying 401 (e.g. an expired session) it
  // wipes access_token + curifyUser from localStorage and fires `auth:expired`
  // (services/api.ts). But atomWithStorage's in-memory userAtom does NOT re-read
  // storage on a same-tab removeItem, so without a listener the UI keeps showing
  // a logged-in state (e.g. the upload dropzone) while the token is gone — the
  // next upload 401s and ONLY a full page reload resyncs. Clear userAtom here so
  // the UI reflects logged-out immediately (shows the sign-in CTA), no refresh.
  useEffect(() => {
    const onAuthExpired = () => setUser(null);
    window.addEventListener("auth:expired", onAuthExpired);
    return () => window.removeEventListener("auth:expired", onAuthExpired);
  }, [setUser]);

  useEffect(() => {
    const currentUserId = user?.user_id || user?.email || null;

    if (lastUserIdRef.current === currentUserId && hasInitialized.current) {
      return;
    }

    lastUserIdRef.current = currentUserId;
    hasInitialized.current = true;

    // Only write to userAtom if the server actually returned a user.
    // If server passes null, leave atomWithStorage's restored value untouched.
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
