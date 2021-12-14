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

<i18n lang="json">
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
import {
  computed,
  defineComponent,
  ref,
  useRouter,
} from '@nuxtjs/composition-api'

import { useSongList } from '~/composables/useSongApi'

export default defineComponent({
  fetchOnServer: false,
  setup() {
    // Data
    const term = ref('')

    // Computed
    const { songs } = useSongList()
    const filtered = computed(() =>
      term.value.trim()
        ? songs.value.filter(
            s =>
              s.name.toUpperCase().includes(term.value.toUpperCase()) ||
              s.nameKana.includes(term.value.toUpperCase()) ||
              s.artist.toUpperCase().includes(term.value.toUpperCase())
          )
        : []
    )

    // Method
    const router = useRouter()
    const move = ({ id }: Pick<Api.SongListData, 'id'>) =>
      router.push(`/songs/${id}`)

    return { term, filtered, move }
  },
})
</script>
