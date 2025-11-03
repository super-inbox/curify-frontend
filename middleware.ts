import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  const pathname = req.nextUrl.pathname;
  const matched = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const locale = matched?.[1];

  if (locale) {
    const token = req.cookies.get("next-auth.session-token")?.value;

    const isRoot = pathname === `/${locale}`;
    const isLogin = pathname === `/${locale}/login`;
    const isContact = pathname === `/${locale}/contact`;
    const isAbout = pathname === `/${locale}/about`;
    const isPricing = pathname === `/${locale}/pricing`;
    const isWorkspace = pathname === `/${locale}/workspace`;
    const isPrivacy = pathname === `/${locale}/privacy`;
    const isAgreement = pathname === `/${locale}/agreement`;
    const isProjectDetail = pathname.startsWith(`/${locale}/project_details/`);
    const isMagic = pathname.startsWith(`/${locale}/magic/`);
    const isBilingual = pathname.startsWith(`/${locale}/bilingual-subtitles`);
    const isDubbing = pathname.startsWith(`/${locale}/video-dubbing`);
    const isCreator = pathname.startsWith(`/${locale}/creator`);
    const isBlog = pathname === `/${locale}/blog` || pathname.startsWith(`/${locale}/blog/`);

    const isPublicPage =
      isRoot || isLogin || isContact || isAbout || isPricing || isWorkspace || isProjectDetail || isMagic || isPrivacy || isAgreement || isBilingual || isDubbing || isBlog || isCreator;

    // Redirect unauthenticated users if they try to access private routes
    if (!token && !isPublicPage) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }

    // Redirect logged-in users away from public-only pages
    if (token && (isRoot || isLogin)) {
      return NextResponse.redirect(new URL(`/${locale}/main`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
