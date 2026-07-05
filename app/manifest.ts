import type { MetadataRoute } from "next";

// PWA manifest — surfaces Curify as an installable web app on iOS/Android
// home screens + Chrome/Edge install prompts. Icons here mirror the
// filesystem icons Next.js auto-serves from app/{icon,apple-icon}.png.
// If the icons change, regenerate via scripts/gen_icons.py (mounts the
// 1024px master at public/curify_logo_1024.png).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Curify AI",
    short_name: "Curify",
    description:
      "AI-powered visual thinking platform — turn trends, ideas, and knowledge into shareable visual content.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFDFD",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
