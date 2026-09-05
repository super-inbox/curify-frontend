import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // See lib/__tests__/_stubs/server-only.ts.
      'server-only': fileURLToPath(
        new URL('./lib/__tests__/_stubs/server-only.ts', import.meta.url)
      ),
    },
  },
  test: {
    name: 'unit',
    environment: 'node',
    include: ['lib/__tests__/**/*.test.ts'],
  },
});
