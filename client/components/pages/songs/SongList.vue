<template>
  <b-table
    :data="displayedSongs"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <template v-slot:default="props">
      <b-table-column field="series" :label="$t('list.series')">
        {{ props.row.series }}
      </b-table-column>
      <b-table-column field="name" :label="$t('list.name')">
        <nuxt-link :to="`/songs/${props.row.id}`">
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
      <b-table-column field="artist" :label="$t('list.artist')">
        {{ props.row.artist }}
      </b-table-column>
      <b-table-column field="bpm" :label="$t('list.bpm')">
        {{ props.row.bpm }}
      </b-table-column>
      <b-table-column :visible="$accessor.isAdmin" label="Edit">
        <nuxt-link :to="`/admin/song/${props.row.id}`">
          <b-icon icon="pencil-box-outline" />
        </nuxt-link>
      </b-table-column>
    </template>

    <template v-slot:empty>
      <section v-if="loading" class="section">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </section>
      <section v-else class="section">
        <div class="content has-text-grey has-text-centered">
          <p>{{ $t('list.noData') }}</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<i18n>
{
  "ja": {
    "list": {
      "series": "バージョン",
      "name": "曲名",
      "artist": "アーティスト",
      "bpm": "BPM",
      "noData": "データがありません"
    }
  },
  "en": {
    "list": {
      "series": "Version",
      "name": "Name",
      "artist": "Artist",
      "bpm": "BPM",
      "noData": "No Data"
    }
  }
}
</i18n>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { shortenSeriesName, SongListData } from '~/api/song'

@Component
export default class SongListComponent extends Vue {
  @Prop({ type: Array, required: true })
  readonly songs!: Omit<SongListData, 'nameKana' | 'nameIndex'>[]

  @Prop({ type: Boolean, required: true })
  readonly loading!: boolean

  get displayedSongs() {
    return this.songs.map(s => ({
      id: s.id,
      name: s.name,
      artist: s.artist,
      series: shortenSeriesName(s.series),
      bpm:
        !s.minBPM || !s.maxBPM
          ? '???'
          : s.minBPM === s.maxBPM
          ? `${s.minBPM}`
          : `${s.minBPM}-${s.maxBPM}`,
    }))
  }
}
</script>
