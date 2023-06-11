<template>
  <OTooltip :label="clearLampMap.get(lamp)">
    <span class="tag" :class="classMap.get(lamp)">{{ score }}</span>
  </OTooltip>
</template>

<script lang="ts" setup>
import type { Score } from '@ddradar/core'
import { clearLampMap } from '@ddradar/core'

interface ScorebadgeProps {
  lamp: Score['clearLamp']
  score: Score['score']
}
const classMap = new Map([
  [0, 'is-dark'],
  [1, 'is-challenge'],
  [2, 'is-primary'],
  [3, 'is-difficult'],
  [4, 'is-beginner'],
  [5, 'is-expert'],
  [6, 'is-basic'],
  [7, 'is-white'],
] as const)

defineProps<ScorebadgeProps>()
</script>
