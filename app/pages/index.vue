<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from '@nuxt/ui'

const { t } = useI18n()

const links = computed<ButtonProps[]>(() => [
  {
    label: t('actions.login.label'),
    to: '/login',
    icon: 'i-lucide-user',
  },
])
const features = computed<PageFeatureProps[]>(() => [
  {
    icon: 'i-lucide-pie-chart',
    title: t('page.index.features.radar.title'),
    description: t('page.index.features.radar.description'),
  },
  {
    icon: 'i-lucide-arrow-up-0-1',
    title: t('page.index.features.exScore.title'),
    description: t('page.index.features.exScore.description'),
  },
  {
    icon: 'i-simple-icons-github',
    title: t('page.index.features.openSource.title'),
    description: t('page.index.features.openSource.description'),
  },
])
</script>

<template>
  <div>
    <UPageHero
      title="DDRadar"
      :description="t('page.index.description')"
      :links="links"
    />
    <UPageSection
      :title="t('page.index.features.title')"
      :features="features"
    />
  </div>
</template>
