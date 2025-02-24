import { resolve } from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import AutoImport from 'unplugin-auto-import/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const PROJECT_ROOT = resolve(__dirname);

export default defineConfig({
  plugins: [
    sveltekit(),
    svelteTesting(),
    tsconfigPaths(),
    AutoImport({
      imports: ['vitest'],
      dts: resolve(PROJECT_ROOT, './vitest-auto-imports.d.ts'),
      eslintrc: {
        enabled: true,
        filepath: resolve(PROJECT_ROOT, './.eslintrc-auto-import.json'),
        globalsPropValue: true
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    clearMocks: true,
    include: ['./src/**/*.{test,spec}.{js,ts,svelte}'],
    setupFiles: ['./vitest-setup-client.ts']
  }
});
