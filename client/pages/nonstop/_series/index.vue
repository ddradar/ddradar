<template>
  <section class="section">
    <h1 class="title">{{ $t('title', { series: title }) }}</h1>
    <div class="buttons">
      <b-button
        v-for="link in pageLinks"
        :key="link.to"
        :to="link.to"
        type="is-info"
        tag="nuxt-link"
        :disabled="link.to === $route.path"
        :outlined="link.to === $route.path"
      >
        {{ $t(link.key, { series: link.series }) }}
      </b-button>
    </div>
    <course-list :courses="courses" :loading="$fetchState.pending" />
  </section>
</template>

<i18n lang="json">
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
import { Song } from '@ddradar/core'
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import { shortenSeriesName } from '~/api/song'
import CourseList from '~/components/pages/courses/CourseList.vue'
import { useCourseList } from '~/composables/useCourseApi'

export default defineComponent({
  name: 'NonstopListPage',
  components: { CourseList },
  fetchOnServer: false,
  validate: ({ params }) => params.series === '16' || params.series === '17',
  setup() {
    const seriesList = [...Song.seriesSet]
    const { params } = useContext()

    // Computed
    const series = computed(() => parseInt(params.value.series, 10) as 16 | 17)
    const title = computed(() => seriesList[series.value])
    const pageLinks = computed(() =>
      [16, 17]
        .flatMap(i =>
          (['nonstop', 'grade'] as const).map(type => [i, type] as const)
        )
        .map(d => ({
          key: d[1],
          series: shortenSeriesName(seriesList[d[0]]),
          to: `/${d[1]}/${d[0]}` as const,
        }))
    )

    // Data
    const { courses } = useCourseList(series.value, 1)

    // Lifecycle
    useMeta(() => ({ title: title.value as string }))

    return { courses, title, pageLinks }
  },
  head: {},
})
</script>
