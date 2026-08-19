import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import { clientIpFrom, isBlockedIp } from "./lib/blocked-networks";
import { isBlockedBot, isCorpusPath } from "./lib/blocked-bots";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Hoisted above the block gates below, which both branch on it.
  const host = req.headers.get("host");

  // 0) Refuse the corpus-harvesting networks before doing any other work.
  // Every page render here is dynamic (the (public) layout calls headers()),
  // so an un-blocked request costs a full origin render + transfer. See
  // lib/blocked-networks.ts for the evidence, why this matches on IP only (the
  // pool's user-agent is the stock Mac Chrome string that thousands of real
  // visitors also send), and why it has no GEO value.
  if (process.env.BLOCK_NETWORKS_DISABLED !== "1") {
    const ip = clientIpFrom(req.headers);
    if (isBlockedIp(ip)) {
      return new NextResponse("Forbidden", {
        status: 403,
        headers: {
          "cache-control": "public, max-age=86400",
          "x-blocked-reason": "network",
        },
      });
    }
  }

  // 0b) Refuse bulk training crawlers on the corpus routes.
  //
  // 2026-08-19: meta-externalagent was walking
  // /hi/carousel/template-example/... at ~531 MB Fluid and 90-260 ms per
  // request. These routes render dynamically (the (public) layout calls
  // headers()), so every hit is an origin render — a 403 here costs a
  // middleware invocation instead.
  //
  // Scoped to the corpus paths on purpose: these crawlers may still fetch the
  // home page, blog and tool pages, which are cheap and occasionally useful
  // for link previews. The bleed is the 20k-URL prompt corpus.
  //
  // On a NON-CANONICAL host (the *.vercel.app deployment URL) every bot hit is
  // pure waste — that host must never be indexed at all — so there the block
  // is not path-scoped. Humans reviewing a preview deployment are unaffected
  // because the match is on self-declared bot UAs only.
  if (process.env.BLOCK_BOTS_DISABLED !== "1") {
    const ua = req.headers.get("user-agent");
    if (isBlockedBot(ua)) {
      const nonCanonicalHost = !!host && host !== "www.curify-ai.com";
      if (nonCanonicalHost || isCorpusPath(url.pathname)) {
        return new NextResponse("Forbidden", {
          status: 403,
          headers: {
            "cache-control": "public, max-age=86400",
            "x-blocked-reason": nonCanonicalHost ? "bot-on-preview-host" : "bot-on-corpus",
          },
        });
      }
    }
  }

  // 1) Force www redirect (apex -> www)
  if (host === "curify-ai.com") {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = "www.curify-ai.com";
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  // 2) Run i18n middleware
  const res = intlMiddleware(req);

  // 3) Pass pathname to layout
  res.headers.set("x-pathname", url.pathname);

  // 3b) Keep non-canonical hosts (the *.vercel.app deployment URLs) out of
  // the index. app/robots.ts already serves them a closed robots.txt, but a
  // disallow only stops *future* crawls — Google has already discovered
  // /zh/tools/mockup and others via curify-frontend.vercel.app, and a
  // disallowed-but-linked URL can still surface as a bare URL entry. This
  // header drops those. Deliberately not a redirect to www: preview
  // deployments must stay browsable for review.
  if (host && host !== "www.curify-ai.com") {
    res.headers.set("x-robots-tag", "noindex, nofollow");
  }

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
