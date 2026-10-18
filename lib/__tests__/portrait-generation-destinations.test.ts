import { describe, expect, it } from 'vitest';
import templates from '../../public/data/nano_templates.json';
import messages from '../../messages/en/home.json';
import { TOOL_REGISTRY } from '../tools-registry';
import { GENERATION_DESTINATIONS } from '../generation-destinations';

describe('portrait generation destination contracts', () => {
  for (const [templateId, path] of Object.entries(GENERATION_DESTINATIONS)) {
    it(`${templateId} has a usable upload prompt and one owning tool`, () => {
      const owners = TOOL_REGISTRY.filter(t => t.action?.type === 'generate' && t.action.templateId === templateId);
      expect(owners).toHaveLength(1);
      expect(`/tools/${owners[0].slug}`).toBe(path);
      const template = templates.find(t => t.id === templateId)!;
      expect(template.requires_image_upload).toBe(true);
      expect(template.allow_generation).toBe(true);
      const en = template.locales.en!;
      const params = en.parameters as Array<{name: string; placeholder?: string; default?: string; options?: string[]}>;
      for (const match of en.base_prompt.matchAll(/\{(\w+)\}/g)) {
        const parameter = params.find(p => p.name === match[1]);
        expect(parameter?.default).toBeTruthy();
        if (parameter?.options) expect(parameter.options).toContain(parameter.default);
      }
      const copy = (messages as Record<string, any>)[owners[0].namespace];
      expect(copy.upload.label).not.toMatch(/product/i);
      expect(copy.why.point3).toContain('{credits}');
      expect(copy.example).toContain('not customer images or verified outputs');
    });
  }
});
