<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <OButton
        v-for="l in pages"
        :key="l.to"
        tag="nuxt-link"
        :to="l.to"
        variant="info"
        :disabled="type === l.type && series === l.series"
        :outlined="type === l.type && series === l.series"
      >
        {{ l.name }}
      </OButton>
    </div>

    <OTable
      :data="courses"
      striped
      :loading="isLoading"
      :mobile-cards="false"
      paginated
    >
      <OTableColumn v-slot="props" field="series" label="Series">
        {{ props.row.series }}
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
import type { SearchParams } from 'ohmyfetch'

import { useFetch, useRoute } from '#app'
import { getQueryInteger } from '~/src/path'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

const _kinds = ['NONSTOP', '段位認定']

const route = useRoute()
const type = getQueryInteger(route.query, 'type')
const series = getQueryInteger(route.query, 'series')

const _params: SearchParams = {}
if (!isNaN(type)) _params.type = type
if (!isNaN(series)) _params.series = series
const { data: courses, pending: isLoading } = await useFetch(
  '/api/v1/courses',
  { params: _params }
)

const title = `${_kinds[type - 1] ?? 'COURSES'}${
  isNaN(series) ? '' : ` (${shortenSeriesName(seriesNames[series])})`
}`
const pages = courseSeriesIndexes.flatMap(series =>
  _kinds.map(kind => ({
    type: _kinds.indexOf(kind) + 1,
    series,
    to: `/courses?type=${_kinds.indexOf(kind) + 1}&series=${series}`,
    name: `${kind} (${shortenSeriesName(seriesNames[series])})`,
  }))
)
</script>
