<template>
  <section class="section">
    <template v-if="course">
      <h1 class="title">{{ course.name }}</h1>
      <h2 class="subtitle">{{ course.series }}</h2>
      <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
      <div class="content columns is-multiline">
        <ChartInfo
          v-for="(chart, i) in singleCharts"
          :key="i"
          :song-id="course.id"
          :chart="chart"
        />
      </div>
      <div class="content columns is-multiline">
        <ChartInfo
          v-for="(chart, i) in doubleCharts"
          :key="i"
          :song-id="course.id"
          :chart="chart"
        />
      </div>
    </template>
    <template v-else>
      <OLoading active />
      <h1 class="title"><OSkeleton animated /></h1>
      <h2 class="subtitle"><OSkeleton animated /></h2>
      <h2 class="subtitle"><OSkeleton animated /></h2>
      <div class="content columns is-multiline">
        <OSkeleton animated size="large" :count="3" />
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import ChartInfo from '~~/components/songs/ChartInfo.vue'
import type { CourseInfo } from '~~/server/api/v1/courses/[id].get'
import { getDisplayedBPM } from '~~/utils/song'

const _route = useRoute()
const { data: course } = await useFetch<CourseInfo>(
  `/api/v1/courses/${_route.params.id}`
)

const displayedBPM = computed(() => getDisplayedBPM(course.value!))
const singleCharts = computed(() =>
  course.value!.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  course.value!.charts.filter(c => c.playStyle === 2)
)
</script>
