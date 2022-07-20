<template>
  <section class="section">
    <h1 class="title">{{ course.name }}</h1>
    <h2 class="subtitle">{{ course.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
    <div class="content columns is-multiline">
      <ChartInfo v-for="(chart, i) in singleCharts" :key="i" :chart="chart" />
    </div>
    <div class="content columns is-multiline">
      <ChartInfo v-for="(chart, i) in doubleCharts" :key="i" :chart="chart" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useFetch, useRoute } from '#app'
import type { CourseInfo } from '~/server/api/v1/courses/[id].get'
import { getDisplayedBPM } from '~/src/song'

const route = useRoute()
const { data: course } = await useFetch<CourseInfo>(
  `/api/v1/courses/${route.params.id}`
)

const displayedBPM = computed(() => getDisplayedBPM(course.value))
const singleCharts = computed(() =>
  course.value.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  course.value.charts.filter(c => c.playStyle === 2)
)
</script>
