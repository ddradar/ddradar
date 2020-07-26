<template>
  <section v-if="song" class="section">
    <h1 class="title">{{ song.name }}</h1>
    <h2 class="subtitle">{{ song.artist }} / {{ song.series }}</h2>
    <h2 class="subtitle">{{ displayedBPM }}</h2>
    <div class="content columns is-tablet is-multiline">
      <chart-detail
        v-for="(chart, i) in song.charts"
        :key="i"
        :song="song"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen is-one-fifth-fullhd"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import ChartDetail from '~/components/pages/ChartDetail.vue'
import { SongInfo } from '~/types/api/song'

@Component({ components: { ChartDetail } })
export default class SongDetailPage extends Vue {
  song: SongInfo | null = null
  chartIndex: number = 0

  validate({ params }: Pick<Context, 'params'>) {
    return (
      /^[01689bdiloqDIOPQ]{32}$/.test(params.id) &&
      (!params.chart || /^[12][0-4]$/.test(params.chart)) // [playStyle][difficulty]
    )
  }

  async asyncData({ params, $http }: Pick<Context, 'params' | '$http'>) {
    // Get song info from API
    const song = await $http.$get<SongInfo>(`/api/v1/songs/${params.id}`)

    // Set chartIndex
    let chartIndex = 0
    if (params.chart) {
      const selectedChart = parseInt(params.chart)
      const difficulty = selectedChart % 10
      const playStyle = (selectedChart - difficulty) / 10
      chartIndex = song.charts.findIndex(
        c => c.playStyle === playStyle && c.difficulty === difficulty
      )
      if (chartIndex === -1) chartIndex = 0
    }

    return {
      song,
      chartIndex,
    }
  }

  get displayedBPM() {
    if (!this.song?.minBPM || !this.song?.maxBPM) return '???'
    if (this.song?.minBPM === this.song?.maxBPM) return `${this.song.minBPM}`
    return `${this.song.minBPM}-${this.song.maxBPM}`
  }
}
</script>
