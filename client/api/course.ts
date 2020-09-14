import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'
import { SongInfo, StepChart } from '~/api/song'

/**
 * Object type returned by `/api/v1/courses`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCourseList/README.md
 */
export type CourseList = Pick<SongInfo, 'id' | 'name' | 'series'> & {
  charts: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>[]
}

type CourseOrder = Pick<StepChart, 'playStyle' | 'difficulty' | 'level'> & {
  songId: string
  songName: string
}

export type CourseChart = Omit<
  StepChart,
  'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
> & {
  order: CourseOrder[]
}

/**
 * Object type returned by `/api/v1/courses/:id`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCourseInfo/README.md
 */
export type CourseInfo = Omit<SongInfo, 'artist' | 'charts'> & {
  charts: CourseChart[]
}

export function getCourseType(type: number) {
  return type === 1 ? 'NONSTOP' : type === 2 ? '段位認定' : ''
}

export function getCourseList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  series?: 16 | 17,
  type?: 1 | 2
) {
  const searchParams = new URLSearchParams()
  if (series) searchParams.append('series', `${series}`)
  if (type) searchParams.append('type', `${type}`)
  return $http.$get<CourseList[]>(`${apiPrefix}/courses`, { searchParams })
}

export function getCourseInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<CourseInfo>(`${apiPrefix}/courses/${id}`)
}
