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
import type { SongListData } from '@ddradar/core/api/song'
import { seriesSet } from '@ddradar/core/db/songs'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { searchSongBySeries, shortenSeriesName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'

@Component({ components: { SongList }, fetchOnServer: false })
export default class SongBySeriesPage extends Vue {
  /** Song List from API */
  songs: SongListData[] = []

  /** Series title */
  get title() {
    return [...seriesSet][this.selected]
  }

  get selected() {
    return parseInt(this.$route.params.seriesIndex, 10)
  }

  get seriesList() {
    return [...seriesSet].map(s => shortenSeriesName(s))
  }

  /** seriesIndex expected [0-16] */
  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.seriesIndex, 10)
    return (
      /^\d{1,2}$/.test(params.seriesIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < seriesSet.size
    )
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.title }
  }

  /** Get Song List from API */
  async fetch() {
    this.songs = await searchSongBySeries(this.$http, this.selected)
  }
}
</script>
