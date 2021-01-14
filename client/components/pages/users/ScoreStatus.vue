<template>
  <reactive-doughnut :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script lang="ts">
import type { ScoreStatus } from '@core/api/user'
import { DanceLevel, danceLevelSet } from '@core/db/scores'
import type { ChartData, ChartOptions } from 'chart.js'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import ReactiveDoughnut from '~/components/shared/ReactiveDoughnut'

@Component({ components: { ReactiveDoughnut } })
export default class ScoreStatusComponent extends Vue {
  @Prop({ type: String, default: null })
  readonly title!: string | null

  @Prop({ type: Array, default: () => [] })
  readonly statuses!: Pick<ScoreStatus, 'rank' | 'count'>[]

  get chartOptions(): ChartOptions {
    return {
      title: { display: !!this.title, text: this.title ?? '' },
      legend: { display: false },
      responsive: true,
    }
  }

  get chartData(): ChartData {
    const levels: string[] = [...danceLevelSet]
    const sorted = this.statuses.sort(
      (l, r) =>
        levels.findIndex(d => d === r.rank) -
        levels.findIndex(d => d === l.rank)
    ) // ORDER BY rank DESC

    return {
      labels: sorted.map(d =>
        danceLevelSet.has(d.rank as DanceLevel) ? d.rank : 'NoPlay'
      ),
      datasets: [
        {
          data: sorted.map(d => d.count),
        },
      ],
    }
  }
}
</script>
