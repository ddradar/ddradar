import type { Context } from '@azure/functions'

import type { CourseSchema } from '../db/songs'
import { NotFoundResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [course]: CourseSchema[]
): Promise<NotFoundResult | SuccessResult<CourseSchema>> {
  if (!course) {
    const body = `Not found course that id: "${bindingData.id}"`
    return { status: 404, body }
  }

  return new SuccessResult(course)
}
