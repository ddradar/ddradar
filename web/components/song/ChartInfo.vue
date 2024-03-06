<script setup lang="ts">
import type { CourseChartSchema, StepChartSchema } from '@ddradar/core'
import { difficultyMap, playStyleMap } from '@ddradar/core'

import type { AccordionItem } from '#ui/types'

const props = defineProps<{ chart: CourseChartSchema | StepChartSchema }>()

const { t } = useI18n()
const title = computed(() => {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const playStyleText = playStyleMap.get(props.chart.playStyle)!
  const difficultyName = difficultyMap.get(props.chart.difficulty)!
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const shortPlayStyle = `${playStyleText[0]}P` as 'SP' | 'DP'
  return `${shortPlayStyle}-${difficultyName} (${props.chart.level})` as const
})
const color = computed(() => getChartColor(props.chart.difficulty))
const items = computed<AccordionItem[]>(() => [
  { label: t('score'), slot: 'score' },
  { label: t('chart'), slot: 'chart' },
  ...(isCourseChart(props.chart)
    ? [{ label: t('course'), slot: 'course' }]
    : []),
])
</script>

<template>
  <UCard
    :ui="{ body: { base: '', padding: 'px-0 py-2 sm:px-0 sm:py-2' } }"
    :color="color"
  >
    <template #header>
      {{ title }}
    </template>
    <UAccordion :color="color" :items="items">
      <template #chart>
        <ul>
          <li><em>Notes</em>: {{ chart.notes }}</li>
          <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
          <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
        </ul>
      </template>
    </UAccordion>
  </UCard>
</template>

<i18n lang="json">
{
  "ja": {
    "score": "スコアランキング",
    "chart": "譜面情報",
    "course": "コース曲目"
  },
  "en": {
    "score": "Score Board",
    "chart": "Chart Info",
    "course": "Course Order"
  }
}
</i18n>
