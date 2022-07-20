import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  nitro: { preset: 'azure' },
  vite: {
    resolve: {
      alias: {
        '@ddradar/core': resolve(__dirname, '../core/src'),
        '@ddradar/db': resolve(__dirname, '../db/src'),
      },
    },
  },
  meta: {
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
      },
    ],
  },
  css: ['@/assets/css/main.scss'],
  router: {
    routes: [{ path: '/.auth/*' }],
  },
})
