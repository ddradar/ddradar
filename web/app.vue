<script lang="ts" setup>
const siteTitle = 'DDRadar'
useHead({
  titleTemplate: t => (t ? `${t} - ${siteTitle}` : siteTitle),
})
</script>

<template>
  <div>
    <AppNavbar />

    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>

    <UFooter></UFooter>
    <UNotifications />
  </div>
</template>
