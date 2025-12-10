import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_URL = "https://curify-ai.com";

const LOCALES = ["en", "zh", "es", "de", "fr", "ja", "ko", "hi", "ru"];

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

// Detect blog slugs from ANY locale (first existing folder)
function getBlogSlugs(): string[] {
  for (const locale of LOCALES) {
    const blogDir = path.join(process.cwd(), "app", locale, "blog");

    if (fs.existsSync(blogDir)) {
      return fs
        .readdirSync(blogDir)
        .filter((name) => {
          const full = path.join(blogDir, name);
          return (
            fs.statSync(full).isDirectory() &&
            (fs.existsSync(path.join(full, "page.tsx")) ||
              fs.existsSync(path.join(full, "page.jsx")))
          );
        })
        .map((slug) => `/blog/${slug}`);
    }
  }

  return [];
}

function generateHreflangLinks(route: string) {
  const links = LOCALES.map(
    (lng) =>
      `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}/${lng}${route}" />`
  ).join("");

  return (
    links +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${route}" />`
  );
}

function generateUrlEntry(route: string) {
  const loc = `${BASE_URL}/en${route}`; // canonical EN version
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
  const blogRoutes = getBlogSlugs();

  let urls = "";

  // Static routes
  STATIC_ROUTES.forEach((route) => {
    urls += generateUrlEntry(route);
  });

  // Blog routes
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
    </urlset>
  `.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
