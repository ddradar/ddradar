<template>
  <span class="tag" :class="tagClass">
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
import type { Difficulty } from '@ddradar/db-definitions'
import { difficultyMap } from '@ddradar/db-definitions'

interface ChartInfoProps {
  difficulty: Difficulty
}

const props = defineProps<ChartInfoProps>()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const name = computed(() => difficultyMap.get(props.difficulty)!)
const tagClass = computed(() => `is-${name.value.toLowerCase()}`)
</script>
