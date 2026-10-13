import { describe, expect, it } from 'vitest';
import { GET } from '../../app/sitemap-blogs.xml/route';

describe('blog sitemap authored locales', () => {
  it('only emits the English engineering article while preserving existing translated blogs', async () => {
    const xml = await (await GET()).text();
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
    const article = entries.filter(entry => /<loc>[^<]*\/building-asl-video-translator<\/loc>/.test(entry));
    expect(article).toHaveLength(1);
    expect(article[0]).toContain('<loc>https://www.curify-ai.com/blog/building-asl-video-translator</loc>');
    expect(article[0]).toContain('hreflang="en"');
    expect(article[0]).toContain('hreflang="x-default"');
    expect(article[0]).not.toContain('hreflang="zh"');
    expect(entries.filter(entry => /<loc>[^<]*\/asl-video-translator<\/loc>/.test(entry))).toHaveLength(10);
  });
});
