<script setup lang="ts">
import type { HeaderLink } from '#ui-pro/types'

const { t } = useI18n()
const { isLoggedIn } = await useEasyAuth()

const links = computed<HeaderLink[]>(() => [
  { label: t('menu.user'), to: '/users' },
  {
    label: t('menu.level', { style: 'SP' }),
    children: [...Array(19).keys()].map(i => ({
      label: `LEVEL ${i + 1}`,
      to: { path: `/charts`, query: { style: 1, level: i + 1 } },
      exactQuery: true,
    })),
  },
  {
    label: t('menu.level', { style: 'DP' }),
    children: [...Array(19).keys()].map(i => ({
      label: `LEVEL ${i + 1}`,
      to: { path: `/charts`, query: { style: 2, level: i + 1 } },
      exactQuery: true,
    })),
  },
  {
    label: t('menu.series'),
    children: seriesNames.map((label, series) => ({
      label,
      to: { path: '/songs', query: { series } },
      exactQuery: true,
    })),
  },
])
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <AppLogo class="w-auto h-6" />
      DDRadar
    </template>
    <template #right>
      <AppLocaleSwitch />
      <UColorModeButton />
      <AppUserButton v-if="isLoggedIn" />
      <AppLoginButton v-else />
    </template>
  </UHeader>
</template>

<i18n lang="json">
{
  "ja": {
    "menu": {
      "user": "ユーザーを探す",
      "scores": "スコア一覧",
      "level": "レベル({style})",
      "series": "バージョン"
    }
  },
  "en": {
    "menu": {
      "user": "Find User",
      "scores": "Score List",
      "level": "Level({style})",
      "series": "Version"
    }
  }
}
</i18n>
