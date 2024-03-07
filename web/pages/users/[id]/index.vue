<script lang="ts" setup>
const { t } = useI18n()
const _route = useRoute('users-id')

const { data: user } = await useFetch(`/api/v1/users/${_route.params.id}`)
if (!user.value) throw createError({ statusCode: 404, message: t('empty') })

const radar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }
const { data: radars } = await useFetch(
  `/api/v1/users/${_route.params.id}/radar`,
  { default: () => [radar, radar] }
)
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
      <UPageGrid
        :ui="{ wrapper: 'sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2' }"
      >
        <UPageCard title="Groove Radar (SINGLE)">
          <GrooveRadar :radar="radars?.[0] ?? radar" />
        </UPageCard>
        <UPageCard title="Groove Radar (DOUBLE)">
          <GrooveRadar :radar="radars?.[1] ?? radar" />
        </UPageCard>
      </UPageGrid>
      <UTable :rows="clears"></UTable>
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
      "radar": "グルーブレーダー ({0})",
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
      "radar": "Groove Radar ({0})",
      "clear": "Clear Status ({0})"
    },
    "empty": "User does not exist or is private",
    "noData": "No Data"
  }
}
</i18n>
