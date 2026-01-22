import { NextResponse } from "next/server";
import blogs from "@/content/blogs.json";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // required for fs

const BASE_URL = "https://curify-ai.com";

// All languages you support
const LOCALES = ["en", "zh", "es", "de", "fr", "ja", "ko", "hi", "ru", "tr"];

// Static pages (shared across locales)
const STATIC_ROUTES = [
  "",
  "/contact",
  "/pricing",
  "/about",
  "/video-dubbing",
  "/bilingual-subtitles",
  "/creator",
  "/lip-sync",
  "/privacy",
  "/agreement",
  "/blog",
  // (optional) add your list page if it exists:
  "/nano-banana-pro-prompts",
];

// Blog routes come from blogs.json
function getBlogRoutes() {
  return blogs.map((slug: string) => `/blog/${slug}`);
}

/**
 * Prompt routes come from public/data/nanobanana.json
 * Expected shape: { prompts: [{ id: number|string, date?: string|null, ...}] }
 */
function getPromptRoutes(): Array<{ route: string; lastmod?: string }> {
  try {
    const jsonPath = path.join(process.cwd(), "public", "data", "nanobanana.json");
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(fileContent);

    const prompts = Array.isArray(data?.prompts) ? data.prompts : [];
    return prompts
      .filter((p: any) => p && (typeof p.id === "number" || typeof p.id === "string"))
      .map((p: any) => {
        const id = String(p.id);
        // Use prompt.date if valid, else omit and fall back to "now"
        const lastmod =
          typeof p.date === "string" && !Number.isNaN(Date.parse(p.date))
            ? new Date(p.date).toISOString()
            : undefined;

        return {
          route: `/nano-banana-pro-prompts/${id}`,
          lastmod,
        };
      });
  } catch (e) {
    // Don’t break sitemap if JSON missing / parse fails
    console.error("Failed to load nanobanana prompts for sitemap:", e);
    return [];
  }
}

// Build hreflang block for a route
function generateHreflangLinks(route: string) {
  const alternates = LOCALES.map(
    (lng) =>
      `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}/${lng}${route}" />`
  ).join("");

  return (
    alternates +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${route}" />`
  );
}

// Build <url> entry for a route
function generateUrlEntry(route: string, opts?: { lastmod?: string; changefreq?: string; priority?: string }) {
  const loc = `${BASE_URL}/en${route}`; // canonical = English
  const lastmod = opts?.lastmod ?? new Date().toISOString();
  const changefreq = opts?.changefreq ?? "daily";
  const priority = opts?.priority ?? (route === "" ? "1.0" : "0.8");

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      ${generateHreflangLinks(route)}
    </url>
  `;
}

export async function GET() {
  const blogRoutes = getBlogRoutes();
  const promptRoutes = getPromptRoutes();

  let urls = "";

  // Add static routes
  STATIC_ROUTES.forEach((route) => {
    urls += generateUrlEntry(route, {
      changefreq: route === "" ? "daily" : "weekly",
      priority: route === "" ? "1.0" : "0.8",
    });
  });

  // Add blog routes
  blogRoutes.forEach((route) => {
    urls += generateUrlEntry(route, {
      changefreq: "weekly",
      priority: "0.7",
    });
  });

  // Add prompt detail routes (thousands OK)
  promptRoutes.forEach(({ route, lastmod }) => {
    urls += generateUrlEntry(route, {
      lastmod,
      changefreq: "monthly",
      priority: "0.6",
    });
  });

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls}
</urlset>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      // Optional: allow caching (tune if needed)
      "Cache-Control": "public, max-age=3600",
    },
  });
}
