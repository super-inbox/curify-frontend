import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
export default defineConfig({
  root,
  resolve: { alias: { '@': root, 'server-only': `${root}/lib/__tests__/_stubs/server-only.ts` } },
  esbuild: { jsx: 'automatic' },
  test: { environment: 'node', include: ['lib/__tests__/tool_search_eval.test.ts', 'lib/__tests__/searchIndex_tool_intent.test.ts', 'lib/__tests__/search_quality_page.test.ts'], testTimeout: 20000 },
});
