import type { Series } from '@ddradar/db-definitions'
import { playStyleMap, seriesSet } from '@ddradar/db-definitions'

import type { ChartInfo } from '~~/server/api/v1/charts/[style]/[level].get'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'

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

export function getChartTitle({
  playStyle,
  difficulty,
  level,
}: Pick<ChartInfo, 'playStyle' | 'difficulty' | 'level'>) {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const playStyleText = playStyleMap.get(playStyle)!
  const difficultyName = difficultyMap.get(difficulty)!
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const shortPlayStyle = `${playStyleText[0]}P` as 'SP' | 'DP'
  return `${shortPlayStyle}-${difficultyName} (${level})` as const
}

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}
