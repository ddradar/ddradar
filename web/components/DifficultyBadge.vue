<template>
  <span class="tag" :class="tagClass">
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
import type { Song } from '@ddradar/core'

import { difficultyMap } from '~/src/song'

interface ChartInfoProps {
  difficulty: Song.Difficulty
}

const props = defineProps<ChartInfoProps>()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const name = computed(() => difficultyMap.get(props.difficulty)!)
const tagClass = computed(() => `is-${name.value.toLowerCase()}`)
</script>
