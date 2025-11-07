import type { Metadata } from "next";
import BilingualSubtitlesClient from "./BilingualSubtitlesClient";

// ✅ Define SEO metadata here (server-side)
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const metaByLocale: Record<string, { title: string; description: string }> = {
    en: {
      title: "Free Bilingual Subtitles Generator | Curify AI",
      description:
        "Create bilingual subtitles for your videos with Curify’s free AI-powered tool. Perfect for YouTube, TikTok, education, and global creators.",
    },
    es: {
      title: "Generador Gratuito de Subtítulos Bilingües | Curify AI",
      description:
        "Crea subtítulos bilingües para tus videos con la herramienta gratuita de Curify impulsada por IA. Ideal para YouTube, TikTok, educación y creadores globales.",
    },
    de: {
      title: "Kostenloser Generator für Zweisprachige Untertitel | Curify AI",
      description:
        "Erstelle zweisprachige Untertitel für deine Videos mit Curifys kostenlosem KI‑Tool. Perfekt für YouTube, TikTok, Bildung und internationale Creators.",
    },
    zh: {
      title: "免费双语字幕生成器 | Curify AI",
      description:
        "使用 Curify 的免费 AI 字幕工具，为视频自动生成双语字幕。非常适合 YouTube、TikTok、教育和全球创作者。",
    },
  };

  const meta = metaByLocale[params.locale] || metaByLocale.en;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://curify-ai.com/${params.locale}/bilingual-subtitles`,
      type: "website",
      images: [
        {
          url: "https://curify-ai.com/og-bilingual-subtitles.png",
          width: 1200,
          height: 630,
          alt: "Curify Bilingual Subtitles",
        },
      ],
    },
  };
}

export default function BilingualSubtitlesPage() {
  return <BilingualSubtitlesClient />;
}
