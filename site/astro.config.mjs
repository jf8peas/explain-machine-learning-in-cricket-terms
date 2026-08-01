// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    site: 'https://jf8peas.github.io',
    base: '/explain-machine-learning-in-cricket-terms/'
  },
});
