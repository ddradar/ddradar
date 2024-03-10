import type { CourseChartSchema, Series, StepChartSchema } from '@ddradar/core'
import { seriesSet } from '@ddradar/core'

import type { SongInfo } from '~/schemas/song'

/** LEVEL 1-19 */
export const levels = [...Array(19).keys()].map(i => i + 1)

export const seriesNames = [...seriesSet] as Series[]

/** `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3 */
export const seriesIndexes = [...Array(seriesSet.size).keys()]

/** seriesIndexes that has NONSTOP/GRADE course */
export const courseSeriesIndexes = [16, 17, 18]

export function getDisplayedBPM({
  minBPM,
  maxBPM,
}: Pick<SongInfo, 'minBPM' | 'maxBPM'>) {
  if (!minBPM || !maxBPM) return '???'
  if (minBPM === maxBPM) return `${minBPM}` as const
  return `${minBPM}-${maxBPM}` as const
}

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export const getChartColor = (difficulty: number) =>
  ['blue', 'yellow', 'red', 'green', 'purple'][difficulty]

export const isCourseChart = (
  chart: CourseChartSchema | StepChartSchema
): chart is CourseChartSchema => !!(chart as CourseChartSchema).order
