import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // 1) Force www redirect (apex -> www)
  const host = req.headers.get("host");
  if (host === "curify-ai.com") {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = "www.curify-ai.com";
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  // 2) Run i18n middleware
  const res = intlMiddleware(req);

  // 3) Pass pathname to layout
  res.headers.set("x-pathname", url.pathname);

  // 4) Auth is enforced client-side in app/[locale]/authProvider.tsx
  // (PROTECTED_PREFIXES checks profile validity on mount). The
  // previous server-side gate here read `next-auth.session-token`
  // cookies that this app never sets — only EN routes were unaffected
  // (the gate was scoped to locale-prefixed paths). For non-EN users
  // the gate silently 302d every /workspace, /magic, and
  // /project_details visit back to the locale home. Removed 2026-05-22.
  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
