import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 🛡️ Define Protected Routes (Pages that MUST have login)
// Only these paths will trigger a redirect if the user is not logged in.
// All other paths (Root, About, Blog, etc.) are implicitly Public.
const protectedRoutes = [
  "/workspace",
  "/magic",
  "/project_details",
  // Add other private paths here if needed
];

export default function middleware(req: NextRequest) {
  // --- 1. Force www redirect (SEO) ---
  const host = req.headers.get("host");
  if (host === "curify-ai.com") {
    const url = new URL(req.url);
    url.host = "www.curify-ai.com";
    return NextResponse.redirect(url, { status: 308 });
  }

  // --- 2. Run i18n middleware first ---
  const res = intlMiddleware(req);

  // --- 3. Pass pathname to layout ---
  res.headers.set("x-pathname", req.nextUrl.pathname);

  // --- 4. Authentication Logic ---
  const pathname = req.nextUrl.pathname;
  const matched = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const locale = matched?.[1];

  if (locale) {
    const token = req.cookies.get("next-auth.session-token")?.value;
    
    // Get "clean" path (e.g., "/en/workspace" -> "/workspace", "/en" -> "/")
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

    // Helper: Check if current path is in the protected list
    const isProtected = protectedRoutes.some(route => 
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );

    // 🔒 If it's a Protected Route AND user is NOT logged in -> Redirect
    if (isProtected && !token) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }

    // ✅ Explicitly Public:
    // Root ("/"), Contact, About, etc. fall through here automatically.
    // They will NOT be redirected.
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};