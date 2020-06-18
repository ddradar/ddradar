<template>
  <section class="section">
    <h1 class="title">{{ name }}</h1>
    <h2 class="subtitle">{{ artist }} / {{ series }}</h2>
    <h2 class="subtitle">{{ displayedBPM }}</h2>
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { SongInfo, StepChart } from '~/types/api/song'

type Song = Omit<SongInfo, 'id' | 'nameKana' | 'nameIndex'>

@Component
export default class SongDetailPage extends Vue implements Song {
  name: string
  artist: string
  series: string
  minBPM: number | null
  maxBPM: number | null
  charts: StepChart[]

  chartIndex: number = 0

  validate({ params }: Pick<Context, 'params'>) {
    return (
      /^[01689bdiloqDIOPQ]{32}$/.test(params.id) &&
      (!params.chart || /^[12][0-4]$/.test(params.chart)) // [playStyle][difficulty]
    )
  }

  async asyncData({ payload, params, $http }: Context) {
    // Get song info from generated payload or API
    const songInfo: SongInfo =
      payload ?? (await $http.$get<SongInfo>(`/songs/${params.id}`))

    // Set chartIndex
    let chartIndex = 0
    if (params.chart) {
      const selectedChart = parseInt(params.chart)
      const difficulty = selectedChart % 10
      const playStyle = (selectedChart - difficulty) / 10
      chartIndex = songInfo.charts.findIndex(
        c => c.playStyle === playStyle && c.difficulty === difficulty
      )
      if (chartIndex === -1) chartIndex = 0
    }

    return {
      name: songInfo.name,
      artist: songInfo.artist,
      series: songInfo.series,
      minBPM: songInfo.minBPM,
      maxBPM: songInfo.maxBPM,
      chartIndex,
    }
  }

  get displayedBPM() {
    if (!this.minBPM || !this.maxBPM) return '???'
    if (this.minBPM === this.maxBPM) return `${this.minBPM}`
    return `${this.minBPM}-${this.maxBPM}`
  }
}
</script>
