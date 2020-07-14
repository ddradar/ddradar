<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <chart-list :charts="charts" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import ChartList from '~/components/shared/ChartList.vue'
import { ChartInfo } from '~/types/api/song'

@Component({ fetchOnServer: false, components: { ChartList } })
export default class DoubleLevelPage extends Vue {
  /** Chart list */
  charts: ChartInfo[] = []

  /** level expected [1-20] */
  validate({ params }: Pick<Context, 'params'>) {
    const level = parseInt(params.level, 10)
    return /^\d{1,2}$/.test(params.level) && level >= 1 && level <= 20
  }

  /** Get chart list from API */
  async fetch() {
    const i = this.$route.params.level
    const charts = await this.$http.$get<ChartInfo[]>(`/api/v1/charts/2/${i}`)
    this.charts = charts
  }

  /** Page title */
  get title() {
    return `DOUBLE ${this.$route.params.level}`
  }
}
</script>
