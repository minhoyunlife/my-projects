import { resolve } from 'path';

import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// 테스트 시 활용될 공통 설정
export default defineConfig({
  root: resolve(__dirname, '..'),
  test: {
    globals: true,
    setupFiles: ['./test/setups/wrapper.setup.ts'],
  },
  plugins: [
    tsconfigPaths({
      root: resolve(__dirname, '..'),
    }),
    swc.vite({
      swcrc: true,
      swcrcRoots: resolve(__dirname, '..'),
    }),
  ],
});
