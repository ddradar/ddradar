import type { Context } from '@azure/functions'
import type { CourseInfo } from '@ddradar/core/api/course'
import type { CourseSchema } from '@ddradar/core/db/songs'

import { ErrorResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [course]: CourseSchema[]
): Promise<ErrorResult<404> | SuccessResult<CourseInfo>> {
  if (!course) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(course)
}
