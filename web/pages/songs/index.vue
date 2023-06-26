<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <NuxtLink
        v-for="l in pages"
        :key="l.key"
        class="button is-info"
        :class="{ 'is-outlined': isButtonDisabled(l.key) }"
        :disabled="isButtonDisabled(l.key)"
        :to="{ path: '/songs', query: l.query }"
      >
        {{ l.name }}
      </NuxtLink>
    </div>

    <OTable
      :data="songs!"
      striped
      :loading="pending"
      :mobile-cards="false"
      paginated
      :per-page="50"
    >
      <OTableColumn v-slot="props" field="series" :label="t('column.series')">
        {{ shortenSeriesName(props.row.series) }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="name" :label="t('column.name')">
        <NuxtLink :to="`/songs/${props.row.id}`">
          {{ props.row.name }}
        </NuxtLink>
      </OTableColumn>
      <OTableColumn v-slot="props" field="artist" :label="t('column.artist')">
        {{ props.row.artist }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="bpm" :label="t('column.bpm')">
        {{ getDisplayedBPM(props.row) }}
      </OTableColumn>
      <OTableColumn v-if="isLoggedIn" v-slot="props" :label="t('column.score')">
        <OButton
          icon-right="pencil-box-outline"
          @click="editScore(props.row.id)"
        />
      </OTableColumn>

      <template #empty>
        <section v-if="pending" class="section">
          <OSkeleton animated size="large" :count="3" />
        </section>
        <section v-else class="section">
          <div class="content has-text-grey has-text-centered">
            <p>{{ t('noData') }}</p>
          </div>
        </section>
      </template>
    </OTable>
  </section>
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

<script lang="ts" setup>
import { nameIndexMap } from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'
import { useI18n } from 'vue-i18n'

import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import useAuth from '~~/composables/useAuth'
import { getQueryInteger } from '~~/utils/path'
import { getDisplayedBPM, seriesNames, shortenSeriesName } from '~~/utils/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['name', 'series'] as const

// Data & Hook
const _route = useRoute()
const name = getQueryInteger(_route.query, _kinds[0])
const series = getQueryInteger(_route.query, _kinds[1])
const { oruga } = useProgrammatic()
const { t } = useI18n()
const { isLoggedIn } = await useAuth()
const { data: songs, pending } = await useFetch('/api/v1/songs', {
  query: { name, series },
  watch: [_route.query],
})

// Computed
const _pageKind = !isNaN(name) ? _kinds[0] : !isNaN(series) ? _kinds[1] : 'all'
const title =
  _pageKind === 'name'
    ? nameIndexMap.get(name)
    : _pageKind === 'series'
    ? seriesNames[series]
    : 'すべての楽曲を表示'
const pages =
  _pageKind === 'name'
    ? [...nameIndexMap.entries()].map(([key, name]) => ({
        name,
        key,
        query: { name: key },
      }))
    : _pageKind === 'series'
    ? seriesNames.map((name, key) => ({
        name,
        key,
        query: { series: key },
      }))
    : []

// Method
const isButtonDisabled = (key: number) => name === key || series === key || null
/** Open ScoreEditor modal. */
const editScore = async (songId: string) => {
  const instance = oruga.modal.open({
    component: ScoreEditor,
    props: { songId, isCourse: false },
    trapFocus: true,
  })
  await instance.promise
}
</script>
