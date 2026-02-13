<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { en, ja, ko } from '@nuxt/ui/locale'

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

const { data: navigation } = await useAsyncData(
  'navigation',
  async () => {
    // Build collection name based on current locale
    const collection = `content_${locale.value}` as const
    const navigation = await queryCollectionNavigation(collection)
    if (!navigation && locale.value !== 'en')
      return await queryCollectionNavigation('content_en')
    return navigation
  },
  { watch: [locale] }
)
const nuxtUILocales = computed(() => {
  switch (locale.value) {
    case 'ja':
      return ja
    case 'ko':
      return ko
    case 'en':
    default:
      return en
  }
})

provide('navigation', navigation)
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
    <USeparator />
    <AppFooter />
  </UApp>
</template>
