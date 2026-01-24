<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { en, ja } from '@nuxt/ui/locale'

const { locale, t } = useI18n()
const { github } = useRuntimeConfig().public.community
const actions: ButtonProps[] = [
  {
    label: 'GitHub',
    to: github,
    target: '_blank',
    icon: 'i-simple-icons-github',
  },
]

const nuxtUILocales = computed(() => (locale.value === 'ja' ? ja : en))
</script>

<template>
  <UApp :locale="nuxtUILocales">
    <UBanner
      color="warning"
      icon="i-lucide-info"
      :title="t('error.wip')"
      :actions="actions"
      close
    />
    <AppHeader />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter />
  </UApp>
</template>
