<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <song-list :songs="songs" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { searchSongBySeries, SeriesList, SongListData } from '~/api/song'
import SongList from '~/components/shared/SongList.vue'

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
    const seriesIndex = parseInt(this.$route.params.seriesIndex, 10)
    this.songs = await searchSongBySeries(this.$http, seriesIndex)
  }

  /** Name index title (like "あ", "A", "数字・記号") */
  get title() {
    return SeriesList[parseInt(this.$route.params.seriesIndex, 10)]
  }
}
</script>
