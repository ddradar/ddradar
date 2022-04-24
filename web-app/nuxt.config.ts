import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  nitro: { preset: 'azure' },
  app: {
    head: {
      link: [
        {
          type: 'text/css',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css',
          rel: 'preload',
          as: 'style',
          onload: "this.rel='stylesheet'",
        },
      ],
    },
  },
  css: ['~/assets/css/styles.scss'],
})
