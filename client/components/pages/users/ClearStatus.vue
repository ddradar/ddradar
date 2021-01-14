<template>
  <reactive-radar :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script lang="ts">
import type { ClearStatus } from '@core/api/user'
import { ClearLamp, clearLampMap } from '@core/db/scores'
import type { ChartData, ChartOptions } from 'chart.js'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import ReactiveDoughnut from '~/components/shared/ReactiveDoughnut'

@Component({ components: { ReactiveDoughnut } })
export default class ClearStatusComponent extends Vue {
  @Prop({ type: String, default: null })
  readonly title!: string | null

  @Prop({ type: Array, default: () => [] })
  readonly statuses!: Pick<ClearStatus, 'clearLamp' | 'count'>[]

  get chartOptions(): ChartOptions {
    return {
      title: { display: !!this.title, text: this.title ?? '' },
      legend: { display: false },
      responsive: true,
    }
  }

  get chartData(): ChartData {
    return {
      labels: this.statuses.map(
        d => clearLampMap.get(d.clearLamp as ClearLamp) ?? 'NoPlay'
      ),
      datasets: [
        {
          data: this.statuses.map(d => d.count),
          backgroundColor: this.statuses.map(d =>
            this.getBackgroundColor(d.clearLamp)
          ),
        },
      ],
    }
  }

  getBackgroundColor(lamp: ClearLamp | -1) {
    const map = new Map<ClearLamp | -1, string>([
      [-1, 'hsl(0, 0%, 71%)'], // $grey-light
      [0, 'hsl(0, 0%, 29%)'], // $grey-dark
      [1, 'hsl(271, 100%, 71%)'], // $purple
      [2, 'hsl(14, 100%, 53%)'], // $orange
      [3, 'hsl(348, 86%, 61%)'], // $red
      [4, 'hsl(204, 71%, 53%)'], // $cyan
      [5, 'hsl(141, 53%, 53%)'], // $green
      [6, 'hsl(48, 100%, 67%)'], // $yellow
      [7, 'hsl(0, 0%, 100%)'], // $white
    ])
    return map.get(lamp)!
  }
}
</script>
