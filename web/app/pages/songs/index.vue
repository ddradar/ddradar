<script lang="ts" setup>
import { nameIndexMap } from '@ddradar/core'

import { getDisplayedBPM } from '~/utils/song'
import { listQuerySchema } from '~~/schemas/songs'

definePageMeta({ key: route => route.fullPath })

// #region Data Fetching
const { data: user } = await useFetch('/api/v2/user')
const _route = useRoute('songs')
const { name, series } = listQuerySchema.parse(_route.query)
const { data: _data, status } = await useFetch('/api/v2/songs', {
  query: { name, series },
  watch: [_route.query],
  default: () => [],
})
// #endregion

const pageCount = 50
const { page, total, from, to, data: songs } = usePaging(pageCount, _data)

// #region i18n
const { t } = useI18n()
/** Page Title */
const title = computed(() =>
  typeof name === 'number'
    ? nameIndexMap.get(name)
    : typeof series === 'number'
      ? seriesNames[series]
      : t('showAll')
)
/** Button Links to other series/name */
const links = computed(() =>
  typeof name === 'number'
    ? [...nameIndexMap.entries()].map(([name, label]) => ({
        label,
        query: { name },
      }))
    : typeof series === 'number'
      ? seriesNames.map((label, series) => ({ label, query: { series } }))
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
// #endregion

// #region Score Editor
const modalSongId = ref('')
const modalIsOpen = ref(false)
/** Open ScoreEditor modal. */
const editScore = async (songId: string) => {
  modalSongId.value = songId
  modalIsOpen.value = true
}
// #endregion
</script>

<template>
  <UPage>
    <UPageHeader :title="title">
      <template #description>
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
      </template>
    </UPageHeader>

    <UPageBody>
      <UTable
        :rows="songs"
        :columns="columns"
        :loading="status === 'pending'"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: t('noData'),
        }"
      >
        <template #series-data="{ row }">
          {{ row.series }}
        </template>
        <template #name-data="{ row }">
          <ULink class="blue" :to="`/songs/${row.id}`">{{ row.name }}</ULink>
        </template>
        <template #bpm-data="{ row }">
          {{ getDisplayedBPM(row) }}
        </template>
        <template v-if="user" #score-data="{ row }">
          <UButton
            icon="i-heroicons-pencil-square-20-solid"
            @click="editScore(row.id)"
          />
        </template>
      </UTable>

      <div v-if="total" class="flex flex-wrap justify-between items-center">
        <div>
          <i18n-t keypath="showing" tag="span" class="text-sm leading-5">
            <template #from>
              <span class="font-medium">{{ from }}</span>
            </template>
            <template #to>
              <span class="font-medium">{{ to }}</span>
            </template>
            <template #total>
              <span class="font-medium">{{ total }}</span>
            </template>
          </i18n-t>
        </div>

        <UPagination v-model="page" :page-count="pageCount" :total="total" />
      </div>
    </UPageBody>

    <ModalScoreEditor v-model="modalIsOpen" :song-id="modalSongId" />
  </UPage>
</template>

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
    "showAll": "すべての楽曲を表示",
    "showing": "{total} 件中 {from} 件から {to} 件を表示中",
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
    "showAll": "Show All Songs",
    "showing": "Showing {from} to {to} of {total} results",
    "noData": "No Data"
  }
}
</i18n>
