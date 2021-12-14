import type { Api } from '@ddradar/core'
import { ref, useContext, useFetch } from '@nuxtjs/composition-api'

const apiPrefix = '/api/v1/courses'

/**
 * Use "Get Course List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/courses/
 */
export function useCourseList(series?: 16 | 17, type?: 1 | 2) {
  // Data
  const courses = ref<Api.CourseListData[]>([])

  // Lifecycle
  const { $http } = useContext()
  const { fetch } = useFetch(async () => {
    const searchParams = new URLSearchParams()
    if (series) searchParams.append('series', `${series}`)
    if (type) searchParams.append('type', `${type}`)
    courses.value = await $http.$get<Api.CourseListData[]>(`${apiPrefix}`, {
      searchParams,
    })
  })

  return { courses, fetch }
}

/**
 * Use "Get Course Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/courses__id/
 */
export function useCourseInfo(id: string) {
  // Data
  const course = ref<Api.CourseInfo | null>(null)

  // Lifecycle
  const { $http } = useContext()
  const { fetch } = useFetch(async () => {
    course.value = await $http.$get<Api.CourseInfo>(`${apiPrefix}/${id}`)
  })

  return { course, fetch }
}
