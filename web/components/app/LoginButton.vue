<script setup lang="ts">
const { t } = useI18n()
const { login } = await useEasyAuth()
const items = computed(() => [
  [
    {
      label: t('login_via', { name: 'X' }),
      icons: 'i-simple-icons-x',
      click: () => login('twitter'),
    },
    {
      label: t('login_via', { name: 'LINE' }),
      icons: 'i-simple-icons-line',
      click: () => login('line'),
    },
    {
      label: t('login_via', { name: 'GitHub' }),
      icons: 'i-simple-icons-github',
      click: () => login('github'),
    },
  ],
])
</script>

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

<template>
  <UDropdown :items="items">
    <UButton icon="i-heroicons-arrow-right-end-on-rectangle-20-solid">
      {{ t('login') }}
    </UButton>
  </UDropdown>
</template>
