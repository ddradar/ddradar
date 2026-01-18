<script setup lang="ts">
import { en, ja } from '@nuxt/ui/locale'

const { locale } = useI18n()

const nuxtUILocales = computed(() => (locale.value === 'ja' ? ja : en))
</script>

<template>
  <UApp :locale="nuxtUILocales">
    <AppHeader />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter />
  </UApp>
</template>
