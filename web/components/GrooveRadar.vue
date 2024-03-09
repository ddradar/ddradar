<template>
  <Radar :data="chartData" :options="chartOptions" />
</template>

<script lang="ts" setup>
import type { ScoreSchema } from '@ddradar/core'
import type { ChartData, ChartOptions } from 'chart.js'
import { Radar } from 'vue-chartjs'

type GrooveRadar = Exclude<ScoreSchema['radar'], undefined | null>
const props = withDefaults(
  defineProps<{ radar: GrooveRadar; color?: string; ticks?: boolean }>(),
  {
    color: 'rgba(0, 192, 192, 0.5)',
    ticks: false,
  }
)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed<ChartData<'radar'>>(() => ({
  labels: ['STREAM', 'CHAOS', 'FREEZE', 'AIR', 'VOLTAGE'],
  datasets: [
    {
      label: '',
      backgroundColor: props.color,
      borderColor: props.color,
      data: [
        props.radar.stream,
        props.radar.chaos,
        props.radar.freeze,
        props.radar.air,
        props.radar.voltage,
      ],
    },
  ],
}))
const chartOptions = computed<ChartOptions<'radar'>>(() => ({
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    r: {
      beginAtZero: true,
      max: 200,
      min: 0,
      ticks: {
        display: props.ticks,
        stepSize: 20,
        color: isDark.value ? 'rgba(255,255,255,0.3)' : undefined,
        backdropColor: 'rgba(0,0,0,0)',
      },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.3)' : undefined },
      angleLines: { color: isDark.value ? 'rgba(255,255,255,0.3)' : undefined },
    },
  },
}))
</script>
