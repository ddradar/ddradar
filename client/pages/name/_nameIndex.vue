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
import { Song } from '@ddradar/core'
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import SongList from '~/components/pages/songs/SongList.vue'
import { useSongList } from '~/composables/useSongApi'

export default defineComponent({
  name: 'SongByNamePage',
  components: { SongList },
  fetchOnServer: false,
  validate({ params }) {
    const parsedIndex = parseInt(params.nameIndex, 10)
    return (
      /^\d{1,2}$/.test(params.nameIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < Song.nameIndexMap.size
    )
  },
  setup() {
    const { params } = useContext()

    // Computed
    const selected = computed(
      () => parseInt(params.value.nameIndex, 10) as Song.NameIndex
    )
    /** "あ", ..., "A", ..., "数字・記号" */
    const nameIndexList = [...Song.nameIndexMap.values()]
    /** Name index title (like "あ", "A", "数字・記号") */
    const title = computed(() => Song.nameIndexMap.get(selected.value))

    // Data
    const { songs } = useSongList(selected.value)

    // Lifecycle
    useMeta(() => ({ title: title.value }))

    return { songs, selected, nameIndexList, title }
  },
  head: {},
})
</script>
