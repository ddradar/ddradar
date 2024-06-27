<script setup lang="ts">
import type { CourseChartSchema, StepChartSchema } from '@ddradar/core'
import { difficultyMap, playStyleMap } from '@ddradar/core'

import type { AccordionItem } from '#ui/types'

const props = defineProps<{ chart: CourseChartSchema | StepChartSchema }>()

const { t } = useI18n()
const isCourse = computed(() => isCourseChart(props.chart))
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
  ...(isCourse.value ? [{ label: t('course'), slot: 'course' }] : []),
])
</script>

<template>
  <UAccordion :color="color" :items="items">
    <template #chart>
      <div class="grid grid-cols-2 h-300">
        <div>
          <GrooveRadar v-if="!isCourse" :radar="chart as StepChartSchema" />
        </div>
        <div class="m-2">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
            <br />
            <li v-if="!isCourse">
              <em>Stream</em>: {{ (chart as StepChartSchema).stream }}
            </li>
            <li v-if="!isCourse">
              <em>Voltage</em>: {{ (chart as StepChartSchema).voltage }}
            </li>
            <li v-if="!isCourse">
              <em>Air</em>: {{ (chart as StepChartSchema).air }}
            </li>
            <li v-if="!isCourse">
              <em>Freeze</em>: {{ (chart as StepChartSchema).freeze }}
            </li>
            <li v-if="!isCourse">
              <em>Chaos</em>: {{ (chart as StepChartSchema).chaos }}
            </li>
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
