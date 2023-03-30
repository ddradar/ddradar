<template>
  <Radar :data="chartData" :options="chartOptions" />
</template>

<script lang="ts" setup>
import type { Database } from '@ddradar/core'
import type { ChartData, ChartOptions } from 'chart.js'
import { Radar } from 'vue-chartjs'

const props = defineProps<{ radar: Database.GrooveRadar }>()

const chartData: ChartData<'radar'> = {
  labels: ['STREAM', 'CHAOS', 'FREEZE', 'AIR', 'VOLTAGE'],
  datasets: [
    {
      label: '',
      backgroundColor: 'rgba(0, 192, 192, 0.5)',
      borderColor: 'rgba(0, 192, 192, 0.5)',
      data: [
        props.radar.stream,
        props.radar.chaos,
        props.radar.freeze,
        props.radar.air,
        props.radar.voltage,
      ],
    },
  ],
}
const chartOptions: ChartOptions<'radar'> = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    r: { beginAtZero: true, max: 200, min: 0, ticks: { stepSize: 20 } },
  },
}
</script>
