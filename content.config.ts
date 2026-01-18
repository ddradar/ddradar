import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: ['en', 'ja'].reduce(
    (acc, locale) => {
      acc[`content_${locale}`] = defineCollection({
        type: 'page',
        source: { include: `${locale}/**`, prefix: '' },
      })
      return acc
    },
    {} as Record<string, ReturnType<typeof defineCollection>>
  ),
})
