import type { Composer } from 'vue-i18n'
import { en, ja } from 'zod/locales'
import * as z from 'zod/mini'

export default defineNuxtPlugin({
  name: 'zod-i18n',
  async setup(nuxtApp) {
    const { locale } = nuxtApp.$i18n as Composer

    switch (locale.value) {
      case 'ja':
        z.config(ja())
        break
      case 'en':
      default:
        z.config(en())
        break
    }
  },
})
