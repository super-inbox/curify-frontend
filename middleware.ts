import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 🛡️ Define Protected Routes (path WITHOUT locale prefix)
const protectedRoutes = ["/workspace", "/magic", "/project_details"];

// Helper: read next-auth session token in dev/prod (http/https)
function getSessionToken(req: NextRequest) {
  return (
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    null
  );
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // 1) Force www redirect (apex -> www)
  const host = req.headers.get("host");
  if (host === "curify-ai.com") {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = "www.curify-ai.com";
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  // 2) Block unsupported locale prefixes (e.g. /ko) BEFORE next-intl runs
  // If you removed "ko" from routing.locales, next-intl may still treat it oddly depending on config.
  // So we explicitly handle it here.
  const pathname = url.pathname;
  const matched = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const locale = matched?.[1]?.toLowerCase();

  const supportedLocales = (routing.locales || []).map((l) => l.toLowerCase());
  const defaultLocale = (routing.defaultLocale || "en").toLowerCase();

  // If path starts with a 2-letter locale but it's not supported -> 308 to default locale, keep the rest
  // e.g. /ko/inspiration-hub -> /en/inspiration-hub
  if (locale && !supportedLocales.includes(locale)) {
    const rest = pathname.replace(new RegExp(`^/${locale}`), ""); // keep leading "/" in rest
    const target = `/${defaultLocale}${rest || ""}`;
    const redirectUrl = new URL(req.url);
    redirectUrl.pathname = target;
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  // 3) Run i18n middleware
  const res = intlMiddleware(req);

  // 4) Pass pathname to layout
  res.headers.set("x-pathname", pathname);

  // 5) Auth gate (only for locale-prefixed routes)
  // If you also want to protect non-locale routes, you can add another branch.
  if (locale && supportedLocales.includes(locale)) {
    const token = getSessionToken(req);

    // Remove locale prefix robustly
    // "/en/energy" -> "/energy"
    // "/en" -> "/"
    let pathWithoutLocale = pathname.replace(
      new RegExp(`^/${locale}(/|$)`),
      "$1"
    );
    if (pathWithoutLocale === "") pathWithoutLocale = "/";
    if (!pathWithoutLocale.startsWith("/")) pathWithoutLocale = `/${pathWithoutLocale}`;

    const isProtected = protectedRoutes.some(
      (route) =>
        pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );

    if (isProtected && !token) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
