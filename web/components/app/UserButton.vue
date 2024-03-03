<script setup lang="ts">
const { t } = useI18n()

const { logout } = await useEasyAuth()
const { data: user } = await useFetch('/api/v1/user')

const items = computed(() => [
  user.value
    ? [
        { label: t('mypage'), to: `/users/${user.value.id}` },
        { label: t('scores'), to: `/users/${user.value.id}/scores` },
        { label: t('profile'), to: `/profile` },
      ]
    : [{ label: t('profile'), to: `/profile` }],
  [{ label: t('logout'), click: logout }],
])
const name = computed(() => user.value?.name ?? t('unregistered_user'))
</script>

<i18n lang="json">
{
  "ja": {
    "unregistered_user": "(未登録ユーザー)",
    "mypage": "マイページ",
    "scores": "スコア一覧",
    "profile": "ユーザー設定",
    "logout": "ログアウト"
  },
  "en": {
    "unregistered_user": "(Unregistered User)",
    "mypage": "MyPage",
    "scores": "Score List",
    "profile": "User Config",
    "logout": "Logout"
  }
}
</i18n>

<template>
  <UDropdown :items="items">
    <UButton icon="user-20-solid">{{ name }}</UButton>
  </UDropdown>
</template>
