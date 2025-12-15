import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wilddragonking.github.io',
  base: '/RehaSport',
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@lib': '/src/lib',
        '@styles': '/src/styles',
      }
    }
  }
});
