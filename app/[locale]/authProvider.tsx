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
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const [mounted, setMounted] = useState(false);

 // 你自己的 loading UI 逻辑也可以保留
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathWithoutLocale = useMemo(() => stripLocale(pathname), [pathname]);

  const isProtected = useMemo(
    () => PROTECTED_PREFIXES.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")),
    [pathWithoutLocale]
  );

  const refresh = searchParams.get("refresh") === "1"; // 可选：支付/订阅回调专用

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 1) 有 initialUser：直接注水，不请求
    if (initialUser) {
      setUser(initialUser);
      setAuthLoading(false);
      return;
    }

    // 2) public 页：不要拉 profile（避免 locale 切换重复请求）
    if (!isProtected && !refresh) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    // 3) protected 或 refresh 才尝试拉 profile
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
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialUser, isProtected, refresh, setUser, setAuthLoading]);

  if (!mounted) return null;
  return <>{children}</>;
}
