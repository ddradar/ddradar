<script lang="ts" setup>
import { nameIndexMap, songSchema } from '@ddradar/core'
import { z } from 'zod'

definePageMeta({ key: route => route.fullPath })

const { t } = useI18n()
const { data: user } = await useFetch('/api/v1/user')

// #region Data Fetching
/** Expected Query */
const querySchema = z.object({
  name: z.coerce
    .number()
    .pipe(songSchema.shape.nameIndex)
    .optional()
    .catch(undefined),
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(seriesNames.length - 1)
    .optional()
    .catch(undefined),
})
const _route = useRoute()
const { name, series } = querySchema.parse(_route.query)
const { data: songs, pending: loading } = await useFetch('/api/v1/songs', {
  query: { name, series },
  watch: [_route.query],
})
// #endregion

/** Page Title */
const title = computed(() =>
  typeof name === 'number'
    ? nameIndexMap.get(name)
    : typeof series === 'number'
      ? seriesNames[series]
      : 'すべての楽曲を表示'
)
/** Button Links to other series/name */
const links = computed(() =>
  typeof name === 'number'
    ? [...nameIndexMap.entries()].map(([name, label]) => ({
        label,
        query: { name: `${name}` },
      }))
    : typeof series === 'number'
      ? seriesNames.map((label, series) => ({
          label,
          query: { series: `${series}` },
        }))
      : []
)
/** Table Columns */
const columns = computed(() => [
  { key: 'series', label: t('column.series') },
  { key: 'name', label: t('column.name') },
  { key: 'artist', label: t('column.artist') },
  { key: 'bpm', label: t('column.bpm') },
  ...(user.value ? [{ key: 'score', label: t('column.score') }] : []),
])

/** Open ScoreEditor modal. */
const editScore = async (_songId: string) => {}
</script>

<i18n lang="json">
{
  "ja": {
    "column": {
      "series": "シリーズ",
      "name": "曲名",
      "artist": "アーティスト",
      "bpm": "BPM",
      "score": "スコア編集"
    },
    "noData": "データがありません"
  },
  "en": {
    "column": {
      "series": "Series",
      "name": "Name",
      "artist": "Artist",
      "bpm": "BPM",
      "score": "Edit Score"
    },
    "noData": "No Data"
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="title" />

    <UContainer>
      <UButton
        v-for="l in links"
        :key="l.query"
        :to="{ path: '/songs', query: l.query }"
        exact-query
        variant="ghost"
        color="blue"
      >
        {{ l.label }}
      </UButton>
    </UContainer>

    <UTable
      :rows="songs"
      :columns="columns"
      :loading="loading"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: t('noData'),
      }"
    >
      <template #series-data="{ row }">
        {{ shortenSeriesName(row.series) }}
      </template>
      <template #name-data="{ row }">
        <ULink class="blue" :to="`/songs/${row.id}`">{{ row.name }}</ULink>
      </template>
      <template #bpm-data="{ row }">
        {{ getDisplayedBPM(row) }}
      </template>
      <template v-if="user" #score-data="{ row }">
        <UButton icon="i-heroicons-pencil-square" @click="editScore(row.id)" />
      </template>
    </UTable>
  </UPage>
</template>
