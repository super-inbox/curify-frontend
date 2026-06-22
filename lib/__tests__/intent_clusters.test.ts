import { describe, it, expect } from 'vitest';
import {
  topIntentChips,
  topIntentChipsFromTopicCounts,
  OUTPUT_TYPE_SLUGS,
} from '../intent_clusters';
import { calculateTopicCooccurrence } from '../topic_cooccurrence';
import { buildTemplateTopicsMap } from '../topic_resolver';

// ─── topIntentChips (legacy — backward-compat) ──────────────────────────────

describe('topIntentChips', () => {
  it('counts output-type slugs from template topics', () => {
    const templates = [
      { topics: ['infographic', 'learning'] },
      { topics: ['infographic', 'science'] },
      { topics: ['illustration'] },
    ];
    const chips = topIntentChips(templates, { topN: 5, minCount: 2 });
    expect(chips.find((c) => c.slug === 'infographic')?.count).toBe(2);
    // illustration only appears once — below minCount=2
    expect(chips.find((c) => c.slug === 'illustration')).toBeUndefined();
  });

  it('synonym folding: art-prints collapses to wall-art', () => {
    const templates = [
      { topics: ['art-prints'] },
      { topics: ['wall-art'] },
      { topics: ['art-prints', 'wall-art'] }, // both on one template → counts once
    ];
    const chips = topIntentChips(templates, { topN: 5, minCount: 1 });
    expect(chips.find((c) => c.slug === 'art-prints')).toBeUndefined();
    const wallArt = chips.find((c) => c.slug === 'wall-art');
    // 3 templates, each contributes at most +1 to wall-art after fold/dedup
    expect(wallArt?.count).toBe(3);
  });

  it('respects minCount', () => {
    const templates = [
      { topics: ['infographic'] },
      { topics: ['illustration'] },
      { topics: ['illustration'] },
    ];
    const chips = topIntentChips(templates, { topN: 5, minCount: 2 });
    expect(chips.find((c) => c.slug === 'infographic')).toBeUndefined();
    expect(chips.find((c) => c.slug === 'illustration')?.count).toBe(2);
  });

  it('respects topN', () => {
    const templates = OUTPUT_TYPE_SLUGS.map((slug) => ({
      topics: [slug, slug, slug],
    }));
    const chips = topIntentChips(templates, { topN: 3, minCount: 1 });
    expect(chips.length).toBeLessThanOrEqual(3);
  });
});

// ─── topIntentChipsFromTopicCounts ──────────────────────────────────────────

describe('topIntentChipsFromTopicCounts', () => {
  it('inspiration-level output topics contribute to intent chips', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: ['learning'] }, // no output-type topics
    ]);
    const inspirations = [
      { id: 'insp-1', template_id: 'tpl-a', topics: ['infographic'] },
      { id: 'insp-2', template_id: 'tpl-a', topics: ['infographic'] },
    ];
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 2 });
    // infographic came ONLY from inspiration topics
    expect(chips.find((c) => c.slug === 'infographic')?.count).toBe(2);
  });

  it('template-level output topics contribute to intent chips', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: ['illustration'] },
    ]);
    const inspirations = [
      { id: 'insp-1', template_id: 'tpl-a', topics: [] },
      { id: 'insp-2', template_id: 'tpl-a', topics: [] },
    ];
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 2 });
    // illustration came ONLY from template topics
    expect(chips.find((c) => c.slug === 'illustration')?.count).toBe(2);
  });

  it('synonym folding: a result with both art-prints and wall-art counts once', () => {
    // tpl-poster has BOTH art-prints AND wall-art in its topics
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-poster', topics: ['art-prints', 'wall-art', 'infographic'] },
    ]);
    const inspirations = Array.from({ length: 5 }, (_, i) => ({
      id: `insp-${i}`,
      template_id: 'tpl-poster',
      topics: [] as string[],
    }));
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 1 });

    // art-prints must not appear as its own chip
    expect(chips.find((c) => c.slug === 'art-prints')).toBeUndefined();

    // wall-art count must be 5, not 10
    const wallArt = chips.find((c) => c.slug === 'wall-art');
    expect(wallArt?.count).toBe(5);
  });

  it('synonym folding works when synonyms span different results', () => {
    // result A has art-prints, result B has wall-art — after folding, count=2
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-prints', topics: ['art-prints'] },
      { id: 'tpl-wall', topics: ['wall-art'] },
    ]);
    const inspirations = [
      { id: 'insp-A', template_id: 'tpl-prints', topics: [] },
      { id: 'insp-B', template_id: 'tpl-wall', topics: [] },
    ];
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 1 });

    expect(chips.find((c) => c.slug === 'art-prints')).toBeUndefined();
    const wallArt = chips.find((c) => c.slug === 'wall-art');
    expect(wallArt?.count).toBe(2); // 2 distinct results
  });

  it('respects minCount', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: ['infographic'] },
    ]);
    const inspirations = [{ id: 'insp-1', template_id: 'tpl-a', topics: [] }];
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 2 });
    // only 1 result, below minCount=2
    expect(chips.find((c) => c.slug === 'infographic')).toBeUndefined();
  });

  it('respects topN', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: OUTPUT_TYPE_SLUGS as unknown as string[] },
    ]);
    const inspirations = Array.from({ length: 5 }, (_, i) => ({
      id: `insp-${i}`,
      template_id: 'tpl-a',
      topics: [] as string[],
    }));
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 3, minCount: 1 });
    expect(chips.length).toBeLessThanOrEqual(3);
  });

  it('equal counts are sorted deterministically by slug ascending', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: ['infographic', 'illustration'] },
    ]);
    const inspirations = [{ id: 'insp-1', template_id: 'tpl-a', topics: [] }];
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 1 });

    // both count=1; illustration < infographic alphabetically
    const slugs = chips.map((c) => c.slug);
    const illIdx = slugs.indexOf('illustration');
    const infoIdx = slugs.indexOf('infographic');
    expect(illIdx).toBeLessThan(infoIdx);
  });

  it('filters out slugs not in OUTPUT_TYPE_SLUGS vocabulary', () => {
    const templateMap = buildTemplateTopicsMap([
      { id: 'tpl-a', topics: ['infographic', 'nature', 'learning'] },
    ]);
    const inspirations = Array.from({ length: 3 }, (_, i) => ({
      id: `insp-${i}`,
      template_id: 'tpl-a',
      topics: [] as string[],
    }));
    const cooccurrence = calculateTopicCooccurrence(inspirations, templateMap);
    const chips = topIntentChipsFromTopicCounts(cooccurrence, { topN: 5, minCount: 1 });
    // nature and learning are not output-type slugs
    expect(chips.find((c) => c.slug === 'nature')).toBeUndefined();
    expect(chips.find((c) => c.slug === 'learning')).toBeUndefined();
    expect(chips.find((c) => c.slug === 'infographic')?.count).toBe(3);
  });
});
