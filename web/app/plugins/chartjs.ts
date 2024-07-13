import { Chart as ChartJS, registerables } from 'chart.js'

export default defineNuxtPlugin(() => {
  ChartJS.register(...registerables)
})
