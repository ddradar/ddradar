<template>
  <section v-if="course" class="section">
    <h1 class="title">{{ course.name }}</h1>
    <h2 class="subtitle">{{ course.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>

    <div class="content columns is-multiline">
      <order-detail
        v-for="(chart, i) in singleCharts"
        :key="i"
        :course="course"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
      />
    </div>
    <div class="content columns is-multiline">
      <order-detail
        v-for="(chart, i) in doubleCharts"
        :key="i"
        :course="course"
        :chart="chart"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { CourseInfo } from '@core/api/course'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getCourseInfo } from '~/api/course'
import OrderDetail from '~/components/pages/courses/OrderDetail.vue'

@Component({ components: { OrderDetail } })
export default class CourseDetailPage extends Vue {
  course: CourseInfo | null = null

  get singleCharts() {
    return this.course?.charts.filter(c => c.playStyle === 1) ?? []
  }

  get doubleCharts() {
    return this.course?.charts.filter(c => c.playStyle === 2) ?? []
  }

  get displayedBPM() {
    if (!this.course?.minBPM || !this.course?.maxBPM) return '???'
    if (this.course?.minBPM === this.course?.maxBPM)
      return `${this.course.minBPM}`
    return `${this.course.minBPM}-${this.course.maxBPM}`
  }

  validate({ params }: Pick<Context, 'params'>) {
    return /^[01689bdiloqDIOPQ]{32}$/.test(params.id)
  }

  async asyncData({ params, $http }: Pick<Context, 'params' | '$http'>) {
    // Get course info from API
    const course = await getCourseInfo($http, params.id)
    return { course }
  }
}
</script>
