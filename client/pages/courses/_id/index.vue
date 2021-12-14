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
import { Song } from '@ddradar/core'
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import { getDisplayedBPM } from '~/api/song'
import OrderDetail from '~/components/pages/courses/OrderDetail.vue'
import { useCourseInfo } from '~/composables/useCourseApi'

export default defineComponent({
  name: 'CourseDetailPage',
  components: { OrderDetail },
  validate: ({ params }) => Song.isValidId(params.id),
  setup() {
    const { params } = useContext()

    // Data
    const { course } = useCourseInfo(params.value.id)

    // lifecycle
    useMeta(() => ({ title: course.value?.name }))

    // Computed
    const useChart = (style: Song.PlayStyle) =>
      computed(
        () => course.value?.charts.filter(c => c.playStyle === style) ?? []
      )
    const singleCharts = useChart(1)
    const doubleCharts = useChart(2)
    const displayedBPM = computed(() =>
      course.value
        ? getDisplayedBPM(course.value)
        : /* istanbul ignore next */ '???'
    )

    return {
      course,
      singleCharts,
      doubleCharts,
      displayedBPM,
    }
  },
  head: {},
})
</script>
