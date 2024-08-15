import { userSchema } from '@ddradar/core'
import { dbUserSchema } from '@ddradar/db'
import { z } from 'zod'

export const postBodySchema = userSchema

/** GET `/api/v2/user/roles` expected body */
export const getRolesBodySchema = z.object({
  userId: dbUserSchema.shape.loginId,
})
