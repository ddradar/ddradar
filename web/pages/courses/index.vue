<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <OButton
        v-for="(l, i) in pages"
        :key="i"
        variant="info"
        :disabled="type === l.type && series === l.series"
        :outlined="type === l.type && series === l.series"
        @click="changeQueries(l.type, l.series)"
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

import { useFetch, useRoute, useRouter } from '#app'
import { getQueryInteger } from '~/src/path'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

const _kinds = ['NONSTOP', '段位認定']

const _route = useRoute()
const { replace } = useRouter()
const type = ref(getQueryInteger(_route.query, 'type'))
const series = ref(getQueryInteger(_route.query, 'series'))

const {
  data: courses,
  pending: isLoading,
  refresh,
} = await useFetch(
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
  _kinds.map(kind => ({
    type: _kinds.indexOf(kind) + 1,
    series,
    name: `${kind} (${shortenSeriesName(seriesNames[series])})`,
  }))
)

const changeQueries = async (t: number, s: number) => {
  type.value = t
  series.value = s
  await replace(`${_route.path}?type=${t}&series=${s}`)
  await refresh()
}
</script>
