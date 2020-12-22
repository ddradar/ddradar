<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="(name, i) in nameIndexList"
        :key="i"
        :to="`/name/${i}`"
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

import { NameIndexList, searchSongByName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'

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
    this.songs = await searchSongByName(this.$http, this.selected)
  }

  /** Name index title (like "あ", "A", "数字・記号") */
  get title() {
    return NameIndexList[parseInt(this.$route.params.nameIndex, 10)]
  }

  get selected() {
    return parseInt(this.$route.params.nameIndex, 10)
  }

  get nameIndexList() {
    return NameIndexList
  }
}
</script>
