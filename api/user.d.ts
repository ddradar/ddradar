import { UserSchema } from './db'

export type User = Pick<UserSchema, 'id' | 'name' | 'area' | 'code'>
