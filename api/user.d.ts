import type { UserSchema } from './core/db/users'

export type User = Pick<UserSchema, 'id' | 'name' | 'area' | 'code'>
