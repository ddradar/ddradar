<template>
  <section v-if="song" class="section">
    <h1 class="title">{{ song.name }}</h1>
    <h2 class="subtitle">{{ song.artist }} / {{ song.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
    <div v-if="$accessor.isAdmin" class="buttons">
      <b-button
        type="is-info"
        icon-left="pencil-box"
        tag="nuxt-link"
        :to="`/admin/song/${song.id}`"
      >
        編集
      </b-button>
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in singleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in doubleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { Ref } from '@nuxtjs/composition-api'
import {
  computed,
  defineComponent,
  ref,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import { getDisplayedBPM } from '~/api/song'
import ChartDetail from '~/components/pages/songs/ChartDetail.vue'
import { useSongInfo } from '~/composables/useSongApi'

export default defineComponent({
  name: 'SongDetailPage',
  components: { ChartDetail },
  validate: ({ params }) => Song.isValidId(params.id),
  setup() {
    const { params, payload, route } = useContext()

    // Data
    let song: Ref<Api.SongInfo | null>
    if (payload) {
      song = ref<Api.SongInfo>(payload)
    } else {
      const { song: songInfo } = useSongInfo(params.value.id)
      song = songInfo
    }
    const playStyle = ref<Song.PlayStyle | 0>(0)
    const difficulty = ref<Song.Difficulty | -1>(-1)
    const chart = route.value?.hash
    if (/^#(1[0-4]|2[1-4])$/.test(chart)) {
      const selectedChart = parseInt(chart.substring(1))
      difficulty.value = (selectedChart % 10) as Song.Difficulty
      playStyle.value = ((selectedChart - (selectedChart % 10)) /
        10) as Song.PlayStyle
    }

    // lifecycle
    useMeta(() => ({ title: song.value?.name }))

    // Computed
    const useChart = (style: Song.PlayStyle) =>
      computed(
        () => song.value?.charts.filter(c => c.playStyle === style) ?? []
      )
    const singleCharts = useChart(1)
    const doubleCharts = useChart(2)
    const displayedBPM = computed(() =>
      song.value
        ? getDisplayedBPM(song.value)
        : /* istanbul ignore next */ '???'
    )

    return {
      song,
      playStyle,
      difficulty,
      singleCharts,
      doubleCharts,
      displayedBPM,
    }
  },
  head: {},
})
</script>
