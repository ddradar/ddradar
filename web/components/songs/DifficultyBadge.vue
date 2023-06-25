<template>
  <span class="tag" :class="tagClass">
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
import type { Difficulty } from '@ddradar/core'
import { difficultyMap } from '@ddradar/core'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

const props = defineProps<DifficultyBadgeProps>()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const name = computed(() => difficultyMap.get(props.difficulty)!)
const tagClass = computed(() => `is-${name.value.toLowerCase()}`)
</script>
