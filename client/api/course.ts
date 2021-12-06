import type { Api } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function getCourseType(type: number) {
  return type === 1 ? 'NONSTOP' : type === 2 ? '段位認定' : ''
}

/**
 * Call "Get Course Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/courses__id/
 */
export function getCourseInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<Api.CourseInfo>(`${apiPrefix}/courses/${id}`)
}
