import type { Api, Score, Song } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "Get Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/scores__id__style__diff--get/
 */
export function getChartScore(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty,
  scope?: 'private' | 'medium' | 'full'
) {
  const query = scope ? `?scope=${scope}` : ''
  return $http.$get<Api.ScoreInfo[]>(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}${query}`
  )
}

/**
 * Call "Get User Scores" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/scores__uid/
 */
export function getUserScores(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle?: Song.PlayStyle,
  difficulty?: Song.Difficulty,
  level?: number,
  clearLamp?: Score.ClearLamp,
  rank?: Score.DanceLevel
) {
  const searchParams = new URLSearchParams()
  addParamIfDefined('style', playStyle)
  addParamIfDefined('diff', difficulty)
  addParamIfDefined('lv', level)
  addParamIfDefined('lamp', clearLamp)
  addParamIfDefined('rank', rank)
  return $http.$get<Api.ScoreList[]>(`${apiPrefix}/scores/${userId}`, {
    searchParams,
  })

  function addParamIfDefined(name: string, obj: number | string | undefined) {
    if (obj !== undefined) searchParams.set(name, obj.toString())
  }
}

/**
 * Call "Post Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/scores__id__style__diff--post/
 */
export function postChartScore(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty,
  score: Api.ScoreBody
) {
  return $http.$post(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}`,
    score
  )
}

/**
 * Call "Delete Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/scores__id__style__diff--delete/
 */
export function deleteChartScore(
  $http: Pick<NuxtHTTPInstance, 'delete'>,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
) {
  return $http.delete(`/api/v1/scores/${songId}/${playStyle}/${difficulty}`)
}

/**
 * Call "Post Song Scores" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/scores__id--post/
 */
export function postSongScores(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  scores: Api.ScoreListBody[]
) {
  return $http.$post<Api.ScoreInfo[]>(`${apiPrefix}/scores/${songId}`, scores)
}
