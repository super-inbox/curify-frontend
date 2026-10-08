import { describe, it, expect } from 'vitest';
import nanoTemplates from '@/public/data/nano_templates.json';
import nanoImages from '@/public/data/nano_inspiration.json';
import recentTemplates from '@/public/data/recent_templates.json';
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
} from '../nano_utils';
import { buildNanoFeedCards } from '../nano_page_data';
import {
  getUseCaseTemplateOrder,
  interleaveRoundRobin,
  USE_CASE_CURATED_TEMPLATES,
  USE_CASE_IP_DENYLIST,
} from '../use_case_curation';

const reg = buildNanoRegistry(
  nanoTemplates as unknown as RawTemplate[],
  nanoImages as unknown as RawNanoImageRecord[]
);
const byId = new Map(reg.templates.map((t) => [t.id, t] as const));
const order = (slug: string) =>
  getUseCaseTemplateOrder(slug, reg, recentTemplates) ?? [];

const SLUGS = [
  'for-photographers',
  'for-programmatic-seo',
  'for-merch-operators',
  'for-marketers',
  'for-publishers',
  'for-dtc-brands',
];

/** Template id per grid tile, mirroring the use-case page's wiring. */
function tileTemplateIds(slug: string): string[] {
  const cards = buildNanoFeedCards(reg, 'en', {
    perTemplateMaxImages: 4,
    strictLocale: false,
    templateIds: order(slug),
  });
  return interleaveRoundRobin(
    cards.map((c) => (c.example_ids ?? []).map(() => c.template_id))
  );
}

// First screen of the grid is ~18 tiles.
const FIRST_SCREEN = 18;

describe('interleaveRoundRobin', () => {
  it('takes one item per group per round, preserving group order', () => {
    expect(interleaveRoundRobin([['a1', 'a2', 'a3'], ['b1'], ['c1', 'c2']])).toEqual([
      'a1', 'b1', 'c1', 'a2', 'c2', 'a3',
    ]);
  });
});

describe('getUseCaseTemplateOrder', () => {
  it('returns null for slugs it does not curate', () => {
    expect(getUseCaseTemplateOrder('for-parents', reg, recentTemplates)).toBeNull();
  });

  it.each(['for-photographers', 'for-programmatic-seo'])(
    '%s is non-empty and led by the curated picks',
    (slug) => {
      const ids = order(slug);
      expect(ids.length).toBeGreaterThanOrEqual(12);
      expect(ids.slice(0, 3)).toEqual(USE_CASE_CURATED_TEMPLATES[slug].slice(0, 3));
    }
  );

  it('every curated id exists and has images', () => {
    for (const ids of Object.values(USE_CASE_CURATED_TEMPLATES)) {
      for (const id of ids) {
        expect(byId.has(id), id).toBe(true);
        expect(reg.imagesByTemplateId.get(id)?.length ?? 0, id).toBeGreaterThan(0);
      }
    }
  });

  it('for-photographers drops the character/merch selfie templates', () => {
    const ids = order('for-photographers');
    expect(ids).not.toContain('template-ip-character-expression-sheet');
    expect(ids).not.toContain('template-ip-creative-cultural-goods-mockup-set');
  });

  it('for-publishers excludes the ASL tutorial', () => {
    expect(order('for-publishers')).not.toContain('template-asl-sign-language-tutorial-infographic');
  });

  it.each(['for-dtc-brands', 'for-marketers'])(
    '%s excludes the WC knockout poster (topic-fallback only)',
    (slug) => {
      expect(order(slug).some((id) => id.startsWith('template-wc-knockout'))).toBe(false);
    }
  );

  it.each(SLUGS)('%s never includes IP-denylisted templates', (slug) => {
    expect(order(slug).filter((id) => USE_CASE_IP_DENYLIST.has(id))).toEqual([]);
  });
});

describe('use-case grid tiles', () => {
  it.each(SLUGS)('%s: adjacent first-screen tiles are different templates', (slug) => {
    const head = tileTemplateIds(slug).slice(0, FIRST_SCREEN);
    expect(head.length).toBe(FIRST_SCREEN);
    for (let i = 1; i < head.length; i++) {
      expect(head[i], `tile ${i}`).not.toBe(head[i - 1]);
    }
  });

  it.each(SLUGS)('%s: shows up to 4 examples per template (all when fewer)', (slug) => {
    const counts = new Map<string, number>();
    for (const id of tileTemplateIds(slug)) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const [id, n] of counts) {
      const available = reg.imagesByTemplateId.get(id)?.length ?? 0;
      expect(n, id).toBe(Math.min(4, available));
    }
  });
});
