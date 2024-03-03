<template>
  <div>
    <AppNavbar />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <UFooter></UFooter>
    <UNotifications />
  </div>
</template>

<script lang="ts" setup>
const siteTitle = 'DDRadar'
useHead({
  titleTemplate: t => (t ? `${t} - ${siteTitle}` : siteTitle),
})
</script>
