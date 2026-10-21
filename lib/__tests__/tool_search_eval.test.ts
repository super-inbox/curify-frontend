import { describe, expect, it } from 'vitest';
import evalSet from '@/scripts/configs/tool_search_eval_set.json';
import { TOOL_REGISTRY } from '@/lib/tools-registry';
import { TOOL_SUGGESTIONS, resolveToolDestination, filterSuggestions } from '@/lib/searchIndex';

describe('tool navigation evaluation', () => {
  for (const row of evalSet.cases) {
    it(`${row.locale}: ${row.query} → ${row.expected ?? 'content/topic'}`, () => {
      expect(resolveToolDestination(row.query, row.locale)).toBe(row.expected);
      if (row.expected) {
        const slug = row.expected.split('/').pop();
        expect(filterSuggestions(row.query, 8).some(s => s.slug === slug)).toBe(true);
      }
    });
  }
  it('covers every registered tool without stale or duplicate tool links', () => {
    const entries = TOOL_SUGGESTIONS.filter(s => s.slug !== 'tools');
    expect(new Set(entries.map(s => s.slug)).size).toBe(entries.length);
    expect(entries.map(s => s.slug).sort()).toEqual(TOOL_REGISTRY.map(t => t.slug).sort());
    for (const tool of TOOL_REGISTRY) {
      expect(evalSet.cases.some(c => c.expected?.endsWith(`/tools/${tool.slug}`)), tool.slug).toBe(true);
    }
  });
});
