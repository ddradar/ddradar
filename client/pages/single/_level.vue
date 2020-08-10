<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <chart-list :charts="charts" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { ChartInfo, searchCharts } from '~/api/song'
import ChartList from '~/components/pages/ChartList.vue'

@Component({ fetchOnServer: false, components: { ChartList } })
export default class SingleLevelPage extends Vue {
  /** Chart list */
  charts: ChartInfo[] = []

  /** level expected [1-20] */
  validate({ params }: Pick<Context, 'params'>) {
    const level = parseInt(params.level, 10)
    return /^\d{1,2}$/.test(params.level) && level >= 1 && level <= 20
  }

  /** Get chart list from API */
  async fetch() {
    const level = parseInt(this.$route.params.level, 10)
    this.charts = await searchCharts(this.$http, 1, level)
  }

  /** Page title */
  get title() {
    return `SINGLE ${this.$route.params.level}`
  }
}
</script>
