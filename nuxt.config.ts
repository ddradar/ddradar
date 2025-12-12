// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  modules: ['@nuxthub/core', '@nuxt/eslint', '@nuxt/ui'],
  nitro: {
    preset: 'cloudflare-module',
    experimental: {
      tasks: true,
    },
  },
  devtools: { enabled: true },
  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    cache: true,
    db: 'sqlite',
    kv: true,
  },
  css: ['~/assets/css/main.css'],
})
