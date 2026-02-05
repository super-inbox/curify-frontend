import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BilingualSubtitlesClient from "./BilingualSubtitlesClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bilingualSubtitles.metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/bilingual-subtitles`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-bilingual-subtitles.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default function BilingualSubtitlesPage() {
  return <BilingualSubtitlesClient />;
}