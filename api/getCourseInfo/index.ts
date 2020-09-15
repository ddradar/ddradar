import type { Context } from '@azure/functions'

import { CourseSchema, fetchCourse } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<CourseSchema>> {
  const id: string = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[01689bdiloqDIOPQ]{32}$/.test(id)) {
    return { status: 404 }
  }

  const body = await fetchCourse(id)

  if (!body) {
    return {
      status: 404,
      body: `Not found course that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
