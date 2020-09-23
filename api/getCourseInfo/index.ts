import type { Context } from '@azure/functions'

import type { CourseSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: CourseSchema[]
): Promise<NotFoundResult | SuccessResult<CourseSchema>> {
  if (!documents || documents.length !== 1) {
    const id: string = context.bindingData.id
    return {
      status: 404,
      body: `Not found course that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: documents[0],
  }
}
