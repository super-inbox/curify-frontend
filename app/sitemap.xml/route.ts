import { NextResponse } from "next/server";
import blogs from "@/content/blogs.json"; // <--- ADD THIS FILE

const BASE_URL = "https://curify-ai.com";

// All languages you support
const LOCALES = ["en", "zh", "es", "de", "fr", "ja", "ko", "hi", "ru"];

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
];

// Blog routes come from blogs.json
function getBlogRoutes() {
  return blogs.map((slug: string) => `/blog/${slug}`);
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
function generateUrlEntry(route: string) {
  const loc = `${BASE_URL}/en${route}`; // canonical = English
  const lastmod = new Date().toISOString();
  const priority = route === "" ? "1.0" : "0.8";

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
      ${generateHreflangLinks(route)}
    </url>
  `;
}

export async function GET() {
  const blogRoutes = getBlogRoutes();

  let urls = "";

  // Add static routes
  STATIC_ROUTES.forEach((route) => {
    urls += generateUrlEntry(route);
  });

  // Add blog routes
  blogRoutes.forEach((route) => {
    urls += generateUrlEntry(route);
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
    },
  });
}
