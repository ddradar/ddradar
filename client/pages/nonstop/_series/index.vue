<template>
  <section class="section">
    <h1 class="title">{{ seriesTitle }} - NONSTOP</h1>
    <div class="buttons">
      <b-button
        v-for="link in pageLinks"
        :key="link.name"
        :to="link.to"
        type="is-info"
        tag="nuxt-link"
        :disabled="link.to === $route.path"
        :outlined="link.to === $route.path"
      >
        {{ link.name }}
      </b-button>
    </div>
    <course-list :courses="courses" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { CourseList as CourseListData, getCourseList } from '~/api/course'
import { SeriesList, shortenSeriesName } from '~/api/song'
import CourseList from '~/components/pages/courses/CourseList.vue'

@Component({ components: { CourseList }, fetchOnServer: false })
export default class NonstopListPage extends Vue {
  /** Course List from API */
  courses: CourseListData[] = []

  validate({ params }: Pick<Context, 'params'>) {
    return params.series === '16' || params.series === '17'
  }

  /** Get Course List from API */
  async fetch() {
    const series = parseInt(this.$route.params.series, 10) as 16 | 17
    this.courses = await getCourseList(this.$http, series, 1)
  }

  get seriesTitle() {
    const series = parseInt(this.$route.params.series, 10)
    return SeriesList[series]
  }

  get pageLinks() {
    return [16, 17]
      .map(i => [
        {
          name: `NONSTOP(${shortenSeriesName(SeriesList[i])})`,
          to: `/nonstop/${i}`,
        },
        {
          name: `段位認定(${shortenSeriesName(SeriesList[i])})`,
          to: `/grade/${i}`,
        },
      ])
      .flat()
  }
}
</script>
