<template>
  <section class="section">
    <h1 class="title">{{ seriesTitle }} - 段位認定</h1>
    <course-list :courses="courses" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { CourseList as CourseListData, getCourseList } from '~/api/course'
import { SeriesList } from '~/api/song'
import CourseList from '~/components/pages/courses/CourseList.vue'

@Component({ components: { CourseList }, fetchOnServer: false })
export default class GradeListPage extends Vue {
  /** Course List from API */
  courses: CourseListData[] = []

  validate({ params }: Pick<Context, 'params'>) {
    return params.series === '16' || params.series === '17'
  }

  /** Get Course List from API */
  async fetch() {
    const series = parseInt(this.$route.params.series, 10) as 16 | 17
    this.courses = await getCourseList(this.$http, series, 2)
  }

  get seriesTitle() {
    const series = parseInt(this.$route.params.series, 10)
    return SeriesList[series]
  }
}
</script>
