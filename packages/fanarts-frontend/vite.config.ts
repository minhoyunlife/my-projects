import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		host: true,
		port: process.env.FANARTS_FRONTEND_PORT ? parseInt(process.env.FANARTS_FRONTEND_PORT) : 5174,
		fs: {
			strict: false
		}
	},
	ssr: {
		noExternal: ['@minhoyunlife/my-ts-client'] // 외부 ESM 모듈을 번들링하도록 지정
	},
	plugins: [sveltekit(), tailwindcss()]
});
