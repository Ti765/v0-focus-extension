import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',        // DOM virtual para componentes React
    setupFiles: ['tests/setup.ts'],
    globals: true,
    reporters: ['default'],       // use "verbose" via CLI quando quiser
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    // aumenta timeout se precisar inspecionar logs demorados:
    // testTimeout: 10000,
  },
});
