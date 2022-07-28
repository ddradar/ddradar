<template>
  <section class="section">
    <h1 class="title">{{ getTitle(type, series) }}</h1>

    <div class="buttons">
      <OButton
        v-for="l in pages"
        :key="l.to"
        tag="nuxt-link"
        :to="l.to"
        variant="info"
        :disabled="l.to === route.path"
        :outlined="l.to === route.path"
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
import { useFetch, useRoute } from '#app'
import { getQueryInteger, getQueryString } from '~/src/path'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

const _kinds = ['nonstop', 'grade']
const _kindToType = (kind: string) => _kinds.indexOf(kind) + 1
const getTitle = (type: number, series: number) =>
  `${type <= 1 ? 'NONSTOP' : '段位認定'} (${shortenSeriesName(
    seriesNames[series]
  )})`

const route = useRoute()
const type = _kindToType(getQueryString(route.query, 'kind') ?? 'nonstop')
const series = getQueryInteger(route.query, 'series')

const { data: courses, pending: isLoading } = await useFetch(
  '/api/v1/courses',
  { params: { type, series } }
)

const pages = courseSeriesIndexes.flatMap(i =>
  _kinds.map(kind => ({
    to: `/courses?kind=${kind}&type=${i}`,
    name: getTitle(_kindToType(kind), i),
  }))
)
</script>
