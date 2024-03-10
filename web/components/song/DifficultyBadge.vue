<script lang="ts" setup>
import type { Difficulty } from '@ddradar/core'
import { difficultyMap } from '@ddradar/core'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

const props = defineProps<DifficultyBadgeProps>()

const name = computed(() => difficultyMap.get(props.difficulty))
const color = computed(() => getChartColor(props.difficulty))
</script>

<template>
  <UBadge class="tag" :color="color">
    {{ name }}
  </UBadge>
</template>
