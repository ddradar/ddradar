<script setup lang="ts">
import { withLeadingSlash } from 'ufo'

definePageMeta({ layout: 'docs' })

const route = useRoute('slug')
const slug = computed(() =>
  withLeadingSlash([route.params.slug].flat().join('/') || '/')
)

const { data: page } = await usePageContent(slug)

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
      <ContentRenderer :value="page" />
    </UPageBody>

    <template v-if="page.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links" />
    </template>
  </UPage>
</template>
