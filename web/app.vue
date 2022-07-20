<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
const siteTitle = 'DDRadar'
useHead({
  titleTemplate: t => t ? `${t} - ${siteTitle}` : siteTitle
})
</script>
