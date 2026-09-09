import type { infer as zodInfer } from 'zod/mini'

import type { apiTokenSchema, userSchema } from '#shared/schemas/user'

/** User info */
export type UserInfo = zodInfer<typeof userSchema>
/** Generated token info (excepts auth fields) */
export type ApiToken = zodInfer<typeof apiTokenSchema>

declare module '#auth-utils' {
  interface User {
    /** Internal user ID */
    id?: string
    /** OAuth provider name */
    provider: string
    /** User ID on the OAuth provider */
    providerId: string
    /** User roles */
    roles: string[]
    /** Display name */
    displayName: string
    /** Avatar URL on the OAuth provider */
    avatarUrl?: string
  }
}

export {}
