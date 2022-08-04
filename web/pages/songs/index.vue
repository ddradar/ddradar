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
      :data="songs"
      striped
      :loading="isLoading"
      :mobile-cards="false"
      paginated
      :per-page="50"
    >
      <OTableColumn v-slot="props" field="series" label="Series">
        {{ shortenSeriesName(props.row.series) }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="name" label="Name">
        <NuxtLink :to="`/songs/${props.row.id}`">
          {{ props.row.name }}
        </NuxtLink>
      </OTableColumn>
      <OTableColumn v-slot="props" field="artist" label="Artist">
        {{ props.row.artist }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="bpm" label="BPM">
        {{ props.row.bpm }}
      </OTableColumn>

      <template #empty>
        <section v-if="isLoading" class="section">
          <OSkeleton animated size="large" :count="3" />
        </section>
        <section v-else class="section">
          <div class="content has-text-grey has-text-centered">
            <p>No Data</p>
          </div>
        </section>
      </template>
    </OTable>
  </section>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

import { useFetch, useRoute } from '#app'
import { getQueryInteger } from '~/src/path'
import { nameIndexMap, seriesNames, shortenSeriesName } from '~/src/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['name', 'series'] as const

const _route = useRoute()
const name = getQueryInteger(_route.query, _kinds[0])
const series = getQueryInteger(_route.query, _kinds[1])

const uri = `/api/v1/songs?name=${name}&series=${series}`
const {
  data: songs,
  pending: isLoading,
  refresh,
} = await useFetch(uri, { key: uri })
watch(
  () => _route.query,
  () => refresh()
)

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
const isButtonDisabled = (key: number) => name === key || series === key || null
</script>
