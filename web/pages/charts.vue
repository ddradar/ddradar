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
      :data="charts!"
      striped
      :loading="pending"
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
      <OTableColumn v-if="isLoggedIn" v-slot="props" label="Score">
        <OButton
          icon-right="pencil-box-outline"
          @click="editScore(props.row)"
        />
      </OTableColumn>

      <template #empty>
        <section v-if="pending" class="section">
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

import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import DifficultyBadge from '~~/components/songs/DifficultyBadge.vue'
import useAuth from '~~/composables/useAuth'
import type { ChartInfo } from '~~/server/api/v1/charts/[style]/[level].get'
import { getQueryInteger } from '~~/utils/path'
import { levels, shortenSeriesName } from '~~/utils/song'

/* c8 ignore next */
definePageMeta({ key: route => route.fullPath })

const _kinds = ['SINGLE', 'DOUBLE']

// Data & Hook
const _route = useRoute()
const style = getQueryInteger(_route.query, 'style')
const level = getQueryInteger(_route.query, 'level')
const { oruga } = useProgrammatic()
const { isLoggedIn } = await useAuth()
const { data: charts, pending } = await useFetch(
  `/api/v1/charts/${style}/${level}`,
  { watch: [_route.query] }
)

// Computed
const title = `${_kinds[style - 1]} ${level}`
const otherStyle = style === 2 ? 1 : 2

// Method
const isButtonDisabled = (i: number) => level === i || null
/** Open ScoreEditor modal. */
const editScore = async ({ id, playStyle, difficulty }: ChartInfo) => {
  const instance = oruga.modal.open({
    component: ScoreEditor,
    props: { songId: id, isCourse: false, playStyle, difficulty },
    trapFocus: true,
  })
  await instance.promise
}
</script>
