<script lang="ts" setup>
import { nameIndexMap } from '@ddradar/core'

const { t } = useI18n()
</script>

<i18n lang="json">
{
  "ja": {
    "old_notification": "過去のお知らせ一覧",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "曲名から探す",
      "series": "バージョンから探す",
      "level": "レベルから探す({style})",
      "course": "コースから探す"
    },
    "grade": "段位認定({series})",
    "nonstop": "NONSTOP({series})"
  },
  "en": {
    "old_notification": "Old Notification",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "Choose by Name",
      "series": "Choose by Version",
      "level": "Choose by LV ({style})",
      "course": "Choose by Courses"
    },
    "grade": "GRADE({series})",
    "nonstop": "NONSTOP({series})"
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader title="DDRadar" :description="t('subtitle')" />

    <UPageBody>
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
            {{ shortenSeriesName(n) }}
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

        <UPageCard :title="t('search.course')">
          <template v-for="i in courseSeriesIndexes" :key="i">
            <UButton :to="`/courses?type=1&series=${i}`" variant="ghost">
              {{ t('nonstop', { series: shortenSeriesName(seriesNames[i]) }) }}
            </UButton>
            <UButton :to="`/courses?type=2&series=${i}`" variant="ghost">
              {{ t('grade', { series: shortenSeriesName(seriesNames[i]) }) }}
            </UButton>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
