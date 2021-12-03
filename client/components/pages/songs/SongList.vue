<template>
  <b-table
    :data="displayedSongs"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <b-table-column v-slot="props" field="series" :label="$t('list.series')">
      {{ props.row.series }}
    </b-table-column>
    <b-table-column v-slot="props" field="name" :label="$t('list.name')">
      <nuxt-link :to="`/songs/${props.row.id}`">
        {{ props.row.name }}
      </nuxt-link>
    </b-table-column>
    <b-table-column v-slot="props" field="artist" :label="$t('list.artist')">
      {{ props.row.artist }}
    </b-table-column>
    <b-table-column v-slot="props" field="bpm" :label="$t('list.bpm')">
      {{ props.row.bpm }}
    </b-table-column>

    <template #empty>
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

<i18n lang="json">
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
import type { Api } from '@ddradar/core'
import type { PropType } from '@nuxtjs/composition-api'
import { computed, defineComponent } from '@nuxtjs/composition-api'

import { getDisplayedBPM, shortenSeriesName } from '~/api/song'

type SongListData = Omit<Api.SongListData, 'nameKana' | 'nameIndex'>

export default defineComponent({
  props: {
    songs: { type: Array as PropType<SongListData[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    // Computed
    const displayedSongs = computed(() =>
      props.songs.map(s => ({
        id: s.id,
        name: s.name,
        artist: s.artist,
        series: shortenSeriesName(s.series),
        bpm: getDisplayedBPM(s),
      }))
    )

    return { displayedSongs }
  },
})
</script>
