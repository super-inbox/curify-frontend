'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { usePathname, useSearchParams } from 'next/navigation';
import { userAtom, authLoadingAtom } from "@/app/atoms/atoms";
import { authService } from '@/services/auth';

const PROTECTED_PREFIXES = ["/workspace", "/magic", "/project_details"];

function stripLocale(pathname: string) {
  return pathname.replace(/^\/[a-zA-Z]{2}(\/|$)/, "/") || "/";
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: any;
}) {
  const [user, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathWithoutLocale = useMemo(() => stripLocale(pathname), [pathname]);
  const isProtected = useMemo(
    () => PROTECTED_PREFIXES.some(
      (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
    ),
    [pathWithoutLocale]
  );
  const refresh = searchParams.get("refresh") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 1) Server passed an initialUser (e.g. SSR session cookie) — use it directly
    if (initialUser) {
      setUser(initialUser);
      setAuthLoading(false);
      return;
    }

    // 2) atomWithStorage already rehydrated userAtom from localStorage on mount.
    //    For public pages, that's enough — no need to hit the API.
    if (!isProtected && !refresh) {
      setAuthLoading(false);
      return;
    }

    // 3) Protected page or explicit refresh — verify the stored token is still
    //    valid by fetching the profile. Clears user if the token has expired.
    const justSignedOut = sessionStorage.getItem('justSignedOut');
    if (justSignedOut) {
      setUser(null);
      setAuthLoading(false);
      sessionStorage.removeItem('justSignedOut');
      return;
    }

    let cancelled = false;
    (async () => {
      setAuthLoading(true);
      try {
        const profile = await authService.getProfile();
        if (!cancelled) setUser(profile);
      } catch {
        // Token invalid/expired — clear persisted state
        if (!cancelled) {
          setUser(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [initialUser, isProtected, refresh, setUser, setAuthLoading]);

  if (!mounted) return null;
  return <>{children}</>;
}
