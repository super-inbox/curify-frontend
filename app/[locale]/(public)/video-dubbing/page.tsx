import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VideoDubbingClient from "./VideoDubbingClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";

import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videoDubbing.metadata" });

  const title = t("title");
  const description = t("description");
  const canonicalUrl = getCanonicalUrl(locale, "/video-dubbing");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguagesMap("/video-dubbing"),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-video-dubbing.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default function VideoDubbingPage() {
  return <VideoDubbingClient />;
}