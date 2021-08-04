<template>
  <b-autocomplete
    v-model="term"
    :data="filtered"
    :loading="$fetchState.pending"
    :placeholder="$t('placeholder')"
    icon="magnify"
    field="name"
    clearable
    @select="move"
  >
    <template #default="props">
      <span>{{ props.option.name }} / {{ props.option.artist }}</span>
    </template>
  </b-autocomplete>
</template>

<i18n>
{
  "ja": {
    "placeholder": "曲名/アーティスト名から探す"
  },
  "en": {
    "placeholder": "Find by Song/Artist name"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'

import { searchSong } from '~/api/song'

@Component({ fetchOnServer: false })
export default class SearchBoxComponent extends Vue {
  songList: Pick<Api.SongInfo, 'id' | 'name' | 'nameKana' | 'artist'>[] = []
  term: string = ''

  get filtered() {
    return this.term.trim()
      ? this.songList.filter(
          s =>
            s.name.toUpperCase().includes(this.term.toUpperCase()) ||
            s.nameKana.includes(this.term.toUpperCase()) ||
            s.artist.toUpperCase().includes(this.term.toUpperCase())
        )
      : []
  }

  async fetch() {
    try {
      const songs = await searchSong(this.$http)
      this.songList = songs.map(s => ({
        id: s.id,
        name: s.name,
        nameKana: s.nameKana,
        artist: s.artist,
      }))
    } catch {}
  }

  move({ id }: Pick<Api.SongInfo, 'id'>) {
    this.$router.push(`/songs/${id}`)
  }
}
</script>
