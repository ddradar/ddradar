<script setup lang="ts">
import type { StepChart } from '@ddradar/core'
import { difficultyMap, playStyleMap } from '@ddradar/core'

import type { AccordionItem } from '#ui/types'

const props = defineProps<{ chart: StepChart }>()

const { t } = useI18n()
const title = computed(() => {
  const playStyleText = playStyleMap.get(props.chart.playStyle)!
  const difficultyName = difficultyMap.get(props.chart.difficulty)!
  const shortPlayStyle = `${playStyleText[0]}P` as 'SP' | 'DP'
  return `${shortPlayStyle}-${difficultyName} (${props.chart.level})` as const
})
const color = computed(() => getChartColor(props.chart.difficulty))
const items = computed<AccordionItem[]>(() => [
  { label: title.value, slot: 'chart' },
  { label: t('score'), slot: 'score' },
])
</script>

<template>
  <UAccordion :color="color" :items="items">
    <template #chart>
      <div class="grid grid-cols-2 h-300">
        <div class="m-2">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
            <br />
          </ul>
        </div>
      </div>
    </template>
  </UAccordion>
</template>

<i18n lang="json">
{
  "ja": {
    "score": "スコアランキング",
    "chart": "譜面情報"
  },
  "en": {
    "score": "Score Board",
    "chart": "Chart Info"
  }
}
</i18n>
