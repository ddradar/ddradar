<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <NuxtLink
        v-for="(l, i) in pages"
        :key="i"
        class="button is-info"
        :class="{ 'is-disabled': name === l.key || series === l.key }"
        :to="l.to"
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
import { computed, ref } from 'vue'

import { useFetch, useRoute } from '#app'
import { getQueryInteger } from '~/src/path'
import { nameIndexMap, seriesNames, shortenSeriesName } from '~/src/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['name', 'series'] as const

const _route = useRoute()
const name = ref(getQueryInteger(_route.query, _kinds[0]))
const series = ref(getQueryInteger(_route.query, _kinds[1]))

const { data: songs, pending: isLoading } = await useFetch(
  /* c8 ignore next 2 */
  () => `/api/v1/songs?name=${name.value}&series=${series.value}`
)

const _pageKind = computed(() =>
  !isNaN(name.value) ? _kinds[0] : !isNaN(series.value) ? _kinds[1] : 'all'
)
const title = computed(() =>
  _pageKind.value === 'name'
    ? nameIndexMap.get(name.value)
    : _pageKind.value === 'series'
    ? seriesNames[series.value]
    : 'すべての楽曲を表示'
)
const pages = computed(() =>
  _pageKind.value === 'name'
    ? [...nameIndexMap.entries()].map(([key, name]) => ({
        name,
        key,
        to: `/songs?name=${key}`,
      }))
    : _pageKind.value === 'series'
    ? seriesNames.map((name, key) => ({
        name,
        key,
        to: `/songs?series=${key}`,
      }))
    : []
)
</script>
