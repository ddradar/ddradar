<script lang="ts" setup>
const { t } = useI18n()
const _route = useRoute('users-id')

const { data: user } = await useFetch(`/api/v1/users/${_route.params.id}`)
if (!user.value) throw createError({ statusCode: 404, message: t('empty') })

const { data: clears } = await useFetch(
  `/api/v1/users/${_route.params.id}/clear`
)

const areaName = computed(() => t(`area.${user.value!.area}`))
const ddrCode = computed(() =>
  String(user.value!.code).replace(/^(\d{4})(\d{4})$/, '$1-$2')
)
</script>

<template>
  <UPage>
    <UPageHeader
      headline="Users"
      :title="user!.name"
      :description="`${areaName} / ${ddrCode}`"
    />
    <UPageBody>
      <UserClearLampTable
        :play-style="1"
        :statuses="clears"
      ></UserClearLampTable>
    </UPageBody>
  </UPage>
</template>

<i18n src="~/locales/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "pageTitle": "ユーザー詳細",
    "button": {
      "scores": "スコア一覧",
      "import": "スコアのインポート",
      "settings": "設定"
    },
    "title": {
      "clear": "クリア状況 ({0})"
    },
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "User Detail",
    "button": {
      "scores": "Score List",
      "import": "Import Scores",
      "settings": "Settings"
    },
    "title": {
      "clear": "Clear Status ({0})"
    },
    "empty": "User does not exist or is private",
    "noData": "No Data"
  }
}
</i18n>
