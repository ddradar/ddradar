<script setup lang="ts">
const { data: page, pending } = await usePageContent('/')

if (!pending.value && !page.value)
  throw createError({ status: 404, statusText: 'Page not found' })
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
