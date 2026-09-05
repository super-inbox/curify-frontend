import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import { clientIpFrom, isBlockedIp } from "./lib/blocked-networks";
import { isBlockedBot, isCorpusPath } from "./lib/blocked-bots";
import { BLOG_SLUGS } from "./lib/blog-slugs.generated";

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

  // 0c) Real 404 for unknown /blog/* URLs.
  //
  // notFound() inside a (public) page does NOT produce a 404: that layout calls
  // headers(), which forces a dynamic streaming render, and the status is
  // committed before the child throws. So every nonexistent /blog/x answered
  // HTTP 200 with a "Blog Post Not Found" body (project_sitewide_soft_404).
  // Two page-level fixes were tried and reverted before — permanentRedirect()
  // in the component and a (public)/not-found.tsx boundary — because neither
  // runs before the status is committed. Middleware does, which is why the
  // next.config redirects for retired slugs work and the in-page ones did not.
  //
  // Scoped to /blog/ deliberately: /nano-template/*, /topics/* and /tools/*
  // already 404 correctly (they live in (static), which has no path-derived
  // canonical), so widening this would add edge work for no gain. The slug set
  // is generated — see scripts/build_blog_slugs.cjs for why it is not
  // blogs.json.
  {
    const seg = url.pathname.split("/").filter(Boolean);
    const rest = (routing.locales as readonly string[]).includes(seg[0])
      ? seg.slice(1)
      : seg;
    // Only a bare /blog/<slug>. The blog index (/blog) and any deeper path are
    // left to the app.
    if (rest.length === 2 && rest[0] === "blog") {
      let slug = rest[1];
      try {
        slug = decodeURIComponent(slug);
      } catch {
        // Malformed percent-encoding — treat the raw segment as the slug.
      }
      if (!BLOG_SLUGS.has(slug)) {
        // Rewrite rather than a bare body so the user still gets the styled
        // 404 page, but with a real 404 status that Google can act on.
        return NextResponse.rewrite(new URL("/not-found", req.url), {
          status: 404,
          headers: { "x-robots-tag": "noindex, nofollow" },
        });
      }
    }
  }

  // 0d) Collapse the /nano-template/template-<slug> duplicate.
  //
  // toSlug() strips the leading `template-` from a template id, so the
  // canonical path is /nano-template/<slug>. The route ALSO resolves the
  // prefixed form and then emits a self-referential canonical for it, so the
  // duplicate never consolidates — it is a second indexable copy of every
  // template page and of its /example/ and /carousel/ children. Not in any
  // sitemap, but Google found 11 of them anyway (36 impressions in the 28 days
  // to 2026-08-31, incl. /en/nano-template/template-solar-term at position
  // 12.6 and a /zh/ example at position 1.0).
  //
  // Safe as an unconditional redirect: no real slug starts with `template-`
  // (checked against all 352 ids — toSlug would have had to strip a doubled
  // prefix). Everything after the slug segment is preserved.
  {
    const seg = url.pathname.split("/").filter(Boolean);
    const hasLocale = (routing.locales as readonly string[]).includes(seg[0]);
    const rest = hasLocale ? seg.slice(1) : seg;
    if (rest[0] === "nano-template" && rest[1]?.startsWith("template-")) {
      const fixed = [...rest];
      fixed[1] = fixed[1].replace(/^template-/, "");
      const redirectUrl = new URL(req.url);
      redirectUrl.pathname = `/${[...(hasLocale ? [seg[0]] : []), ...fixed].join("/")}`;
      return NextResponse.redirect(redirectUrl, { status: 308 });
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
