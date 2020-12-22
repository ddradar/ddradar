import type { CourseInfo, CourseListData } from '@ddradar/core/api/course'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

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
  return $http.$get<CourseListData[]>(`${apiPrefix}/courses`, { searchParams })
}

export function getCourseInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<CourseInfo>(`${apiPrefix}/courses/${id}`)
}
