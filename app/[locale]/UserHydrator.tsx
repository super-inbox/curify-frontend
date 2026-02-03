"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";

// 只在这些页面需要强制刷新最新数据 (例如支付回调后，或者极高频操作页)
// 如果你对 Session 的实时性要求不高 (比如 top-up 完你会手动 update session)，
// 这里甚至可以留空。
const FORCE_FETCH_ROUTES = ["/workspace", "/magic"]; 

export default function UserHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    const pathWithoutLocale = pathname.replace(/^\/[a-zA-Z]{2}(\/|$)/, "/") || "/";

    
    const shouldRefetch = FORCE_FETCH_ROUTES.some(prefix => 
       pathWithoutLocale === prefix || pathWithoutLocale.startsWith(prefix + "/")
    );

    if (!shouldRefetch) {
      return; 
    }
    
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile"); 
        if (res.ok) {
          const data = await res.json();
          if (mounted.current) {
            setUser(data);             
          }
        }
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    fetchProfile();

    return () => {
      mounted.current = false;
    };
  }, [pathname, setUser]);

  return <>{children}</>;
}