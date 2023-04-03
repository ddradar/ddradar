import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  nitro: { preset: 'azure' },
  build: {
    transpile: [/@oruga-ui\/oruga-next/],
  },
  routeRules: {
    '/.auth/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/data-api/**': { ssr: false },
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
        },
      ],
    },
  },
  css: ['@/assets/css/main.scss'],
  modules: ['@nuxtjs/i18n'],
})
