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

    const isRoot = pathname.endsWith(`/${locale}`);
    const isLogin = pathname.endsWith(`/${locale}/login`);
    const isContact = pathname.endsWith(`/${locale}/contact`);

    // 处理页面重定向
    if (token) {
      // 登录状态，禁止访问 / 和 /login
      if (isRoot || isLogin) {
        return NextResponse.redirect(new URL(`/${locale}/main`, req.url));
      }
    } else {
      // 未登录状态，仅允许访问 /、/login、/contact
      if (!isRoot && !isLogin && !isContact) {
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
      }
    }
  }

  return res;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
