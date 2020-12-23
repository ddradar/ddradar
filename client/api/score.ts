import type { ScoreBody, ScoreInfo, ScoreListBody } from '@core/api/score'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "Get Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getChartScore
 */
export function getChartScore(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4,
  scope?: 'private' | 'medium' | 'full'
) {
  const query = scope ? `?scope=${scope}` : ''
  return $http.$get<ScoreInfo[]>(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}${query}`
  )
}

/**
 * Call "Post Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getChartScore
 */
export function postChartScore(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4,
  score: ScoreBody
) {
  return $http.$post(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}`,
    score
  )
}

/**
 * Call "Delete Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/deleteChartScore
 */
export function deleteChartScore(
  $http: Pick<NuxtHTTPInstance, 'delete'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4
) {
  return $http.delete(`/api/v1/scores/${songId}/${playStyle}/${difficulty}`)
}

/**
 * Call "Post Song Scores" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/postSongScores
 */
export function postSongScores(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  scores: ScoreListBody[]
) {
  return $http.$post<ScoreInfo[]>(`${apiPrefix}/scores/${songId}`, scores)
}
