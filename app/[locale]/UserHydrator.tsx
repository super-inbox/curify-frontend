"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";

// Pages that need fresh profile data (e.g., after payment callbacks)
const FORCE_FETCH_ROUTES = ["/workspace", "/magic", "/project_details"];

export default function UserHydrator({ 
  children,
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: any;
}) {
  const setUser = useSetAtom(userAtom);
  const pathname = usePathname();
  const mounted = useRef(false);
  const lastFetchPath = useRef<string>("");
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    // Always set initial user from session on mount
    if (initialUser && !hasFetchedOnce.current) {
      setUser(initialUser);
    }

    // Extract path without locale
    const pathWithoutLocale = pathname.replace(/^\/[a-zA-Z]{2}(\/|$)/, "/") || "/";

    // Check if current page requires fresh data
    const shouldRefetch = FORCE_FETCH_ROUTES.some(prefix => 
      pathWithoutLocale === prefix || pathWithoutLocale.startsWith(prefix + "/")
    );

    // Skip if:
    // 1. Not a protected page
    // 2. Already fetched for this exact path
    // 3. No initial user (not logged in)
    if (!shouldRefetch || lastFetchPath.current === pathWithoutLocale || !initialUser) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          // Prevent caching to ensure fresh data
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (mounted.current) {
            setUser(data);
            lastFetchPath.current = pathWithoutLocale;
            hasFetchedOnce.current = true;
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
  }, [pathname, setUser, initialUser]);

  return <>{children}</>;
}
