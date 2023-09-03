import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  nitro: {
    preset: 'azure',
    prerender: {
      ignore: ['/.auth/**', '/data-api/**'],
    },
  },
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
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'ja', iso: 'ja-JP', name: '日本語' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
  },
})
