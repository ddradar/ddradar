<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <song-list :songs="songs" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { NameIndexList, searchSongByName, SongListData } from '~/api/song'
import SongList from '~/components/shared/SongList.vue'

@Component({ components: { SongList }, fetchOnServer: false })
export default class SongByNamePage extends Vue {
  /** Song List from API */
  songs: SongListData[] = []

  /** nameIndex expected [0-36] */
  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.nameIndex, 10)
    return (
      /^\d{1,2}$/.test(params.nameIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < NameIndexList.length
    )
  }

  /** Get Song List from API */
  async fetch() {
    const nameIndex = parseInt(this.$route.params.nameIndex, 10)
    this.songs = await searchSongByName(this.$http, nameIndex)
  }

  /** Name index title (like "あ", "A", "数字・記号") */
  get title() {
    return NameIndexList[parseInt(this.$route.params.nameIndex, 10)]
  }
}
</script>
