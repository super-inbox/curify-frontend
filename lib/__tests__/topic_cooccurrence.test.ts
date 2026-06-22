import { describe, it, expect } from 'vitest';
import { calculateTopicCooccurrence } from '../topic_cooccurrence';
import { buildTemplateTopicsMap } from '../topic_resolver';

// Shared small fixture
const templateMap = buildTemplateTopicsMap([
  { id: 'tpl-a', topics: ['infographic', 'learning', 'wall-art', 'art-prints'] },
  { id: 'tpl-b', topics: ['science', 'flashcards'] },
  { id: 'tpl-c', topics: ['illustration'] },
]);

// ─── limit behaviour ─────────────────────────────────────────────────────────

describe('calculateTopicCooccurrence – limit', () => {
  it('only analyzes the first 20 results by default', () => {
    const inspirations = Array.from({ length: 30 }, (_, i) => ({
      id: `insp-${i}`,
      template_id: 'tpl-b',
      topics: [],
    }));
    const result = calculateTopicCooccurrence(inspirations, templateMap);
    expect(result.analyzedResultCount).toBe(20);
    // science appears in tpl-b; count must be 20 (not 30)
    const scienceEntry = result.templateTopicCounts.find((c) => c.slug === 'science');
    expect(scienceEntry?.count).toBe(20);
  });

  it('respects an explicit limit smaller than 20', () => {
    const inspirations = Array.from({ length: 10 }, (_, i) => ({
      id: `insp-${i}`,
      template_id: 'tpl-b',
      topics: [],
    }));
    const result = calculateTopicCooccurrence(inspirations, templateMap, 5);
    expect(result.analyzedResultCount).toBe(5);
  });

  it('analyzes fewer than limit when the array is short', () => {
    const result = calculateTopicCooccurrence(
      [{ id: 'insp-0', template_id: 'tpl-b', topics: [] }],
      templateMap
    );
    expect(result.analyzedResultCount).toBe(1);
  });
});

// ─── source-specific counts ──────────────────────────────────────────────────

describe('calculateTopicCooccurrence – source counts', () => {
  it('inspiration and template source counts remain separate', () => {
    const inspirations = [
      { id: 'insp-1', template_id: 'tpl-b', topics: ['animal'] },
    ];
    const result = calculateTopicCooccurrence(inspirations, templateMap);

    const inspAnimal = result.inspirationTopicCounts.find((c) => c.slug === 'animal');
    expect(inspAnimal?.count).toBe(1);

    const tplScience = result.templateTopicCounts.find((c) => c.slug === 'science');
    expect(tplScience?.count).toBe(1);

    // animal should NOT appear in template counts for tpl-b
    expect(result.templateTopicCounts.find((c) => c.slug === 'animal')).toBeUndefined();
    // science should NOT appear in inspiration counts
    expect(result.inspirationTopicCounts.find((c) => c.slug === 'science')).toBeUndefined();
  });
});

// ─── merged counts & deduplication ───────────────────────────────────────────

describe('calculateTopicCooccurrence – merged counts', () => {
  it('a topic present in both inspiration and template counts once in merged', () => {
    // infographic is in tpl-a AND in inspiration topics
    const inspirations = [
      { id: 'insp-1', template_id: 'tpl-a', topics: ['infographic', 'animal'] },
    ];
    const result = calculateTopicCooccurrence(inspirations, templateMap);

    const mergedInfographic = result.mergedTopicCounts.find((c) => c.slug === 'infographic');
    expect(mergedInfographic?.count).toBe(1); // NOT 2

    const inspInfographic = result.inspirationTopicCounts.find((c) => c.slug === 'infographic');
    expect(inspInfographic?.count).toBe(1);

    const tplInfographic = result.templateTopicCounts.find((c) => c.slug === 'infographic');
    expect(tplInfographic?.count).toBe(1);
  });

  it('accumulates merged counts across multiple results', () => {
    const inspirations = [
      { id: 'insp-1', template_id: 'tpl-b', topics: ['animal'] },
      { id: 'insp-2', template_id: 'tpl-b', topics: ['animal'] },
      { id: 'insp-3', template_id: 'tpl-b', topics: ['plant'] },
    ];
    const result = calculateTopicCooccurrence(inspirations, templateMap);

    const animal = result.inspirationTopicCounts.find((c) => c.slug === 'animal');
    expect(animal?.count).toBe(2);

    const plant = result.inspirationTopicCounts.find((c) => c.slug === 'plant');
    expect(plant?.count).toBe(1);

    // science (from tpl-b) appears in all 3 results
    const science = result.mergedTopicCounts.find((c) => c.slug === 'science');
    expect(science?.count).toBe(3);
  });
});

// ─── resultIds ───────────────────────────────────────────────────────────────

describe('calculateTopicCooccurrence – resultIds', () => {
  it('resultIds contains the IDs of contributing results', () => {
    const inspirations = [
      { id: 'insp-A', template_id: 'tpl-b', topics: ['animal'] },
      { id: 'insp-B', template_id: 'tpl-b', topics: [] },
    ];
    const result = calculateTopicCooccurrence(inspirations, templateMap);

    const animalEntry = result.inspirationTopicCounts.find((c) => c.slug === 'animal');
    expect(animalEntry?.resultIds).toEqual(['insp-A']);

    // science (from tpl-b) should show both IDs
    const scienceEntry = result.mergedTopicCounts.find((c) => c.slug === 'science');
    expect(scienceEntry?.resultIds).toContain('insp-A');
    expect(scienceEntry?.resultIds).toContain('insp-B');
  });

  it('tpl-a: art-prints and wall-art both get the same resultId', () => {
    // tpl-a has both art-prints and wall-art — verify each gets the same result ID
    const inspirations = [{ id: 'insp-X', template_id: 'tpl-a', topics: [] }];
    const result = calculateTopicCooccurrence(inspirations, templateMap);

    const artPrints = result.mergedTopicCounts.find((c) => c.slug === 'art-prints');
    const wallArt = result.mergedTopicCounts.find((c) => c.slug === 'wall-art');
    expect(artPrints?.resultIds).toEqual(['insp-X']);
    expect(wallArt?.resultIds).toEqual(['insp-X']);
    // Both show count=1 (correct — one result contributed each)
    expect(artPrints?.count).toBe(1);
    expect(wallArt?.count).toBe(1);
  });
});

// ─── deterministic sorting ────────────────────────────────────────────────────

describe('calculateTopicCooccurrence – sorting', () => {
  it('higher count first', () => {
    const inspirations = [
      { id: 'insp-1', template_id: undefined, topics: ['b'] },
      { id: 'insp-2', template_id: undefined, topics: ['a'] },
      { id: 'insp-3', template_id: undefined, topics: ['a'] },
    ];
    const result = calculateTopicCooccurrence(inspirations, new Map());
    const slugs = result.inspirationTopicCounts.map((c) => c.slug);
    expect(slugs[0]).toBe('a'); // count=2 before count=1
    expect(slugs[1]).toBe('b');
  });

  it('equal counts are sorted deterministically by slug ascending', () => {
    const inspirations = [
      { id: 'insp-1', template_id: undefined, topics: ['zebra', 'apple'] },
    ];
    const result = calculateTopicCooccurrence(inspirations, new Map());
    const slugs = result.inspirationTopicCounts.map((c) => c.slug);
    expect(slugs).toEqual(['apple', 'zebra']); // both count=1, alphabetical
  });
});
