import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VideoDubbingClient from "./VideoDubbingClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videoDubbing.metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/video-dubbing`,
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