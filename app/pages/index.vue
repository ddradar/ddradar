<script setup lang="ts">
const { locale } = useI18n()

const { data: page } = await useAsyncData(
  'page-index',
  async () => {
    // Build collection name based on current locale
    const collection = `content_${locale.value}` as const
    const content = await queryCollection(collection).path('/').first()

    // Optional: fallback to default locale if content is missing
    if (!content && locale.value !== 'en')
      return await queryCollection('content_en').path('/').first()
    return content
  },
  { watch: [locale] }
)

if (!page.value)
  throw createError({ status: 404, statusText: 'Page not found' })
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
