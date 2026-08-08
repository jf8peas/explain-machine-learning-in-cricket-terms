// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://explain-machine-learning-in-cricket.vercel.app',
  // Content pages stay static so astro-pagefind can index them.
  // The grading API lives in site/api/grade.ts as a standalone Vercel
  // serverless function (Vercel deploys those regardless of static output),
  // so /api/grade works even though the site itself is static.
  output: 'static',
  adapter: vercel(),
  base: '/',
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
  integrations: [pagefind()],
});