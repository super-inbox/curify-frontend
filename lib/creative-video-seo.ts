import type { Metadata } from 'next';
import { getCanonicalUrl, getLanguagesMap } from './canonical';

export const CREATIVE_VIDEO_LOCALES = ['en', 'zh'] as const;
export const CREATIVE_VIDEO_INDEX_DATE = '2026-11-20T00:00:00.000Z';
export const CREATIVE_VIDEO_PAGES = {
  motion: {
    route: '/tools/photo-motion',
    image: '/task-examples/photo-motion.jpg',
    en: { title: 'AI Photo Animation & Camera Motion Video | Curify', description: 'Turn 1–4 photos into a video with AI-planned camera movement and music. See London and product demos, upload your photos, and create at 18 credits per photo.' },
    zh: { title: 'AI 照片动效与摄影运镜视频 | Curify', description: '上传 1–4 张照片，由 AI 分析画面、规划运镜并搭配音乐。查看伦敦与商品视频案例，每张照片约 6 秒、18 积分，制作你的摄影短片。' },
  },
  souvenir: {
    route: '/tools/travel-souvenir-video',
    image: '/business/kyoto-poster.jpg',
    en: { title: 'AI Travel Souvenir Video from Your Photo | Curify', description: 'Create a personal travel film from one portrait. Explore Kyoto, Bali, Dubai, Granada and Tengwang Pavilion demos. Destination videos cost 180 credits each.' },
    zh: { title: 'AI 文旅纪念视频：用你的照片制作旅行短片 | Curify', description: '上传一张肖像，选择京都、巴厘岛、迪拜、格拉纳达或滕王阁，制作约 23–30 秒的个人旅行纪念短片。五个目的地案例可预览，每条 180 积分。' },
  },
} as const;

export function creativeVideoMetadata(mode: keyof typeof CREATIVE_VIDEO_PAGES, locale: string): Metadata {
  const page = CREATIVE_VIDEO_PAGES[mode];
  const authored = locale === 'en' || locale === 'zh';
  const language = locale === 'zh' ? 'zh' : 'en';
  const { title, description } = page[language];
  const canonical = getCanonicalUrl(language, page.route);
  const images = [{ url: getCanonicalUrl('en', page.image), alt: title }];
  return {
    title, description,
    robots: { index: authored, follow: true },
    alternates: { canonical, ...(authored ? { languages: getLanguagesMap(page.route, CREATIVE_VIDEO_LOCALES) } : {}) },
    openGraph: { type: 'website', title, description, url: canonical, locale: language === 'zh' ? 'zh_CN' : 'en_US', images },
    twitter: { card: 'summary_large_image', title, description, images: images.map(image => image.url) },
  };
}
