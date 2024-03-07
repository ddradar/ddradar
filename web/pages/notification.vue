<script lang="ts" setup>
const { t } = useI18n()
const { clientPrincipal } = await useEasyAuth()

const { data: messages, pending } = await useLazyFetch('/api/v1/notification', {
  default: () => [],
})

const isAdmin = computed(
  () => !!clientPrincipal.value?.userRoles.includes('administrator')
)
/** Table columns */
const columns = computed(() => [
  { key: 'title', label: t('column.title') },
  { key: 'timeStamp', label: t('column.timeStamp'), class: 'w-80' },
  ...(isAdmin.value ? [{ key: 'action', label: 'Edit' }] : []),
])
</script>

<template>
  <UPage>
    <UPageHeader :title="t('pageTitle')" />

    <UPageBody>
      <UTable :rows="messages" :columns="columns" :loading="pending">
        <template #title-data="{ row }">
          <NotificationAccordion :data="row" />
        </template>
        <template #timeStamp-data="{ row }">
          {{ unixTimeToString(row.timeStamp) }}
        </template>
        <template #action-data="{ row }">
          <UButton
            icon="i-heroicons-pencil-square"
            :to="`/admin/notification/${row.id}`"
          />
        </template>
      </UTable>
    </UPageBody>
  </UPage>
</template>

<i18n lang="json">
{
  "ja": {
    "pageTitle": "お知らせ一覧",
    "column": {
      "title": "タイトル",
      "timeStamp": "投稿日時"
    },
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "All Notification List",
    "column": {
      "title": "Title",
      "timeStamp": "Date"
    },
    "noData": "No Data"
  }
}
</i18n>
