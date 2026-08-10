import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { BLOG_ROUTE_ARTICLE_NAMESPACES } from "../blog-client-namespaces.generated";

/**
 * Guards the 2026-08-10 fix: a blog post with its own route folder bypasses
 * [slug]/page.tsx generateMetadata, and without metadata of its own it inherits
 * the (public) layout default — shipping the BLOG-INDEX title as the <title> of
 * a specific article. That was live on 10 posts, including
 * /blog/best-programmatic-seo-tools (KD 10, $8.98 CPC, stuck at position 24).
 *
 * A new dedicated route is easy to add and easy to forget, so assert the
 * invariant structurally rather than trusting review.
 */
const BLOG_DIR = path.join(process.cwd(), "app/[locale]/(public)/blog");

function dedicatedRoutes(): string[] {
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "[slug]" && !e.name.startsWith("_"))
    .filter((e) => fs.existsSync(path.join(BLOG_DIR, e.name, "page.tsx")))
    .map((e) => e.name);
}

function metadataSourceFor(slug: string): string {
  return ["layout.tsx", "page.tsx"]
    .map((f) => path.join(BLOG_DIR, slug, f))
    .filter((p) => fs.existsSync(p))
    .map((p) => fs.readFileSync(p, "utf8"))
    .join("\n");
}

describe("dedicated blog routes carry their own metadata", () => {
  const routes = dedicatedRoutes();

  it("finds the dedicated routes at all (guards a bad glob)", () => {
    expect(routes.length).toBeGreaterThan(5);
  });

  it("every dedicated route exports metadata or generateMetadata", () => {
    const missing = routes.filter((slug) => {
      const src = metadataSourceFor(slug);
      return !/export\s+(const\s+metadata|async\s+function\s+generateMetadata|const\s+generateMetadata)/.test(src);
    });
    expect(
      missing,
      `these routes would ship the blog-index title:\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  it("routes using the shared helper resolve to a real i18n namespace", () => {
    const en = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "messages/en/blog.json"), "utf8")
    );
    for (const slug of routes) {
      const src = metadataSourceFor(slug);
      if (!src.includes("dedicatedBlogMetadata")) continue;
      const ns = BLOG_ROUTE_ARTICLE_NAMESPACES[slug]?.[0];
      expect(ns, `${slug} has no mapped namespace — regenerate the map`).toBeTruthy();
      const [head, child] = ns!.split(".");
      const node = child ? (en[head] ?? {})[child] : en[head];
      expect(node?.title, `${ns} is missing a title key`).toBeTruthy();
    }
  });

  it("passes its own slug to the helper (a copy-paste swap would mis-canonical)", () => {
    for (const slug of routes) {
      const src = metadataSourceFor(slug);
      const m = src.match(/dedicatedBlogMetadata\(\s*"([^"]+)"/);
      if (!m) continue;
      expect(m[1], `${slug}/layout.tsx declares slug "${m[1]}"`).toBe(slug);
    }
  });
});
