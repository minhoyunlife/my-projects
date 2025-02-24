import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../../');

export default defineConfig({
  server: {
    host: true,
    port: process.env.FANARTS_FRONTEND_PORT ? parseInt(process.env.FANARTS_FRONTEND_PORT) : 5174,
    fs: {
      strict: false
    }
  },
  envDir: rootDir,
  ssr: {
    noExternal: ['@minhoyunlife/my-ts-client'] // 외부 ESM 모듈을 번들링하도록 지정
  },
  plugins: [sveltekit(), tailwindcss()]
});
