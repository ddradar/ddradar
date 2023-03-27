<template>
  <section class="section">
    <template v-if="song">
      <h1 class="title">{{ song!.name }}</h1>
      <h2 class="subtitle">{{ song!.artist }} / {{ song!.series }}</h2>
      <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
      <div class="content columns is-multiline">
        <ChartInfo v-for="(chart, i) in singleCharts" :key="i" :chart="chart" />
      </div>
      <div class="content columns is-multiline">
        <ChartInfo v-for="(chart, i) in doubleCharts" :key="i" :chart="chart" />
      </div>
    </template>
    <template v-else>
      <OLoading active />
      <h1 class="title"><o-skeleton animated /></h1>
      <h2 class="subtitle"><o-skeleton animated /></h2>
      <h2 class="subtitle"><o-skeleton animated /></h2>
      <div class="content columns is-multiline">
        <o-skeleton animated size="large" :count="3" />
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import ChartInfo from '~~/components/ChartInfo.vue'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'
import { getDisplayedBPM } from '~~/utils/song'

const _route = useRoute()
const { data: song } = await useFetch<SongInfo>(
  `/api/v1/songs/${_route.params.id}`
)

const displayedBPM = computed(() =>
  song.value ? getDisplayedBPM(song.value) : '???'
)
const singleCharts = computed(() =>
  song.value?.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  song.value?.charts.filter(c => c.playStyle === 2)
)
</script>
