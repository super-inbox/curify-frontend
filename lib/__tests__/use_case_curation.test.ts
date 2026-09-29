import { describe, it, expect } from 'vitest';
import nanoTemplates from '@/public/data/nano_templates.json';
import nanoImages from '@/public/data/nano_inspiration.json';
import recentTemplates from '@/public/data/recent_templates.json';
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
} from '../nano_utils';
import {
  diversifyTemplates,
  getUseCaseTemplateOrder,
  templateGroupKey,
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

// First screen of the grid is ~18 tiles; with the round-robin interleave each
// of the first 18 tiles comes from a distinct template in this order. The
// diverse head is bounded by 2 x (distinct groups in the pool): for-publishers
// is mostly `language`, so its head is 16 long and deferred templates follow.
const DIVERSE_HEAD = 16;

describe('diversifyTemplates', () => {
  it('caps each group in the head and appends deferred items in order', () => {
    const items = ['a1', 'a2', 'a3', 'b1', 'a4', 'b2', 'b3', 'c1'];
    const out = diversifyTemplates(items, {
      maxPerGroup: 2,
      groupOf: (x) => x[0],
    });
    expect(out).toEqual(['a1', 'a2', 'b1', 'b2', 'c1', 'a3', 'a4', 'b3']);
  });
});

describe('getUseCaseTemplateOrder', () => {
  it('returns null for slugs it does not curate', () => {
    expect(getUseCaseTemplateOrder('for-parents', reg, recentTemplates)).toBeNull();
  });

  it.each(['for-photographers', 'for-programmatic-seo'])(
    '%s has a full first screen led by the curated picks',
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

  it.each(['for-dtc-brands', 'for-marketers'])(
    '%s excludes the WC knockout poster (topic-fallback only)',
    (slug) => {
      expect(order(slug).some((id) => id.startsWith('template-wc-knockout'))).toBe(false);
    }
  );

  it.each([
    'for-photographers',
    'for-programmatic-seo',
    'for-merch-operators',
    'for-marketers',
    'for-publishers',
    'for-dtc-brands',
  ])('%s never includes IP-denylisted templates', (slug) => {
    expect(order(slug).filter((id) => USE_CASE_IP_DENYLIST.has(id))).toEqual([]);
  });

  it.each(['for-marketers', 'for-publishers', 'for-dtc-brands'])(
    '%s keeps at most 2 per family / tier-1 group in the diverse head',
    (slug) => {
      const head = order(slug).slice(0, DIVERSE_HEAD);
      expect(head.length).toBe(DIVERSE_HEAD);
      const counts = new Map<string, number>();
      for (const id of head) {
        const key = templateGroupKey(byId.get(id)!);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      for (const [key, n] of counts) expect(n, key).toBeLessThanOrEqual(2);
    }
  );
});
