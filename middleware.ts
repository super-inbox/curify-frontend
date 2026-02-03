import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // 1. Force www redirect (308 Permanent)
  const host = req.headers.get("host");
  if (host === "curify-ai.com") {
    const url = new URL(req.url);
    url.host = "www.curify-ai.com";
    return NextResponse.redirect(url, { status: 308 });
  }

  // Run next-intl middleware first
  const res = intlMiddleware(req);

  // 🔥 Send pathname to layout.tsx
  res.headers.set("x-pathname", req.nextUrl.pathname);

  const pathname = req.nextUrl.pathname;
  const matched = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const locale = matched?.[1];

  if (locale) {
    const token = req.cookies.get("next-auth.session-token")?.value;

    // ----- Public routes -----
    const isRoot = pathname === `/${locale}`;
    const isLogin = pathname === `/${locale}/login`;
    const isContact = pathname === `/${locale}/contact`;
    const isAbout = pathname === `/${locale}/about`;
    const isPricing = pathname === `/${locale}/pricing`;
    const isWorkspace = pathname === `/${locale}/workspace`;
    const isPrivacy = pathname === `/${locale}/privacy`;
    const isAgreement = pathname === `/${locale}/agreement`;
    const isBlog = pathname === `/${locale}/blog` || pathname.startsWith(`/${locale}/blog/`);
    const isProjectDetail = pathname.startsWith(`/${locale}/project_details/`);
    const isMagic = pathname.startsWith(`/${locale}/magic/`);
    const isBilingual = pathname === `/${locale}/bilingual-subtitles`;
    const isDubbing = pathname === `/${locale}/video-dubbing`;
    const isTools = pathname.startsWith(`/${locale}/tools`);    
    const isNanoBananaProPrompts = 
      pathname === `/${locale}/nano-banana-pro-prompts` || 
      pathname.startsWith(`/${locale}/nano-banana-pro-prompts/`);

    const isInspirationHub =
    pathname === `/${locale}/inspiration-hub` || 
    pathname.startsWith(`/${locale}/inspiration-hub/`);

    const isPublicPage =
      isRoot || isLogin || isContact || isAbout || isPricing ||
      isWorkspace || isPrivacy || isAgreement || isBlog ||
      isProjectDetail || isMagic || isBilingual || isDubbing ||
      isNanoBananaProPrompts || isInspirationHub || isTools;

    // ----- Bot detection (Googlebot, Bing, etc.) -----
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider/i.test(userAgent);

    // 🔥 Never redirect bots — they must see real HTML pages
    if (!isBot) {
      // Redirect unauthenticated users away from private pages
      if (!token && !isPublicPage) {
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
      }

      // Redirect logged-in users away from login/root pages
      if (token && (isRoot || isLogin)) {
        return NextResponse.redirect(new URL(`/${locale}/main`, req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
