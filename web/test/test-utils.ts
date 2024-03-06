import type { LocaleObject } from '@nuxtjs/i18n'

import config from '~/nuxt.config'

/** Locale strings */
export const locales = [...(config.i18n!.locales as LocaleObject[])].map(
  l => l.code
)
