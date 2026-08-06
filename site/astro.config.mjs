// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://explain-machine-learning-in-cricket.vercel.app',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  }
});
