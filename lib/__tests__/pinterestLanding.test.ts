import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import published from '../pinterest-examples.json';
import { pinterestExampleRedirect } from '../pinterestLanding';

const slug = 'fashion-shape-guide-infographic';
const id = 'template-fashion-shape-guide-infographic-dresses-for-body-type';
const path = `/nano-template/${slug}`;
const query = `utm_source=pinterest&utm_content=${id}&utm_campaign=template-examples`;
const redirect = (pathAndQuery: string) => pinterestExampleRedirect(new URL(pathAndQuery, 'https://www.curify-ai.com'), ['en','zh','fr']);

describe('legacy Pinterest landing rescue', () => {
  it('only redirects to examples present in the bundled corpus', () => {
    const examples = JSON.parse(readFileSync(new URL('../../public/data/nano_inspiration.json', import.meta.url), 'utf8')) as {id:string;template_id:string}[];
    const corpus = new Map(examples.map(e => [e.id, e.template_id.replace(/^template-/, '')]));
    for (const [id, slug] of Object.entries(published)) expect(corpus.get(id), id).toBe(slug);
  });
  it('preserves the pinned example, locale and all campaign parameters', () => {
    const url = redirect(`/zh${path}?${query}`)!;
    expect(url.pathname).toBe(`/zh${path}/example/${id}`);
    expect(url.search).toBe(`?${query}`);
    expect(url.origin).toBe('https://www.curify-ai.com');
  });
  it('redirects unprefixed URLs without adding a locale', () => {
    expect(redirect(`${path}?${query}`)?.pathname).toBe(`${path}/example/${id}`);
  });
  it.each([
    `${path}/example/${id}?${query}`,
    `/nano-template/another-template?${query}`,
    `/topics/learning?${query}`,
    `${path}?utm_source=pinterest`,
    `${path}?utm_source=google&utm_content=${id}`,
    `${path}?utm_source=pinterest&utm_content=template-unknown`,
    `${path}?utm_source=pinterest&utm_content=__proto__`,
    `${path}?utm_source=pinterest&utm_content=https://evil.example/`,
  ])('does not guess, loop, or accept untrusted targets: %s', (url) => {
    expect(redirect(url)).toBeNull();
  });
});
