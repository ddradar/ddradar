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
import { NameIndex, nameIndexMap } from '@core/db/songs'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import { MetaInfo } from 'vue-meta'

import { searchSongByName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'

@Component({ components: { SongList }, fetchOnServer: false })
export default class SongByNamePage extends Vue {
  /** Song List from API */
  songs: SongListData[] = []

  /** Name index title (like "あ", "A", "数字・記号") */
  get title() {
    return nameIndexMap.get(
      parseInt(this.$route.params.nameIndex, 10) as NameIndex
    )
  }

  get selected() {
    return parseInt(this.$route.params.nameIndex, 10)
  }

  /** "あ", ..., "A", ..., "数字・記号" */
  get nameIndexList() {
    return [...nameIndexMap.values()]
  }

  /** nameIndex should be [0-36] */
  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.nameIndex, 10)
    return (
      /^\d{1,2}$/.test(params.nameIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < nameIndexMap.size
    )
  }

  head(): MetaInfo {
    return { title: this.title }
  }

  /** Get Song List from API */
  async fetch() {
    this.songs = await searchSongByName(this.$http, this.selected)
  }
}
</script>
