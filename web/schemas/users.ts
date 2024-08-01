import type { User } from '@ddradar/core'
import { userSchema } from '@ddradar/core'
import { z } from 'zod'

/** GET `/api/v2/users` expected queries */
export const listQuerySchema = z.object({
  name: z.ostring(),
  area: z.coerce
    .number()
    .pipe(userSchema.shape.area)
    .optional()
    .catch(undefined),
  code: z.coerce
    .number()
    .pipe(userSchema.shape.code)
    .optional()
    .catch(undefined),
})

/** GET `/api/v2/users`, `/api/v2/users/[id]` response type */
export type UserInfo = Omit<User, 'isPublic'>

/** `/api/v2/users/[id]/*` expected router params */
export const routerParamsSchema = userSchema.pick({ id: true })

/** GET `/api/v2/users/[id]/exists` response type */
export type ExistsUser = Pick<User, 'id'> & {
  /** User exists or not */
  exists: boolean
}
