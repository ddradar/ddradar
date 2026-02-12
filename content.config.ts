import { defineCollection, defineContentConfig } from '@nuxt/content'
import type { LocaleObject } from '@nuxtjs/i18n'
import * as z from 'zod/mini'

const locales = ['en', 'ja', 'ko'] as const satisfies LocaleObject['code'][]

export default defineContentConfig({
  collections: locales.reduce(
    (acc, locale) => {
      acc[`content_${locale}`] = defineCollection({
        type: 'page',
        source: { include: `${locale}/**`, prefix: '' },
        schema: z.object({
          links: z.optional(
            z.array(
              z.object({
                label: z.string(),
                icon: z.string(),
                to: z.string(),
                target: z.optional(z.string()),
              })
            )
          ),
        }),
      })
      return acc
    },
    {} as Record<string, ReturnType<typeof defineCollection>>
  ),
})
