import type { Series } from '@ddradar/core'
import { seriesSet } from '@ddradar/core'

import type { SongInfo } from '~/schemas/song'

/** LEVEL 1-19 */
export const levels = [...Array(19).keys()].map(i => i + 1)

export const seriesNames = [...seriesSet] as Series[]

/** `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `19`: Dance Dance Revolution WORLD */
export const seriesIndexes = [...Array(seriesSet.size).keys()]

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
