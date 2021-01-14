import { ChartData, ChartOptions } from 'chart.js'
import { Component, mixins as Mixins, Prop } from 'nuxt-property-decorator'
import { Doughnut, mixins } from 'vue-chartjs'

@Component
export default class ReactiveDoughnut extends Mixins(
  Doughnut,
  mixins.reactiveProp
) {
  @Prop({ type: Object, required: true })
  readonly chartData!: ChartData

  @Prop({ type: Object, default: null })
  readonly chartOptions!: ChartOptions

  mounted() {
    this.renderChart(this.chartData, this.chartOptions)
  }
}
