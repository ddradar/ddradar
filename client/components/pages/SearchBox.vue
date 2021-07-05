<template>
  <b-autocomplete
    v-model="term"
    :loading="$fetchState.pending"
    :data="filtered"
    icon="search"
    clearable
    field="name"
    @select="move"
  >
    <template #default="props">
      <span>{{ props.option.name }} / {{ props.option.artist }}</span>
    </template>
  </b-autocomplete>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'

import { getAllSongInfo } from '~/api/song'

@Component({ fetchOnServer: false })
export default class SearchBoxComponent extends Vue {
  songList: Pick<Api.SongInfo, 'id' | 'name' | 'nameKana' | 'artist'>[] = []
  term: string = ''

  get filtered() {
    return this.term
      ? this.songList.filter(
          s =>
            s.name.toUpperCase().includes(this.term.toUpperCase()) ||
            s.nameKana.includes(this.term.toUpperCase()) ||
            s.artist.toUpperCase().includes(this.term.toUpperCase())
        )
      : []
  }

  async fetch() {
    const songs = await getAllSongInfo(this.$http)
    this.songList = songs.map(s => ({
      id: s.id,
      name: s.name,
      nameKana: s.nameKana,
      artist: s.artist,
    }))
  }

  move({ id }: Pick<Api.SongInfo, 'id'>) {
    this.$router.push(`/songs/${id}`)
  }
}
</script>
