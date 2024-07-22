<script lang="ts" setup>
import type { Difficulty } from '@ddradar/core'

import type { Button } from '#ui/types'
import type { GetResponse } from '~~/schemas/charts'
import { getRouterParamsSchema } from '~~/schemas/charts'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['SINGLE', 'DOUBLE']

// #region Data Fetching
const { data: user } = await useFetch('/api/v1/user')
const _route = useRoute('charts')
const { style, level } = getRouterParamsSchema.parse(_route.query)
const { t } = useI18n()
const { data: _data, status } = await useFetch(
  `/api/v2/charts/${style}/${level}`,
  {
    watch: [_route.query],
    default: (): GetResponse => [],
  }
)
// #endregion

const pageCount = 50
const { page, total, from, to, data: charts } = usePaging(pageCount, _data)

const title = `${_kinds[style - 1]} ${level}`

/** "Change Playstyle" button on Header */
const headerLink = computed<Button[]>(() => [
  {
    label: t('change'),
    icon: 'i-heroicons-arrow-path-rounded-square-20-solid',
    to: { path: '/charts', query: { style: style === 2 ? 1 : 2, level } },
    target: '_self',
  },
])
/** Table Columns */
const columns = computed(() => [
  { key: 'series', label: t('column.series') },
  { key: 'name', label: t('column.name') },
  { key: 'difficulty', label: t('column.difficulty') },
  { key: 'level', label: t('column.level') },
  ...(user.value ? [{ key: 'score', label: t('column.score') }] : []),
])

// #region Score Editor
const modalSongId = ref('')
const modalDifficulty = ref<Difficulty | undefined>(undefined)
const modalIsOpen = ref(false)
/** Open ScoreEditor modal. */
const editScore = async (row: GetResponse[number]) => {
  modalSongId.value = row.id
  modalDifficulty.value = row.difficulty
  modalIsOpen.value = true
}
// #endregion
</script>

<template>
  <UPage>
    <UPageHeader :title="title" :links="headerLink">
      <template #description>
        <UButton
          v-for="i in levels"
          :key="i"
          :to="{ path: '/charts', query: { style, level: i } }"
          exact-query
          variant="ghost"
          color="blue"
        >
          {{ i }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UTable
        :rows="charts"
        :columns="columns"
        :loading="status === 'pending'"
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
        <template #difficulty-data="{ row }">
          <SongDifficultyBadge :difficulty="row.difficulty" />
        </template>
        <template v-if="user" #score-data="{ row }">
          <UButton
            icon="i-heroicons-pencil-square-20-solid"
            @click="editScore(row)"
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

    <ModalScoreEditor
      v-model="modalIsOpen"
      :song-id="modalSongId"
      :play-style="style"
      :difficulty="modalDifficulty"
    />
  </UPage>
</template>

<i18n lang="json">
{
  "ja": {
    "change": "プレースタイルを切り替える",
    "column": {
      "series": "シリーズ",
      "name": "曲名",
      "difficulty": "難易度",
      "level": "Lv",
      "score": "スコア編集"
    },
    "showing": "{total} 件中 {from} 件から {to} 件を表示中",
    "noData": "データがありません"
  },
  "en": {
    "change": "Change Play Style",
    "column": {
      "series": "Series",
      "name": "Name",
      "difficulty": "Difficulty",
      "level": "Lv",
      "score": "Edit Score"
    },
    "showing": "Showing {from} to {to} of {total} results",
    "noData": "No Data"
  }
}
</i18n>
