<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="(name, i) in seriesList"
        :key="i"
        :to="`/series/${i}`"
        type="is-info"
        tag="nuxt-link"
        :disabled="i === selected"
        :outlined="i === selected"
      >
        {{ name }}
      </b-button>
    </div>
    <song-list :songs="songs" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import type { SongListData } from '@core/api/song'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { searchSongBySeries, SeriesList, shortenSeriesName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'

@Component({ components: { SongList }, fetchOnServer: false })
export default class SongBySeriesPage extends Vue {
  /** Song List from API */
  songs: SongListData[] = []

  /** seriesIndex expected [0-16] */
  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.seriesIndex, 10)
    return (
      /^\d{1,2}$/.test(params.seriesIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < SeriesList.length
    )
  }

  /** Get Song List from API */
  async fetch() {
    this.songs = await searchSongBySeries(this.$http, this.selected)
  }

  /** Series title */
  get title() {
    return SeriesList[this.selected]
  }

  get selected() {
    return parseInt(this.$route.params.seriesIndex, 10)
  }

  get seriesList() {
    return SeriesList.map(s => shortenSeriesName(s))
  }
}
</script>
