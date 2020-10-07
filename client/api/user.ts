import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'
import type { UserScore } from '~/api/score'
import type { StepChart } from '~/api/song'

/**
 * Object type returned by `/api/v1/user`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCurrentUser/README.md
 */
export type User = {
  /** User id */
  id: string
  name: string
  area: number
  /** DDR Code */
  code?: number
  /** `true` if this user info is public, otherwize `false`. */
  isPublic: boolean
}

/**
 * Object type returned by `/api/v1/users/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getUserInfo/README.md
 */
export type UserListData = Omit<User, 'isPublic'>

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

export const areaList: Record<number, string> = {
  '0': '未指定',
  '1': '北海道',
  '2': '青森県',
  '3': '岩手県',
  '4': '宮城県',
  '5': '秋田県',
  '6': '山形県',
  '7': '福島県',
  '8': '茨城県',
  '9': '栃木県',
  '10': '群馬県',
  '11': '埼玉県',
  '12': '千葉県',
  '13': '東京都',
  '14': '神奈川県',
  '15': '新潟県',
  '16': '富山県',
  '17': '石川県',
  '18': '福井県',
  '19': '山梨県',
  '20': '長野県',
  '21': '岐阜県',
  '22': '静岡県',
  '23': '愛知県',
  '24': '三重県',
  '25': '滋賀県',
  '26': '京都府',
  '27': '大阪府',
  '28': '兵庫県',
  '29': '奈良県',
  '30': '和歌山県',
  '31': '鳥取県',
  '32': '島根県',
  '33': '岡山県',
  '34': '広島県',
  '35': '山口県',
  '36': '徳島県',
  '37': '香川県',
  '38': '愛媛県',
  '39': '高知県',
  '40': '福岡県',
  '41': '佐賀県',
  '42': '長崎県',
  '43': '熊本県',
  '44': '大分県',
  '45': '宮崎県',
  '46': '鹿児島県',
  '47': '沖縄県',
  '48': '香港',
  '49': '韓国',
  '50': '台湾',
  '51': 'アメリカ',
  '52': 'ヨーロッパ',
  '53': '海外',
  '106': 'カナダ',
  '107': 'シンガポール',
  '108': 'タイ',
  '109': 'オーストラリア',
  '110': 'ニュージーランド',
  '111': 'イギリス',
  '112': 'イタリア',
  '113': 'スペイン',
  '114': 'ドイツ',
  '115': 'フランス',
  '116': 'ポルトガル',
  '117': 'インドネシア',
  '118': 'フィリピン',
}

/**
 * Call "User Exists" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/existsUser
 */
export async function existsUser(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  type ExistsUserResult = Pick<User, 'id'> & { exists: boolean }
  const { exists } = await $http.$get<ExistsUserResult>(
    `${apiPrefix}/user/exists/${id}`
  )
  return exists
}

/**
 * Call "Get Current User Data" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getCurrentUser
 */
export function getCurrentUser($http: Pick<NuxtHTTPInstance, '$get'>) {
  return $http.$get<User>(`${apiPrefix}/user`)
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
  return $http.$get<UserListData[]>(`${apiPrefix}/users`, { searchParams })
}

/**
 * Call "Get User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getUserInfo
 */
export function getUserInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<UserListData>(`${apiPrefix}/users/${id}`)
}

/**
 * Call "Get Clear Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getClearStatus
 */
export function getClearStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<ClearStatus[]>(`${apiPrefix}/users/${id}/clear`)
}

/**
 * Call "Get Score Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getScoreStatus
 */
export function getScoreStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<ScoreStatus[]>(`${apiPrefix}/users/${id}/score`)
}

/**
 * Call "Get Groove Radar" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getGrooveRadar
 */
export function getGrooveRadar(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<GrooveRadar[]>(`${apiPrefix}/users/${id}/radar`)
}

/**
 * Call "Post User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/postUserInfo
 */
export function postUserInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  user: User
) {
  return $http.$post<User>(`${apiPrefix}/user`, user)
}
