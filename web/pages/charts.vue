<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>

    <div class="buttons">
      <NuxtLink
        class="button is-success"
        :to="{ path: '/charts', query: { style: otherStyle, level } }"
      >
        プレースタイルを切り替える
      </NuxtLink>
    </div>
    <div class="buttons">
      <NuxtLink
        v-for="lv in levels"
        :key="lv"
        class="button is-info"
        :class="{
          'is-outlined': isButtonDisabled(lv),
        }"
        :disabled="isButtonDisabled(lv)"
        :to="{ path: '/charts', query: { style, level: lv } }"
      >
        {{ lv }}
      </NuxtLink>
    </div>

    <OTable
      :data="charts"
      striped
      :loading="isLoading"
      :mobile-cards="false"
      paginated
    >
      <OTableColumn v-slot="props" field="series" label="Series">
        {{ shortenSeriesName(props.row.series) }}
      </OTableColumn>
      <OTableColumn v-slot="props" field="name" label="Name">
        <NuxtLink :to="`/songs/${props.row.id}`">
          {{ props.row.name }}
        </NuxtLink>
      </OTableColumn>
      <OTableColumn v-slot="props" field="difficulty" label="Difficulty">
        <DifficultyBadge :difficulty="props.row.difficulty" />
      </OTableColumn>
      <OTableColumn v-slot="props" field="level" label="Level" numeric>
        {{ props.row.level }}
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
import DifficultyBadge from '~/components/DifficultyBadge.vue'
import type { ChartInfo } from '~/server/api/v1/charts/[style]/[level].get'
import { getQueryInteger } from '~/src/path'
import { levels, shortenSeriesName } from '~/src/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['SINGLE', 'DOUBLE']

const _route = useRoute()
const style = getQueryInteger(_route.query, 'style')
const level = getQueryInteger(_route.query, 'level')

const uri = `/api/v1/charts/${style}/${level}` as const
const {
  data: charts,
  pending: isLoading,
  refresh,
} = await useFetch<ChartInfo[]>(uri, { key: uri })
watch(
  () => _route.query,
  () => refresh()
)

const title = `${_kinds[style - 1]} ${level}`
const otherStyle = style === 2 ? 1 : 2
const isButtonDisabled = (i: number) => level === i || null
</script>
