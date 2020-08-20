import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'
import { SongInfo, StepChart } from '~/api/song'

export type CourseList = Pick<SongInfo, 'id' | 'name' | 'series'> & {
  charts: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>[]
}

export type CourseInfo = Omit<SongInfo, 'artist' | 'charts'> & {
  charts: CourseChart[]
}

export type CourseChart = Omit<
  StepChart,
  'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
> & {
  order: CourseOrder[]
}

type CourseOrder = Pick<StepChart, 'playStyle' | 'difficulty' | 'level'> & {
  songId: string
  songName: string
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
