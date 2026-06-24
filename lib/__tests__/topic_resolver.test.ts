import { describe, it, expect } from 'vitest';
import {
  normalizeTopicList,
  buildTemplateTopicsMap,
  resolveTopics,
} from '../topic_resolver';

// ─── normalizeTopicList ───────────────────────────────────────────────────────

describe('normalizeTopicList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeTopicList(undefined)).toEqual([]);
    expect(normalizeTopicList(null)).toEqual([]);
    expect(normalizeTopicList('string')).toEqual([]);
    expect(normalizeTopicList(42)).toEqual([]);
    expect(normalizeTopicList({})).toEqual([]);
  });

  it('returns empty array for empty array input', () => {
    expect(normalizeTopicList([])).toEqual([]);
  });

  it('discards non-string values', () => {
    expect(normalizeTopicList([1, null, true, {}, 'valid'])).toEqual(['valid']);
  });

  it('trims whitespace', () => {
    expect(normalizeTopicList(['  animal  ', '\tscience\n'])).toEqual(['animal', 'science']);
  });

  it('discards empty strings after trim', () => {
    expect(normalizeTopicList(['', '   ', 'real'])).toEqual(['real']);
  });

  it('lowercases values', () => {
    expect(normalizeTopicList(['Science', 'ANIMAL', 'Info-Card'])).toEqual([
      'science',
      'animal',
      'info-card',
    ]);
  });

  it('deduplicates while preserving first-occurrence order', () => {
    expect(normalizeTopicList(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('preserves valid hyphenated slugs', () => {
    expect(normalizeTopicList(['step-by-step-tutorial', 'wall-art'])).toEqual([
      'step-by-step-tutorial',
      'wall-art',
    ]);
  });

  it('returns deterministic output for the same input', () => {
    const input = ['z', 'a', 'b', 'a'];
    expect(normalizeTopicList(input)).toEqual(normalizeTopicList(input));
  });
});

// ─── buildTemplateTopicsMap ───────────────────────────────────────────────────

describe('buildTemplateTopicsMap', () => {
  it('builds a map from template id to normalized topics', () => {
    const templates = [
      { id: 'tpl-a', topics: ['learning', 'science'] },
      { id: 'tpl-b', topics: ['art-prints', 'wall-art'] },
    ];
    const map = buildTemplateTopicsMap(templates);
    expect(map.get('tpl-a')).toEqual(['learning', 'science']);
    expect(map.get('tpl-b')).toEqual(['art-prints', 'wall-art']);
  });

  it('ignores records with missing or non-string id', () => {
    const templates = [
      { id: 123, topics: ['learning'] },
      { id: null, topics: ['science'] },
      { id: '', topics: ['infographic'] },
      { id: 'valid', topics: ['anatomy'] },
    ] as any[];
    const map = buildTemplateTopicsMap(templates);
    expect(map.size).toBe(1);
    expect(map.get('valid')).toEqual(['anatomy']);
  });

  it('handles missing topics safely', () => {
    const templates = [{ id: 'tpl-a' }];
    const map = buildTemplateTopicsMap(templates);
    expect(map.get('tpl-a')).toEqual([]);
  });

  it('normalizes template topics (lowercase, dedup)', () => {
    const templates = [{ id: 'tpl-a', topics: ['Science', 'science', 'SCIENCE'] }];
    const map = buildTemplateTopicsMap(templates);
    expect(map.get('tpl-a')).toEqual(['science']);
  });
});

// ─── resolveTopics ────────────────────────────────────────────────────────────

describe('resolveTopics', () => {
  const templateMap = new Map([
    ['tpl-animal', ['animal', 'infographic', 'wall-art']],
    ['tpl-science', ['science', 'learning']],
  ]);

  it('merges inspiration and template topics without duplicates', () => {
    const result = resolveTopics(
      { id: 'insp-1', template_id: 'tpl-animal', topics: ['nature', 'infographic'] },
      templateMap
    );
    expect(result.inspirationTopics).toEqual(['nature', 'infographic']);
    expect(result.templateTopics).toEqual(['animal', 'infographic', 'wall-art']);
    // infographic appears in both; must appear once in mergedTopics
    expect(result.mergedTopics).toEqual(['nature', 'infographic', 'animal', 'wall-art']);
  });

  it('returns only inspiration topics when template_id is missing', () => {
    const result = resolveTopics(
      { id: 'insp-2', topics: ['nature'] },
      templateMap
    );
    expect(result.inspirationTopics).toEqual(['nature']);
    expect(result.templateTopics).toEqual([]);
    expect(result.mergedTopics).toEqual(['nature']);
  });

  it('handles unknown template_id without throwing', () => {
    const result = resolveTopics(
      { id: 'insp-3', template_id: 'tpl-nonexistent', topics: ['nature'] },
      templateMap
    );
    expect(result.inspirationTopics).toEqual(['nature']);
    expect(result.templateTopics).toEqual([]);
    expect(result.mergedTopics).toEqual(['nature']);
  });

  it('handles missing inspiration topics without throwing', () => {
    const result = resolveTopics(
      { id: 'insp-4', template_id: 'tpl-science' },
      templateMap
    );
    expect(result.inspirationTopics).toEqual([]);
    expect(result.templateTopics).toEqual(['science', 'learning']);
    expect(result.mergedTopics).toEqual(['science', 'learning']);
  });

  it('handles empty template map without throwing', () => {
    const result = resolveTopics(
      { id: 'insp-5', template_id: 'tpl-animal', topics: ['nature'] },
      new Map()
    );
    expect(result.inspirationTopics).toEqual(['nature']);
    expect(result.templateTopics).toEqual([]);
    expect(result.mergedTopics).toEqual(['nature']);
  });

  it('normalizes inspiration topics before merging', () => {
    const result = resolveTopics(
      { id: 'insp-6', template_id: 'tpl-science', topics: ['Nature', '  SCIENCE  '] },
      templateMap
    );
    // 'science' is normalized from both inspiration and template; must appear once
    expect(result.inspirationTopics).toEqual(['nature', 'science']);
    expect(result.mergedTopics).toContain('nature');
    expect(result.mergedTopics).toContain('science');
    expect(result.mergedTopics.filter((t) => t === 'science')).toHaveLength(1);
  });

  it('does not include tags or search_aliases in topics', () => {
    const insp = {
      id: 'insp-7',
      template_id: 'tpl-science',
      topics: ['nature'],
      tags: ['animal', 'cute'],
      search_aliases: ['chinese-animal'],
    };
    const result = resolveTopics(insp as any, templateMap);
    expect(result.inspirationTopics).toEqual(['nature']);
    expect(result.mergedTopics).not.toContain('cute');
    expect(result.mergedTopics).not.toContain('chinese-animal');
  });
});
