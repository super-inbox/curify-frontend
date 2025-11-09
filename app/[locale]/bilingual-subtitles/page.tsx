import type { Metadata } from "next";
import BilingualSubtitlesClient from "./BilingualSubtitlesClient";

const siteUrl = process.env.SITE_URL || "https://curify-ai.com";

// Define the static English metadata
const meta = {
  title: "Free Bilingual Subtitles Generator | Curify AI",
  description:
    "Create bilingual subtitles for your videos with Curify’s free AI-powered tool. Perfect for YouTube, TikTok, education, and global creators.",
};

/**
 * Generates static metadata for the page.
 * This function no longer needs to be async or take params.
 */
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${siteUrl}/bilingual-subtitles`, // Hardcoded URL without locale
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-bilingual-subtitles.png`,
        width: 1200,
        height: 630,
        alt: "Curify Bilingual Subtitles",
      },
    ],
  },
};

export default function BilingualSubtitlesPage() {
  return <BilingualSubtitlesClient />;
}