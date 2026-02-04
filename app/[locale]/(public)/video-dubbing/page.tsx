import type { Metadata } from "next";
import VideoDubbingClient from "./VideoDubbingClient";

const siteUrl = process.env.SITE_URL || "https://curify-ai.com";

const meta = {
  title: "AI Video Dubbing Tool | Curify AI",
  description:
    "Dub your videos into 170+ languages using AI voice cloning, emotion preservation, and lip sync. Try Curify's AI dubbing for free.",
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${siteUrl}/video-dubbing`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-video-dubbing.png`,
        width: 1200,
        height: 630,
        alt: "Curify AI Video Dubbing",
      },
    ],
  },
};

export default function VideoDubbingPage() {
  return <VideoDubbingClient />;
}