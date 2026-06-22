import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'node',
    include: ['lib/__tests__/**/*.test.ts'],
  },
});
