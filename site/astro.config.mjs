// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://explain-machine-learning-in-cricket.vercel.app',
  output: 'static',
  adapter: vercel(),
  base: '/',
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
  integrations: [pagefind()],
});