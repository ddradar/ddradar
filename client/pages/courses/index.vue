<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <course-list :courses="courses" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { CourseList as CourseListData, getCourseList } from '~/api/course'
import { SeriesList } from '~/api/song'
import CourseList from '~/components/pages/courses/CourseList.vue'

@Component({ components: { CourseList }, fetchOnServer: false })
export default class SongBySeriesPage extends Vue {
  /** Course List from API */
  courses: CourseListData[] = []

  /** Get Course List from API */
  async fetch() {
    const series =
      this.$route.query.series === '16'
        ? 16
        : this.$route.query.series === '17'
        ? 17
        : undefined
    const type =
      this.$route.query.type === '1'
        ? 1
        : this.$route.query.type === '2'
        ? 2
        : undefined
    this.courses = await getCourseList(this.$http, series, type)
  }

  get title() {
    const series =
      this.$route.query.series === '16'
        ? SeriesList[16]
        : this.$route.query.series === '17'
        ? SeriesList[17]
        : undefined
    const type =
      this.$route.query.type === '1'
        ? '段位認定'
        : this.$route.query.type === '2'
        ? 'NONSTOP'
        : undefined
    return series && type ? `${series} - ${type}` : (series || type) ?? ''
  }
}
</script>
