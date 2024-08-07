import type { LocaleObject } from '@nuxtjs/i18n'
import { RouterLinkStub } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

import config from '~~/nuxt.config'

/** Locale strings */
export const locales = [...(config.i18n!.locales as LocaleObject[])].map(
  l => l.code
)
export const global = {
  stubs: { RouterLink: RouterLinkStub },
  plugins: [createI18n({ legacy: false, locale: 'ja' })],
}
