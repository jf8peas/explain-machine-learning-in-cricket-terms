// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://explain-machine-learning-in-cricket.vercel.app',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [pagefind()],
});