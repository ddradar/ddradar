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
      :data="courses!"
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
      <OTableColumn v-if="isLoggedIn" v-slot="props" label="Score">
        <OButton
          icon-right="pencil-box-outline"
          @click="editScore(props.row.id)"
        />
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
import { useProgrammatic } from '@oruga-ui/oruga-next'
import { watch } from 'vue'

import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import useAuth from '~~/composables/useAuth'
import { getQueryInteger } from '~~/utils/path'
import {
  courseSeriesIndexes,
  seriesNames,
  shortenSeriesName,
} from '~~/utils/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['NONSTOP', '段位認定']

// Data & Hook
const _route = useRoute()
const type = getQueryInteger(_route.query, 'type')
const series = getQueryInteger(_route.query, 'series')
const { oruga } = useProgrammatic()
const { isLoggedIn } = await useAuth()

const uri = `/api/v1/courses?type=${type}&series=${series}` as const
const {
  data: courses,
  pending: isLoading,
  refresh,
} = await useFetch(uri, { key: uri })
watch(
  () => _route.query,
  () => refresh()
)

// Computed
const title = `${_kinds[type - 1] ?? 'COURSES'}${
  isNaN(series) ? '' : ` (${shortenSeriesName(seriesNames[series])})`
}`
const pages = courseSeriesIndexes.flatMap(series =>
  _kinds.map((kind, i) => ({
    query: { type: i + 1, series },
    name: `${kind} (${shortenSeriesName(seriesNames[series])})`,
  }))
)

// Method
const isButtonDisabled = (query: (typeof pages)[number]['query']) =>
  (type === query.type && series === query.series) || null
/** Open ScoreEditor modal. */
const editScore = async (songId: string) => {
  const instance = oruga.modal.open({
    component: ScoreEditor,
    props: { songId, isCourse: true },
    trapFocus: true,
  })
  await instance.promise
}
</script>
