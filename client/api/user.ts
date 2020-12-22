import type { CurrentUserInfo, ExistsUser, UserInfo } from '@core/api/user'
import { areaCodeSet } from '@core/db/users'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'
import type { UserScore } from '~/api/score'
import type { StepChart } from '~/api/song'

export type ClearStatus = Pick<
  UserScore,
  'playStyle' | 'level' | 'clearLamp'
> & { count: number }

export type ScoreStatus = Pick<UserScore, 'playStyle' | 'level' | 'rank'> & {
  count: number
}

export type GrooveRadar = Pick<
  StepChart,
  'playStyle' | 'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
>

export const areaList = [...areaCodeSet]

/**
 * Call "User Exists" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/existsUser
 */
export async function existsUser(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  const { exists } = await $http.$get<ExistsUser>(
    `${apiPrefix}/user/exists/${id}`
  )
  return exists
}

/**
 * Call "Get Current User Data" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getCurrentUser
 */
export function getCurrentUser($http: Pick<NuxtHTTPInstance, '$get'>) {
  return $http.$get<CurrentUserInfo>(`${apiPrefix}/user`)
}

/**
 * Call "Get User List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getUserList
 */
export function getUserList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  name?: string,
  area?: number,
  code?: number
) {
  const searchParams = new URLSearchParams()
  if (name) searchParams.append('name', name)
  if (area) searchParams.append('area', `${area}`)
  if (code) searchParams.append('code', `${code}`)
  return $http.$get<UserInfo[]>(`${apiPrefix}/users`, { searchParams })
}

/**
 * Call "Get User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getUserInfo
 */
export function getUserInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<UserInfo>(`${apiPrefix}/users/${id}`)
}

/**
 * Call "Get Clear Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getClearStatus
 */
export function getClearStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<ClearStatus[]>(
    `${apiPrefix}/users/${userId}/clear?playStyle=${playStyle}`
  )
}

/**
 * Call "Get Score Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getScoreStatus
 */
export function getScoreStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<ScoreStatus[]>(
    `${apiPrefix}/users/${userId}/score?playStyle=${playStyle}`
  )
}

/**
 * Call "Get Groove Radar" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getGrooveRadar
 */
export function getGrooveRadar(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<GrooveRadar[]>(
    `${apiPrefix}/users/${userId}/radar/${playStyle}`
  )
}

/**
 * Call "Post User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/postUserInfo
 */
export function postUserInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  user: CurrentUserInfo
) {
  return $http.$post<CurrentUserInfo>(`${apiPrefix}/user`, user)
}
