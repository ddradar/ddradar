import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export function getChartTitle({
  playStyle,
  difficulty,
  level,
}: Pick<Api.ChartInfo, 'playStyle' | 'difficulty' | 'level'>) {
  const shortPlayStyle = `${Song.playStyleMap.get(playStyle)![0]}P` as
    | 'SP'
    | 'DP'
  const difficultyName = Song.difficultyMap.get(difficulty)!
  return `${shortPlayStyle}-${difficultyName} (${level})` as const
}

export function getDisplayedBPM({
  minBPM,
  maxBPM,
}: Pick<Api.SongInfo, 'minBPM' | 'maxBPM'>) {
  if (!minBPM || !maxBPM) return '???'
  if (minBPM === maxBPM) return `${minBPM}` as const
  return `${minBPM}-${maxBPM}` as const
}

/**
 * Call "Get Song Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__id/
 */
export function getSongInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<Api.SongInfo>(`${apiPrefix}/songs/${id}`)
}

/**
 * Call "Search Song" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs--get/
 */
export function searchSong(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  nameIndex?: number,
  seriesIndex?: number
) {
  const searchParams = new URLSearchParams()
  if (nameIndex !== undefined) searchParams.append('name', `${nameIndex}`)
  if (seriesIndex !== undefined) searchParams.append('series', `${seriesIndex}`)
  return $http.$get<Api.SongListData[]>(`${apiPrefix}/songs`, { searchParams })
}

/**
 * Call "Post Song Information" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs--post/
 */
export function postSongInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: Api.SongInfo
) {
  return $http.$post<Api.SongInfo>(`${apiPrefix}/songs`, body)
}
