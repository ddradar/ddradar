import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  nitro: { preset: 'azure' },
  css: ['@/assets/css/main.scss'],
})
