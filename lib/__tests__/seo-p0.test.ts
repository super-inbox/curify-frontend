import { describe, expect, it } from 'vitest';
import { getLanguagesMap } from '../canonical';
import { withSearchAttribution } from '../search-attribution';

describe('authored locale canonicals', () => {
  it('only advertises EN and ZH real-estate translations', () => {
    const links = getLanguagesMap('/tools/real-estate-photo-editing', ['en', 'zh']);
    expect(Object.keys(links)).toEqual(['en', 'zh', 'x-default']);
    expect(links.en).toBe('https://www.curify-ai.com/tools/real-estate-photo-editing');
    expect(links.zh).toBe('https://www.curify-ai.com/zh/tools/real-estate-photo-editing');
    expect(links['x-default']).toBe(links.en);
  });
  it('uses an authored fallback when English is absent', () => {
    const links = getLanguagesMap('/tools/test', ['zh']);
    expect(links['x-default']).toBe(links.zh);
  });
});

describe('search arrival attribution', () => {
  it('preserves parameters and fragments, and encodes the original query', () => {
    const href = withSearchAttribution('/es/tools/asl-video-translator?mode=video#reproduce', 'ASL · a texto');
    const url = new URL(href, 'https://www.curify-ai.com');
    expect(url.pathname).toBe('/es/tools/asl-video-translator');
    expect(url.searchParams.get('mode')).toBe('video');
    expect(url.searchParams.get('from_search')).toBe('ASL · a texto');
    expect(url.hash).toBe('#reproduce');
  });
  it('replaces rather than duplicates a prior marker', () => {
    const href = withSearchAttribution('/topics/asl?from_search=old', 'new');
    expect(new URL(href, 'https://www.curify-ai.com').searchParams.getAll('from_search')).toEqual(['new']);
  });
});
