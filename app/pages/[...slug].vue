<script setup lang="ts">
import { withLeadingSlash } from 'ufo'

const route = useRoute('slug')
const { locale } = useI18n()
const slug = computed(() =>
  withLeadingSlash([route.params.slug].flat().join('/') || '/')
)

const { data: page } = await useAsyncData(
  'page-' + slug.value,
  async () => {
    // Build collection name based on current locale
    const collection = `content_${locale.value}` as const
    const content = await queryCollection(collection).path(slug.value).first()

    // Optional: fallback to default locale if content is missing
    if (!content && locale.value !== 'en')
      return await queryCollection('content_en').path(slug.value).first()

    return content
  },
  { watch: [locale] }
)

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
