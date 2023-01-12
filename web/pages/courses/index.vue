<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <NuxtLink
        v-for="l in pages"
        :key="l.name"
        class="button is-info"
        :class="{
          'is-outlined': isButtonDisabled(l.query),
        }"
        :disabled="isButtonDisabled(l.query)"
        :to="{ path: '/courses', query: l.query }"
      >
        {{ l.name }}
      </NuxtLink>
    </div>

    <OTable
      :data="courses"
      striped
      :loading="isLoading"
      :mobile-cards="false"
      paginated
    >
      <OTableColumn v-slot="props" field="series" label="Series">
        {{ shortenSeriesName(props.row.series) }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="name" label="Name">
        <NuxtLink :to="`/courses/${props.row.id}`">
          {{ props.row.name }}
        </NuxtLink>
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

import { getQueryInteger } from '~/src/path'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['NONSTOP', '段位認定']

const _route = useRoute()
const type = getQueryInteger(_route.query, 'type')
const series = getQueryInteger(_route.query, 'series')

const uri = `/api/v1/courses?type=${type}&series=${series}`
const {
  data: courses,
  pending: isLoading,
  refresh,
} = await useFetch(uri, { key: uri })
watch(
  () => _route.query,
  () => refresh()
)

const title = `${_kinds[type - 1] ?? 'COURSES'}${
  isNaN(series) ? '' : ` (${shortenSeriesName(seriesNames[series])})`
}`
const pages = courseSeriesIndexes.flatMap(series =>
  _kinds.map((kind, i) => ({
    query: { type: i + 1, series },
    name: `${kind} (${shortenSeriesName(seriesNames[series])})`,
  }))
)
const isButtonDisabled = (query: (typeof pages)[number]['query']) =>
  (type === query.type && series === query.series) || null
</script>
