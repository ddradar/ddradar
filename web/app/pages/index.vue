<script lang="ts" setup>
import { nameIndexMap } from '@ddradar/core'

const { t } = useI18n()
const { data: notifications } = await useFetch('/api/v2/notification', {
  query: { scope: 'top' },
})
</script>

<template>
  <UPage>
    <UPageHeader title="DDRadar" :description="t('subtitle')" />

    <UPageBody>
      <NotificationAlert v-for="n in notifications" :key="n.id" :data="n" />
      <UContainer class="text-right my-2">
        <ULink to="/notification">{{ t('old_notification') }}</ULink>
      </UContainer>
      <UPageGrid>
        <UPageCard :title="t('search.name')">
          <UButton
            v-for="[i, n] in nameIndexMap"
            :key="i"
            :to="`/songs?name=${i}`"
            variant="ghost"
          >
            {{ n }}
          </UButton>
        </UPageCard>

        <UPageCard :title="t('search.series')">
          <UButton
            v-for="(n, i) in seriesNames"
            :key="i"
            :to="`/songs?series=${i}`"
            variant="ghost"
          >
            {{ n }}
          </UButton>
        </UPageCard>

        <UPageCard :title="t('search.level', { style: 'SINGLE' })">
          <UButton
            v-for="i in levels"
            :key="i"
            :to="`/charts?style=1&level=${i}`"
            variant="ghost"
          >
            {{ i }}
          </UButton>
        </UPageCard>

        <UPageCard :title="t('search.level', { style: 'DOUBLE' })">
          <UButton
            v-for="i in levels"
            :key="i"
            :to="`/charts?style=2&level=${i}`"
            variant="ghost"
          >
            {{ i }}
          </UButton>
        </UPageCard>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>

<i18n lang="json">
{
  "ja": {
    "old_notification": "過去のお知らせ一覧",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "曲名から探す",
      "series": "バージョンから探す",
      "level": "レベルから探す({style})"
    }
  },
  "en": {
    "old_notification": "Old Notification",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "Choose by Name",
      "series": "Choose by Version",
      "level": "Choose by LV ({style})"
    }
  }
}
</i18n>
