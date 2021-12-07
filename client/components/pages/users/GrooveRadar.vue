<template>
  <RadarChart :chart-data="data" :options="options" />
</template>

<script lang="ts">
/* istanbul ignore file */

import type { Song } from '@ddradar/core'
import type { PropType } from '@nuxtjs/composition-api'
import { defineComponent } from '@nuxtjs/composition-api'
import type { ChartData, ChartOptions } from 'chart.js'
import { RadarChart } from 'vue-chart-3'

export default defineComponent({
  components: { RadarChart },
  props: {
    chart: { type: Object as PropType<Song.GrooveRadar | null>, default: null },
  },
  setup(props) {
    const data: ChartData<'radar'> = {
      labels: ['STREAM', 'CHAOS', 'FREEZE', 'AIR', 'VOLTAGE'],
      datasets: [
        {
          label: 'data',
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          borderColor: 'rgba(0, 192, 192, 0.5)',
          data: props.chart
            ? [
                props.chart.stream,
                props.chart.chaos,
                props.chart.freeze,
                props.chart.air,
                props.chart.voltage,
              ]
            : [],
        },
      ],
    }
    const options: ChartOptions<'radar'> = {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        r: { beginAtZero: true, max: 200, min: 0, ticks: { stepSize: 20 } },
      },
    }

    return { data, options }
  },
})
</script>
