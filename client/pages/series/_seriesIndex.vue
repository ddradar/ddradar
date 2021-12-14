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
import { Song } from '@ddradar/core'
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import { shortenSeriesName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'
import { useSongList } from '~/composables/useSongApi'

const series = [...Song.seriesSet]

export default defineComponent({
  name: 'SongBySeriesPage',
  components: { SongList },
  fetchOnServer: false,
  validate({ params }) {
    const parsedIndex = parseInt(params.seriesIndex, 10)
    return (
      /^\d{1,2}$/.test(params.seriesIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < series.length
    )
  },
  setup() {
    const { params } = useContext()

    // Computed
    const selected = computed(() => parseInt(params.value.seriesIndex, 10))
    const seriesList = series.map(s => shortenSeriesName(s))
    /** Series title */
    const title = computed(() => series[selected.value])

    // Data
    const { songs } = useSongList(undefined, selected.value)

    // Lifecycle
    useMeta(() => ({ title: title.value }))

    return { songs, selected, seriesList, title }
  },
  head: {},
})
</script>
