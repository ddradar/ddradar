<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <NuxtLink
        v-for="(l, i) in pages"
        :key="i"
        class="button is-info"
        :class="{ 'is-disabled': type === l.type && series === l.series }"
        :to="{ path: '/courses', query: { type: l.type, series: l.series } }"
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
import { computed, ref } from 'vue'

import { useFetch, useRoute } from '#app'
import { getQueryInteger } from '~/src/path'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['NONSTOP', '段位認定']

const _route = useRoute()
const type = ref(getQueryInteger(_route.query, 'type'))
const series = ref(getQueryInteger(_route.query, 'series'))

const { data: courses, pending: isLoading } = await useFetch(
  /* c8 ignore next 2 */
  () => `/api/v1/courses?type=${type.value}&series=${series.value}`
)

const title = computed(
  () =>
    `${_kinds[type.value - 1] ?? 'COURSES'}${
      isNaN(series.value)
        ? ''
        : ` (${shortenSeriesName(seriesNames[series.value])})`
    }`
)
const pages = courseSeriesIndexes.flatMap(series =>
  _kinds.map((kind, i) => ({
    type: i + 1,
    series,
    name: `${kind} (${shortenSeriesName(seriesNames[series])})`,
  }))
)
</script>
