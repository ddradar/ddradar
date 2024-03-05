<script setup lang="ts">
import type { DropdownItem } from '#ui/types'

const { t } = useI18n()
const { login } = await useEasyAuth()
const items = computed<DropdownItem[][]>(() => [
  [
    {
      label: t('login_via', { name: 'X' }),
      icon: 'i-simple-icons-x',
      click: () => login('twitter'),
    },
    {
      label: t('login_via', { name: 'LINE' }),
      icon: 'i-simple-icons-line',
      click: () => login('line'),
    },
    {
      label: t('login_via', { name: 'GitHub' }),
      icon: 'i-simple-icons-github',
      click: () => login('github'),
    },
  ],
])
</script>

<template>
  <UDropdown :items="items">
    <UButton icon="i-heroicons-arrow-right-end-on-rectangle-20-solid">
      {{ t('login') }}
    </UButton>
  </UDropdown>
</template>

<i18n lang="json">
{
  "ja": {
    "login": "ログイン",
    "login_via": "{name}でログイン"
  },
  "en": {
    "login": "Login",
    "login_via": "Login via {name}"
  }
}
</i18n>
