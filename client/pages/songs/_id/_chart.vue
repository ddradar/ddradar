<template>
  <section v-if="song" class="section">
    <h1 class="title">{{ song.name }}</h1>
    <h2 class="subtitle">{{ song.artist }} / {{ song.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
    <div v-if="$accessor.isAdmin" class="buttons">
      <b-button
        type="is-info"
        icon-left="pencil-box"
        tag="nuxt-link"
        :to="`/admin/song/${song.id}`"
      >
        編集
      </b-button>
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in singleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in doubleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { SongInfo } from '@core/api/song'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getSongInfo } from '~/api/song'
import ChartDetail from '~/components/pages/songs/ChartDetail.vue'

@Component({ components: { ChartDetail } })
export default class SongDetailPage extends Vue {
  song: SongInfo | null = null
  playStyle = 0
  difficulty = -1

  get singleCharts() {
    return this.song?.charts.filter(c => c.playStyle === 1) ?? []
  }

  get doubleCharts() {
    return this.song?.charts.filter(c => c.playStyle === 2) ?? []
  }

  get displayedBPM() {
    if (!this.song?.minBPM || !this.song?.maxBPM) return '???'
    if (this.song?.minBPM === this.song?.maxBPM) return `${this.song.minBPM}`
    return `${this.song.minBPM}-${this.song.maxBPM}`
  }

  validate({ params }: Pick<Context, 'params'>) {
    return (
      /^[01689bdiloqDIOPQ]{32}$/.test(params.id) &&
      (!params.chart || /^(1[0-4]|2[1-4])$/.test(params.chart)) // [playStyle][difficulty]
    )
  }

  async asyncData({ params, $http }: Pick<Context, 'params' | '$http'>) {
    // Get song info from API
    const song = await getSongInfo($http, params.id)

    // Set chartIndex
    if (params.chart) {
      const selectedChart = parseInt(params.chart)
      const difficulty = selectedChart % 10
      const playStyle = (selectedChart - difficulty) / 10
      return { song, playStyle, difficulty }
    }

    return { song }
  }
}
</script>
