<template>
  <reactive-radar :chart-data="chartData" />
</template>

<script lang="ts">
import type { ChartData, ChartTooltipItem } from 'chart.js'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import type { StepChart } from '~/api/song'
import ReactiveRadar from '~/components/shared/ReactiveRadar'

type GrooveRadar = Pick<
  StepChart,
  'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
>

@Component({ components: { ReactiveRadar } })
export default class GrooveRadarComponent extends Vue {
  @Prop({ type: Object, default: null })
  readonly chart!: GrooveRadar | null

  get chartOptions() {
    return {
      legend: { display: false },
      responsive: true,
      scale: { ticks: { beginAtZero: true, max: 200, min: 0, stepSize: 20 } },
      tooltips: {
        enabled: true,
        callbacks: {
          label: (item: ChartTooltipItem, data: ChartData) =>
            this.renderLabel(item, data),
        },
      },
    }
  }

  get chartData(): ChartData {
    return {
      labels: ['STREAM', 'CHAOS', 'FREEZE', 'AIR', 'VOLTAGE'],
      datasets: [
        {
          label: 'data',
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          borderColor: 'rgba(0, 192, 192, 0.5)',
          data: this.chart
            ? [
                this.chart.stream,
                this.chart.chaos,
                this.chart.freeze,
                this.chart.air,
                this.chart.voltage,
              ]
            : [],
        },
      ],
    }
  }

  renderLabel(
    { index }: Pick<ChartTooltipItem, 'index'>,
    { labels }: Pick<ChartData, 'labels'>
  ) {
    if (index === undefined || labels === undefined) return ''
    const dataSet = labels[index]
    return Array.isArray(dataSet) ? dataSet[0] : dataSet
  }
}
</script>
