<script setup lang="ts">
import { withLeadingSlash } from 'ufo'

definePageMeta({ layout: 'docs' })

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
  throw createError({ status: 404, statusText: 'Page not found' })
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links"
    />
    <UPageBody>
      <ContentRenderer v-if="page" :value="page" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body?.toc?.links" />
    </template>
  </UPage>
</template>
