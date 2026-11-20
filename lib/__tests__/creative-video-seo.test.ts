import { describe, it, expect } from 'vitest';
import { creativeVideoMetadata, CREATIVE_VIDEO_PAGES } from '../creative-video-seo';

describe('creative video index eligibility', () => {
  for (const mode of ['motion', 'souvenir'] as const) {
    for (const locale of ['en', 'zh', 'ja']) {
      it(`${mode}/${locale} keeps authored and fallback URLs separate`, () => {
        const metadata = creativeVideoMetadata(mode, locale);
        const route = CREATIVE_VIDEO_PAGES[mode].route;
        const canonical = `https://www.curify-ai.com${locale === 'zh' ? '/zh' : ''}${route}`;
        expect(metadata.robots).toEqual({ index: locale !== 'ja', follow: true });
        expect(metadata.alternates?.canonical).toBe(canonical);
        expect(metadata.description).toBeTruthy();
        expect(metadata.openGraph?.url).toBe(canonical);
        if (locale === 'ja') {
          expect(metadata.title).toBe(creativeVideoMetadata(mode, 'en').title);
          expect(metadata.alternates?.languages).toBeUndefined();
        } else {
          expect(metadata.alternates?.languages).toEqual({ en: `https://www.curify-ai.com${route}`, zh: `https://www.curify-ai.com/zh${route}`, 'x-default': `https://www.curify-ai.com${route}` });
        }
      });
    }
  }
});
