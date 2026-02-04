import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 🛡️ Define Protected Routes
const protectedRoutes = [
  "/workspace",
  "/magic",
  "/project_details",
];

export default function middleware(req: NextRequest) {
  // 1. Force www redirect
  const host = req.headers.get("host");
  if (host === "curify-ai.com") {
    const url = new URL(req.url);
    url.host = "www.curify-ai.com";
    return NextResponse.redirect(url, { status: 308 });
  }

  // 2. Run i18n middleware
  const res = intlMiddleware(req);

  // 3. Pass pathname to layout
  res.headers.set("x-pathname", req.nextUrl.pathname);

  // 4. Authentication Logic
  const pathname = req.nextUrl.pathname;
  // Match "/en", "/en/", "/zh", "/zh/" etc.
  const matched = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const locale = matched?.[1];

  if (locale) {
    const token = req.cookies.get("next-auth.session-token")?.value;
    
    // ✅ FIX: Robustly remove locale using Regex to avoid substring errors
    // e.g. "/en/energy" -> "/energy" (Correct)
    // e.g. "/energy" (if no locale) -> "/energy"
    let pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}(/|$)`), '$1');
    if (pathWithoutLocale === "") pathWithoutLocale = "/";

    // Helper: Check if current path starts with a protected route
    const isProtected = protectedRoutes.some(route => 
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );

    // 🔒 If Protected & No Token -> Redirect to Login/Home
    if (isProtected && !token) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};