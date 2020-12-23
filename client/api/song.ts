import type { ChartInfo, SongInfo, SongListData } from '@core/api/song'
import type { Difficulty, PlayStyle } from '@core/db/songs'
import { difficultyMap, playStyleMap } from '@core/db/songs'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export function getPlayStyleName(playStyle: number) {
  return playStyleMap.get(playStyle as PlayStyle) ?? 'UNKNOWN'
}

export function getDifficultyName(difficulty: number) {
  return difficultyMap.get(difficulty as Difficulty) ?? 'UNKNOWN'
}

/**
 * Call "Get Song Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getSongInfo
 */
export function getSongInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<SongInfo>(`${apiPrefix}/songs/${id}`)
}

/**
 * Call "Search Song by Name" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/searchSongByName
 */
export function searchSongByName(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  nameIndex: number
) {
  return $http.$get<SongListData[]>(`${apiPrefix}/songs/name/${nameIndex}`)
}

/**
 * Call "Search Song by Series" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/searchSongBySeries
 */
export function searchSongBySeries(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  series: number
) {
  return $http.$get<SongListData[]>(`${apiPrefix}/songs/series/${series}`)
}

/**
 * Call "Search Charts" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/searchCharts
 */
export function searchCharts(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  playStyle: PlayStyle,
  level: number
) {
  return $http.$get<ChartInfo[]>(`${apiPrefix}/charts/${playStyle}/${level}`)
}
