import type { RequestEvent } from 'nuxt/server'
import { getRouterParams, createError } from 'nuxt/server'
import type { ZodMiniObject } from 'zod/mini'
import type { $ZodType, $ZodTypeInternals } from 'zod/v4/core'

export function getValidatedParams<
  T extends Readonly<
    Record<
      string,
      $ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>
    >
  >,
>(schema: ZodMiniObject<T>, event: RequestEvent) {
  const params = schema.safeParse(getRouterParams(event, { decode: true }))
  if (!params.success)
    throw createError({ status: 400, statusText: 'Bad Request' })
  return params.data
}
