"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The current URL's query string, read AFTER hydration.
 *
 * Drop-in replacement for `useSearchParams()` in client components that only
 * need the query for post-hydration behaviour — seeding a form from a deep
 * link, building a back-link, firing an analytics event.
 *
 * Why this exists: `useSearchParams()` triggers Next's CSR bailout, which makes
 * every page rendering the component un-prerenderable ("useSearchParams() should
 * be wrapped in a suspense boundary"). The usual remedy — a `<Suspense>` wrapper
 * — costs the component's markup in the prerendered HTML, which we do not want
 * for anything a crawler should see. This hook keeps the component in the static
 * output and fills the params in on the client instead.
 *
 * Returns `null` on the server and on the first client render, so callers must
 * handle the absent case (that first render is what gets prerendered). Re-reads
 * on route change and on back/forward; it does NOT observe a bare
 * `router.replace` that only swaps the query string.
 */
export function useClientSearchParams(): URLSearchParams | null {
  const pathname = usePathname();
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    const read = () => setParams(new URLSearchParams(window.location.search));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [pathname]);

  return params;
}
