<template>
  <b-tooltip :label="clearStatus">
    <span class="tag" :class="tagClass">{{ score }}</span>
  </b-tooltip>
</template>

<script lang="ts">
import { Score } from '@ddradar/core'
import type { PropType } from '@nuxtjs/composition-api'
import { computed, defineComponent } from '@nuxtjs/composition-api'

const lampClassMap = new Map([
  [0, 'is-dark'],
  [1, 'is-challenge'],
  [2, 'is-primary'],
  [3, 'is-difficult'],
  [4, 'is-beginner'],
  [5, 'is-expert'],
  [6, 'is-basic'],
  [7, 'is-white'],
] as const)

export default defineComponent({
  props: {
    lamp: { type: Number as PropType<Score.ClearLamp>, required: true },
    score: { type: Number, required: true },
  },
  setup(props) {
    // Computed
    const clearStatus = computed(() => Score.clearLampMap.get(props.lamp))
    const tagClass = computed(() => lampClassMap.get(props.lamp))

    return { clearStatus, tagClass }
  },
})
</script>
