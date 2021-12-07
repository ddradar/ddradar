/* istanbul ignore file */

import {
  Chart,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'

Chart.register(
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Filler,
  Tooltip
)
