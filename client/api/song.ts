import type { ChartInfo, SongInfo, SongListData } from '@ddradar/core/api/song'
import { difficultyMap, PlayStyle, playStyleMap } from '@ddradar/core/db/songs'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export function getChartTitle({
  playStyle,
  difficulty,
  level,
}: Pick<ChartInfo, 'playStyle' | 'difficulty' | 'level'>) {
  const shortPlayStyle = `${playStyleMap.get(playStyle)![0]}P` as 'SP' | 'DP'
  const difficultyName = difficultyMap.get(difficulty)!
  return `${shortPlayStyle}-${difficultyName} (${level})`
}

export function getDisplayedBPM({
  minBPM,
  maxBPM,
}: Pick<SongInfo, 'minBPM' | 'maxBPM'>) {
  if (!minBPM || !maxBPM) return '???'
  if (minBPM === maxBPM) return `${minBPM}`
  return `${minBPM}-${maxBPM}`
}

/**
 * Call "Get Song Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__id/
 */
export function getSongInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<SongInfo>(`${apiPrefix}/songs/${id}`)
}

/**
 * Call "Search Song by Name" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__name__id/
 */
export function searchSongByName(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  nameIndex: number
) {
  return $http.$get<SongListData[]>(`${apiPrefix}/songs/name/${nameIndex}`)
}

/**
 * Call "Search Song by Series" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__series__id/
 */
export function searchSongBySeries(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  series: number
) {
  return $http.$get<SongListData[]>(`${apiPrefix}/songs/series/${series}`)
}

/**
 * Call "Search Charts" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/charts__style__level/
 */
export function searchCharts(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  playStyle: PlayStyle,
  level: number
) {
  return $http.$get<ChartInfo[]>(`${apiPrefix}/charts/${playStyle}/${level}`)
}

/**
 * Call "Post Song Information" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs--post/
 */
export function postSongInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: SongInfo
) {
  return $http.$post<SongInfo>(`${apiPrefix}/songs`, body)
}
