<script setup lang="ts">
import { defu } from 'defu'

import type { ClearStatus } from '~~/schemas/user'

interface Props {
  playStyle: ClearStatus['playStyle']
  statuses: ClearStatus[] | null
}

const props = defineProps<Props>()

const data = computed(() =>
  props.statuses
    ? Object.entries(
        props.statuses
          .filter(d => d.playStyle == props.playStyle)
          .reduce(
            (prev, curr) =>
              defu(prev, { [curr.level]: { [curr.clearLamp]: curr.count } }),
            {} as Record<
              ClearStatus['level'],
              Record<ClearStatus['clearLamp'], number>
            >
          )
      )
        .sort(d => Number(d[0]))
        .map(d => ({ level: d[0], ...d[1] }))
    : []
)
</script>

<template>
  <UTable :rows="data"></UTable>
</template>
