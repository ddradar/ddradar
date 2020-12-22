<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
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

<i18n>
{
  "ja": {
    "title": "{series} - NONSTOP",
    "grade": "段位認定({series})",
    "nonstop": "NONSTOP({series})"
  },
  "en": {
    "title": "{series} - NONSTOP",
    "grade": "GRADE({series})",
    "nonstop": "NONSTOP({series})"
  }
}
</i18n>

<script lang="ts">
import type { CourseListData } from '@core/api/course'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getCourseList } from '~/api/course'
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

  get title() {
    const series = parseInt(this.$route.params.series, 10)
    return this.$t('title', { series: SeriesList[series] })
  }

  get pageLinks() {
    return [16, 17]
      .map(i => [
        {
          name: this.$t('nonstop', {
            series: shortenSeriesName(SeriesList[i]),
          }),
          to: `/nonstop/${i}`,
        },
        {
          name: this.$t('grade', {
            series: shortenSeriesName(SeriesList[i]),
          }),
          to: `/grade/${i}`,
        },
      ])
      .flat()
  }
}
</script>
