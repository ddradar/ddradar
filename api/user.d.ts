import { UserSchema } from './db'

export type User = Pick<UserSchema, 'name' | 'area' | 'code'> & {
  /** User id (used for user page URL) */
  id: string
}
