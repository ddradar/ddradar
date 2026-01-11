import type { apiTokenSchema, userSchema } from '#shared/schemas/user'

/** User info */
export type UserInfo = ZodInfer<typeof userSchema>
/** Generated token info (excepts auth fields) */
export type ApiToken = ZodInfer<typeof apiTokenSchema>

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
