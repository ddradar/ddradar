import type { Context } from '@azure/functions'

import { CourseSchema, fetchCourseInfo } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<CourseSchema>> {
  const id: string = context.bindingData.id

  const course = await fetchCourseInfo(id)

  if (!course) {
    return {
      status: 404,
      body: `Not found course that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: course,
  }
}
