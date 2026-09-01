import { en, ja, ko } from 'zod/locales'
import * as z from 'zod/mini'

export default defineNuxtPlugin({
  name: 'zod-i18n',
  setup(nuxtApp) {
    const { locale } = nuxtApp.$i18n

    switch (locale.value) {
      case 'ja':
        z.config(ja())
        break
      case 'ko':
        z.config(ko())
        break
      case 'en':
      default:
        z.config(en())
        break
    }
  },
})
