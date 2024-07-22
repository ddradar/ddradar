<script setup lang="ts">
import type { DropdownItem } from '#ui/types'

const { t } = useI18n()

const { logout } = await useEasyAuth()
const { data: user } = await useFetch('/api/v1/user')

const name = computed(() => user.value?.name ?? t('unregistered_user'))
const items = computed<DropdownItem[][]>(() => [
  user.value
    ? [
        { label: name.value, to: `/users/${user.value.id}` },
        { label: t('scores'), to: `/users/${user.value.id}/scores` },
        { label: t('profile'), to: `/profile` },
      ]
    : [{ label: t('register'), to: `/profile` }],
  [{ label: t('logout'), click: logout }],
])
</script>

<template>
  <UDropdown :items="items">
    <UButton icon="i-heroicons-user-20-solid"></UButton>
  </UDropdown>
</template>

<i18n lang="json">
{
  "ja": {
    "register": "ユーザー登録",
    "mypage": "マイページ",
    "scores": "スコア一覧",
    "profile": "ユーザー設定",
    "logout": "ログアウト"
  },
  "en": {
    "register": "Register",
    "mypage": "MyPage",
    "scores": "Score List",
    "profile": "User Config",
    "logout": "Logout"
  }
}
</i18n>
